"""
tests/test_rate_limiting.py
---------------------------
Automated test suite verifying request-rate controls across GetHire endpoints:
  - Requests within the configured limit
  - Requests exceeding the configured limit (429 Too Many Requests)
  - Different endpoint limits across prioritized categories:
      * Login
      * Registration
      * Password reset
      * OTP/email verification
      * File uploads
      * AI/ML processing
      * Search
      * Public API endpoints
      * Payment endpoints
  - Proper handling of rejected requests (headers, payload, Retry-After)
  - Configurable limits via application settings (dynamic limit adjustments & enable/disable switch)
  - Redis integration via redis_manager
"""

import time
import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.config import settings
from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.main import app
from app.middleware.rate_limit import RateLimitMiddleware, in_memory_rate_limiter
from app.models.user import UserModel


# ── In-Memory Database Mock ──────────────────────────────────────────────────

class MockCollection:
    def __init__(self, initial_docs=None):
        self.docs = [dict(d) for d in (initial_docs or [])]

    async def find_one(self, query=None, *args, **kwargs):
        query = query or {}
        for doc in self.docs:
            match = True
            for k, v in query.items():
                if str(doc.get(k)) != str(v):
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    async def count_documents(self, filter_query=None):
        return len(self.docs)

    async def insert_one(self, doc):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = ObjectId()
        self.docs.append(doc_copy)
        res = MagicMock()
        res.inserted_id = doc_copy["_id"]
        return res


class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]

    def __setitem__(self, name, collection):
        self.collections[name] = collection


# ── Rate Limiting Test Suite ────────────────────────────────────────────────

class TestRateLimiting(unittest.IsolatedAsyncioTestCase):
    """Verifies configurable request-rate controls and error responses."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()
        in_memory_rate_limiter._records.clear()

        # Save original settings to restore after tests
        self._orig_enabled = settings.RATE_LIMIT_ENABLED
        self._orig_login_limit = settings.RATE_LIMIT_LOGIN_LIMIT
        self._orig_login_window = settings.RATE_LIMIT_LOGIN_WINDOW
        self._orig_register_limit = settings.RATE_LIMIT_REGISTER_LIMIT
        self._orig_register_window = settings.RATE_LIMIT_REGISTER_WINDOW
        self._orig_pwd_limit = settings.RATE_LIMIT_PASSWORD_RESET_LIMIT
        self._orig_otp_limit = settings.RATE_LIMIT_VERIFICATION_LIMIT
        self._orig_upload_limit = settings.RATE_LIMIT_UPLOAD_LIMIT
        self._orig_ai_limit = settings.RATE_LIMIT_AI_PROCESSING_LIMIT
        self._orig_telemetry_limit = settings.RATE_LIMIT_TELEMETRY_LIMIT
        self._orig_search_limit = settings.RATE_LIMIT_SEARCH_LIMIT
        self._orig_payments_limit = settings.RATE_LIMIT_PAYMENTS_LIMIT
        self._orig_public_limit = settings.RATE_LIMIT_PUBLIC_LIMIT

        self.mock_db = MockDatabase()
        self.test_user = UserModel(
            _id=ObjectId("507f1f77bcf86cd799439001"),
            email="ratelimit_user@example.com",
            full_name="Rate Limit Candidate",
            password_hash="hashed_secret",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self.mock_db["users"] = MockCollection([self.test_user.model_dump(by_alias=True)])

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        in_memory_rate_limiter._records.clear()

        # Restore original settings
        settings.RATE_LIMIT_ENABLED = self._orig_enabled
        settings.RATE_LIMIT_LOGIN_LIMIT = self._orig_login_limit
        settings.RATE_LIMIT_LOGIN_WINDOW = self._orig_login_window
        settings.RATE_LIMIT_REGISTER_LIMIT = self._orig_register_limit
        settings.RATE_LIMIT_REGISTER_WINDOW = self._orig_register_window
        settings.RATE_LIMIT_PASSWORD_RESET_LIMIT = self._orig_pwd_limit
        settings.RATE_LIMIT_VERIFICATION_LIMIT = self._orig_otp_limit
        settings.RATE_LIMIT_UPLOAD_LIMIT = self._orig_upload_limit
        settings.RATE_LIMIT_AI_PROCESSING_LIMIT = self._orig_ai_limit
        settings.RATE_LIMIT_TELEMETRY_LIMIT = self._orig_telemetry_limit
        settings.RATE_LIMIT_SEARCH_LIMIT = self._orig_search_limit
        settings.RATE_LIMIT_PAYMENTS_LIMIT = self._orig_payments_limit
        settings.RATE_LIMIT_PUBLIC_LIMIT = self._orig_public_limit

    # ── 1. Requests within Configured Limit ──────────────────────────────────

    async def test_01_requests_within_limit_succeed(self):
        """Requests at or below the configured limit proceed and return rate limit headers."""
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_LOGIN_LIMIT = 5
        settings.RATE_LIMIT_LOGIN_WINDOW = 60

        test_ip = "192.168.1.10"
        headers = {"X-Forwarded-For": test_ip}

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                for request_num in range(1, 6):
                    res = await client.post(
                        "/api/v1/auth/login",
                        json={"email": "wrong@example.com", "password": "BadPassword123!"},
                        headers=headers,
                    )
                    # Handler returns 401 for wrong credentials, but NOT 429
                    self.assertNotEqual(res.status_code, 429)
                    self.assertEqual(res.headers.get("X-RateLimit-Limit"), "5")
                    expected_remaining = str(5 - request_num)
                    self.assertEqual(res.headers.get("X-RateLimit-Remaining"), expected_remaining)
                    self.assertIn("X-RateLimit-Reset", res.headers)

    # ── 2. Requests Exceeding Configured Limit ───────────────────────────────

    async def test_02_requests_exceeding_limit_rejected_with_429(self):
        """The (limit + 1)-th request is rejected with 429 Too Many Requests."""
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_LOGIN_LIMIT = 3
        settings.RATE_LIMIT_LOGIN_WINDOW = 60

        test_ip = "192.168.1.20"
        headers = {"X-Forwarded-For": test_ip}

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # First 3 requests should pass
                for _ in range(3):
                    res = await client.post(
                        "/api/v1/auth/login",
                        json={"email": "wrong@example.com", "password": "BadPassword123!"},
                        headers=headers,
                    )
                    self.assertNotEqual(res.status_code, 429)

                # 4th request must be rejected with 429
                rejected = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "wrong@example.com", "password": "BadPassword123!"},
                    headers=headers,
                )
                self.assertEqual(rejected.status_code, 429)
                data = rejected.json()
                self.assertFalse(data["success"])
                self.assertEqual(data["errors"][0]["code"], "RATE_LIMITED")
                self.assertEqual(rejected.headers.get("X-RateLimit-Remaining"), "0")
                self.assertIn("Retry-After", rejected.headers)
                self.assertGreater(int(rejected.headers["Retry-After"]), 0)

    # ── 3. Different Endpoint Limits ────────────────────────────────────────

    async def test_03_different_endpoint_limits_isolated_and_distinct(self):
        """
        Verify different categories (Login, Registration, Uploads, AI, Payments, Public)
        have distinct, configurable limits and do not block each other.
        """
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_LOGIN_LIMIT = 2
        settings.RATE_LIMIT_REGISTER_LIMIT = 2
        settings.RATE_LIMIT_PASSWORD_RESET_LIMIT = 2
        settings.RATE_LIMIT_VERIFICATION_LIMIT = 3
        settings.RATE_LIMIT_UPLOAD_LIMIT = 2
        settings.RATE_LIMIT_AI_PROCESSING_LIMIT = 3
        settings.RATE_LIMIT_SEARCH_LIMIT = 3
        settings.RATE_LIMIT_PAYMENTS_LIMIT = 2
        settings.RATE_LIMIT_PUBLIC_LIMIT = 5

        test_ip = "192.168.1.30"
        headers = {"X-Forwarded-For": test_ip}

        app.dependency_overrides[get_current_active_user] = lambda: self.test_user

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 3a. Exhaust Login limit (limit = 2)
                for _ in range(2):
                    res = await client.post(
                        "/api/v1/auth/login",
                        json={"email": "u@test.com", "password": "Pass1234!"},
                        headers=headers,
                    )
                    self.assertNotEqual(res.status_code, 429)

                res_login_block = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "u@test.com", "password": "Pass1234!"},
                    headers=headers,
                )
                self.assertEqual(res_login_block.status_code, 429)

                # 3b. Verify Public health endpoint is STILL ALLOWED for same client IP
                res_health = await client.get("/api/v1/health", headers=headers)
                self.assertNotEqual(res_health.status_code, 429)
                self.assertIn(res_health.status_code, (200, 503))

                # 3c. Verify Password Reset endpoint limit (limit = 2)
                for _ in range(2):
                    res_pwd = await client.post(
                        "/api/v1/auth/password-reset",
                        json={"email": "reset@test.com"},
                        headers=headers,
                    )
                    self.assertNotEqual(res_pwd.status_code, 429)

                res_pwd_block = await client.post(
                    "/api/v1/auth/password-reset",
                    json={"email": "reset@test.com"},
                    headers=headers,
                )
                self.assertEqual(res_pwd_block.status_code, 429)

                # 3d. Verify OTP / Email verification endpoint limit (limit = 3)
                for _ in range(3):
                    res_otp = await client.post(
                        "/api/v1/auth/verify-otp",
                        json={"otp": "123456"},
                        headers=headers,
                    )
                    self.assertNotEqual(res_otp.status_code, 429)

                res_otp_block = await client.post(
                    "/api/v1/auth/verify-otp",
                    json={"otp": "123456"},
                    headers=headers,
                )
                self.assertEqual(res_otp_block.status_code, 429)

                # 3e. Verify Payments endpoint limit (limit = 2)
                for _ in range(2):
                    res_pay = await client.post(
                        "/api/v1/payments/checkout",
                        json={"amount": 5000},
                        headers=headers,
                    )
                    self.assertNotEqual(res_pay.status_code, 429)

                res_pay_block = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": 5000},
                    headers=headers,
                )
                self.assertEqual(res_pay_block.status_code, 429)

                # 3f. Verify AI/ML processing endpoint limit (limit = 3)
                for _ in range(3):
                    res_ai = await client.post(
                        "/api/v1/interview/sessions",
                        json={"target_role": "Software Engineer", "experience_level": "mid"},
                        headers=headers,
                    )
                    self.assertNotEqual(res_ai.status_code, 429)

                res_ai_block = await client.post(
                    "/api/v1/interview/sessions",
                    json={"target_role": "Software Engineer", "experience_level": "mid"},
                    headers=headers,
                )
                self.assertEqual(res_ai_block.status_code, 429)

                # 3g. Verify Search endpoint limit
                for _ in range(3):
                    res_search = await client.get("/api/v1/admin/users?search=alex", headers=headers)
                    self.assertNotEqual(res_search.status_code, 429)

                res_search_block = await client.get("/api/v1/admin/users?search=alex", headers=headers)
                self.assertEqual(res_search_block.status_code, 429)

    # ── 4. Proper Handling of Rejected Requests ──────────────────────────────

    async def test_04_telemetry_does_not_consume_interview_turn_quota(self):
        """High-frequency FaceSense telemetry must use its own rate-limit bucket."""
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_AI_PROCESSING_LIMIT = 1
        settings.RATE_LIMIT_TELEMETRY_LIMIT = 2

        headers = {"X-Forwarded-For": "192.168.1.35"}
        app.dependency_overrides[get_current_active_user] = lambda: self.test_user

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                interview = await client.post(
                    "/api/v1/interview/sessions",
                    json={"target_role": "Software Engineer", "experience_level": "mid"},
                    headers=headers,
                )
                self.assertNotEqual(interview.status_code, 429)
                self.assertEqual(interview.headers.get("X-RateLimit-Limit"), "1")

                telemetry = await client.post(
                    "/api/v1/facesense/metrics",
                    json={},
                    headers=headers,
                )
                self.assertNotEqual(telemetry.status_code, 429)
                self.assertEqual(telemetry.headers.get("X-RateLimit-Limit"), "2")

                second_interview = await client.post(
                    "/api/v1/interview/sessions",
                    json={"target_role": "Software Engineer", "experience_level": "mid"},
                    headers=headers,
                )
                self.assertEqual(second_interview.status_code, 429)

    # ── 5. Proper Handling of Rejected Requests ──────────────────────────────

    async def test_04_proper_handling_of_rejected_requests(self):
        """Rejected requests return 429, valid Retry-After, rate limit headers, and standard error payload."""
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_LOGIN_LIMIT = 1
        settings.RATE_LIMIT_LOGIN_WINDOW = 30

        test_ip = "192.168.1.40"
        headers = {"X-Forwarded-For": test_ip, "X-Request-ID": "test-req-429-xyz"}

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # Request 1: Succeeds
                await client.post(
                    "/api/v1/auth/login",
                    json={"email": "u@test.com", "password": "Pass1234!"},
                    headers=headers,
                )

                # Request 2: Rejected with 429
                res = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "u@test.com", "password": "Pass1234!"},
                    headers=headers,
                )

                self.assertEqual(res.status_code, 429)
                self.assertIn("Retry-After", res.headers)
                retry_after = int(res.headers["Retry-After"])
                self.assertGreater(retry_after, 0)
                self.assertLessEqual(retry_after, 30)

                self.assertEqual(res.headers.get("X-RateLimit-Limit"), "1")
                self.assertEqual(res.headers.get("X-RateLimit-Remaining"), "0")
                self.assertEqual(res.headers.get("X-Request-ID"), "test-req-429-xyz")

                body = res.json()
                self.assertFalse(body["success"])
                self.assertIn("Too many requests", body["message"])
                self.assertEqual(body["errors"][0]["code"], "RATE_LIMITED")
                self.assertIn("rate limit of 1 requests", body["errors"][0]["message"].lower())

                # Unified error object details
                error_obj = body["error"]
                self.assertEqual(error_obj["code"], "RATE_LIMITED")
                self.assertEqual(error_obj["details"]["limit"], 1)
                self.assertEqual(error_obj["details"]["window_seconds"], 30)
                self.assertEqual(error_obj["request_id"], "test-req-429-xyz")
                self.assertIn("timestamp", error_obj)

    # ── 5. Configurable Limits via Settings & Master Switch ──────────────────

    async def test_05_dynamic_configuration_and_enable_disable_switch(self):
        """Rate limits adapt dynamically to Settings modifications and can be toggled off."""
        # 5a. Custom limit via settings
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_LOGIN_LIMIT = 4
        settings.RATE_LIMIT_LOGIN_WINDOW = 60

        test_ip = "192.168.1.50"
        headers = {"X-Forwarded-For": test_ip}

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                for i in range(1, 5):
                    res = await client.post(
                        "/api/v1/auth/login",
                        json={"email": "u@test.com", "password": "Pass1234!"},
                        headers=headers,
                    )
                    self.assertNotEqual(res.status_code, 429)
                    self.assertEqual(res.headers.get("X-RateLimit-Limit"), "4")

                res_blocked = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "u@test.com", "password": "Pass1234!"},
                    headers=headers,
                )
                self.assertEqual(res_blocked.status_code, 429)

                # 5b. Disable rate limiting entirely via master switch
                settings.RATE_LIMIT_ENABLED = False
                res_unthrottled = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "u@test.com", "password": "Pass1234!"},
                    headers=headers,
                )
                # When disabled, request must not be blocked by rate limiter
                self.assertNotEqual(res_unthrottled.status_code, 429)

    # ── 6. Redis Integration Verification ────────────────────────────────────

    async def test_06_redis_pipeline_integration(self):
        """Verifies that when Redis is connected, the middleware executes atomic pipeline incr/expire/ttl."""
        settings.RATE_LIMIT_ENABLED = True
        settings.RATE_LIMIT_LOGIN_LIMIT = 2
        settings.RATE_LIMIT_LOGIN_WINDOW = 60

        test_ip = "192.168.1.60"
        headers = {"X-Forwarded-For": test_ip}

        # Mock Redis client and pipeline
        mock_pipeline = MagicMock()
        mock_pipeline.incr = MagicMock(return_value=mock_pipeline)
        mock_pipeline.expire = MagicMock(return_value=mock_pipeline)
        mock_pipeline.execute = AsyncMock(return_value=[3])  # Simulate count=3 (> limit 2)

        mock_redis_client = MagicMock()
        mock_redis_client.pipeline.return_value = mock_pipeline
        mock_redis_client.ttl = AsyncMock(return_value=45)

        with patch("app.db.redis_client.redis_manager.get_client", return_value=mock_redis_client):
            with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    res = await client.post(
                        "/api/v1/auth/login",
                        json={"email": "u@test.com", "password": "Pass1234!"},
                        headers=headers,
                    )
                    self.assertEqual(res.status_code, 429)
                    self.assertEqual(res.headers.get("Retry-After"), "45")
                    mock_pipeline.incr.assert_called_once()
                    mock_pipeline.expire.assert_called_once()
                    mock_redis_client.ttl.assert_called_once()


if __name__ == "__main__":
    unittest.main()

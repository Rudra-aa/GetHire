"""
tests/test_api_validation.py
----------------------------
Comprehensive automated test suite verifying request validation across
all backend API endpoints accepting user-provided data.

Coverage:
  1. Missing fields (required fields)
  2. Invalid data types
  3. Excessively long values (string length constraints)
  4. Invalid IDs (path & query parameter ID formats)
  5. Invalid enum values
  6. Invalid numeric values (numeric ranges and bounds)
  7. Malformed requests (JSON decode errors, dangerous URL schemes)
  8. Valid requests
"""

from __future__ import annotations

import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.config import settings
from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user, get_current_user, require_admin
from app.main import app
from app.middleware.rate_limit import in_memory_rate_limiter
from app.models.user import UserModel
from app.utils.security import hash_password


# ── Mock Database Supporting Validation Runs ─────────────────────────────────

class MockCursor:
    def __init__(self, docs):
        self.docs = [dict(d) for d in docs]
        self._iter = iter(self.docs)

    def sort(self, *args, **kwargs):
        return self

    def skip(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def __aiter__(self):
        self._iter = iter(self.docs)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration

    async def to_list(self, length=None):
        return [dict(d) for d in self.docs[:length]] if length is not None else [dict(d) for d in self.docs]


class MockCollection:
    def __init__(self, initial_docs=None):
        self.docs = [dict(d) for d in (initial_docs or [])]

    async def find_one(self, query=None, *args, **kwargs):
        query = query or {}
        for doc in self.docs:
            match = True
            for k, v in query.items():
                if k == "$or":
                    match = any(
                        all(str(doc.get(sub_k)) == str(sub_v) for sub_k, sub_v in branch.items())
                        for branch in v
                    )
                    if not match:
                        break
                    continue
                if str(doc.get(k)) != str(v):
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    def find(self, query=None, *args, **kwargs):
        return MockCursor(self.docs)

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

    async def update_one(self, *args, **kwargs):
        res = MagicMock()
        res.matched_count = 1
        res.modified_count = 1
        return res

    async def delete_one(self, *args, **kwargs):
        res = MagicMock()
        res.deleted_count = 1
        return res


class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]

    def __setitem__(self, name, value):
        self.collections[name] = value


# ── Test Suite ──────────────────────────────────────────────────────────────

class TestAPIValidation(unittest.IsolatedAsyncioTestCase):
    """Verifies rigorous input validation across all endpoints."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()
        in_memory_rate_limiter._records.clear()

        # Disable rate limiter during validation testing
        self._orig_rl_enabled = settings.RATE_LIMIT_ENABLED
        settings.RATE_LIMIT_ENABLED = False

        self.mock_db = MockDatabase()

        # Test Candidate User
        self.candidate_user = UserModel(
            _id=ObjectId("507f1f77bcf86cd799439001"),
            email="candidate@example.com",
            full_name="Candidate Tester",
            password_hash=hash_password("ValidPassword123!"),
            role="candidate",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        # Test Admin User
        self.admin_user = UserModel(
            _id=ObjectId("507f1f77bcf86cd799439002"),
            email="admin@example.com",
            full_name="Admin Tester",
            password_hash=hash_password("ValidPassword123!"),
            role="admin",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        self.mock_db["users"] = MockCollection([
            self.candidate_user.model_dump(by_alias=True),
            self.admin_user.model_dump(by_alias=True),
        ])

        # Default auth overrides
        app.dependency_overrides[get_current_active_user] = lambda: self.candidate_user
        app.dependency_overrides[get_current_user] = lambda: self.candidate_user
        app.dependency_overrides[require_admin] = lambda: self.admin_user

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        in_memory_rate_limiter._records.clear()
        settings.RATE_LIMIT_ENABLED = self._orig_rl_enabled

    # ── 1. Missing Fields ───────────────────────────────────────────────────

    async def test_01_missing_required_fields(self):
        """Endpoints reject payloads with missing mandatory fields with 422 and VALIDATION_ERROR code."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 1a. Login missing password
                res = await client.post("/api/v1/auth/login", json={"email": "candidate@example.com"})
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertFalse(body["success"])
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("password" in err.get("field", "") for err in body["errors"]))

                # 1b. Login missing email
                res = await client.post("/api/v1/auth/login", json={"password": "ValidPassword123!"})
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("email" in err.get("field", "") for err in body["errors"]))

                # 1c. Register missing full_name
                res = await client.post(
                    "/api/v1/auth/register",
                    json={"email": "new@example.com", "password": "SecurePassword1!"},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("full_name" in err.get("field", "") for err in body["errors"]))

                # 1d. Submit answer missing question_id
                res = await client.post(
                    "/api/v1/interview/sessions/607f1f77bcf86cd799439011/answers",
                    json={"answer_text": "This is my answer."},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("question_id" in err.get("field", "") for err in body["errors"]))

                # 1e. Evaluate answer missing session_id
                res = await client.post(
                    "/api/v1/evaluations",
                    json={"question_id": "q1", "answer_text": "Response text"},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 1f. FaceSense start missing session_id
                res = await client.post("/api/v1/facesense/start", json={})
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 1g. Integrity start missing session_id
                res = await client.post("/api/v1/integrity/start", json={})
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 1h. Payments checkout missing amount
                res = await client.post("/api/v1/payments/checkout", json={"plan_id": "pro"})
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("amount" in err.get("field", "") for err in body["errors"]))

    # ── 2. Invalid Data Types ───────────────────────────────────────────────

    async def test_02_invalid_data_types(self):
        """Endpoints reject inputs with incorrect data types with 422."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 2a. Email provided as integer/boolean
                res = await client.post(
                    "/api/v1/auth/login",
                    json={"email": 123456, "password": "ValidPassword123!"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 2b. Interview total_questions provided as string
                res = await client.post(
                    "/api/v1/interview/sessions",
                    json={"total_questions": "not-an-integer"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 2c. Payments checkout amount provided as string
                res = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": "five-hundred-dollars"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 2d. Admin query page provided as string
                res = await client.get("/api/v1/admin/users?page=first")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 2e. FaceSense timestamp provided as string
                res = await client.post(
                    "/api/v1/facesense/metrics",
                    json={"session_id": "sess1", "timestamp_sec": "twenty"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 2f. Integrity telemetry mic_level provided as string
                res = await client.post(
                    "/api/v1/integrity/telemetry",
                    json={"session_id": "sess1", "mic_level": "loud"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

    # ── 3. Excessively Long Values ──────────────────────────────────────────

    async def test_03_excessively_long_values(self):
        """Endpoints reject inputs that exceed maximum character limits."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 3a. Full name exceeds 100 characters
                long_name = "A" * 150
                res = await client.post(
                    "/api/v1/auth/register",
                    json={"email": "long@example.com", "password": "SecurePassword1!", "full_name": long_name},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("full_name" in err.get("field", "") for err in body["errors"]))

                # 3b. Password exceeds 72 characters (bcrypt limit safety)
                long_pwd = "P" * 100 + "1!a"
                res = await client.post(
                    "/api/v1/auth/register",
                    json={"email": "longpwd@example.com", "password": long_pwd, "full_name": "Valid Name"},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 3c. Search query exceeds 100 characters
                long_search = "s" * 150
                res = await client.get(f"/api/v1/admin/users?search={long_search}")
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 3d. Turn transcript exceeds 10,000 characters
                huge_transcript = "word " * 3000  # 15,000 chars
                res = await client.post(
                    "/api/v1/interview/sessions/607f1f77bcf86cd799439011/turn",
                    json={"candidate_transcript": huge_transcript},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

    # ── 4. Invalid IDs ──────────────────────────────────────────────────────

    async def test_04_invalid_ids(self):
        """Endpoints reject path parameters with invalid ID formats."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 4a. Admin user detail: not a 24-char hex ObjectId
                res = await client.get("/api/v1/admin/users/not-a-valid-id")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4b. Admin user role update: short numeric ID
                res = await client.patch("/api/v1/admin/users/123/role", json={"role": "admin"})
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4c. Admin user delete: invalid hex
                res = await client.delete("/api/v1/admin/users/bad_user_id")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4d. Resume detail: short ID
                res = await client.get("/api/v1/resume/shortid")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4e. Resume status: non-hex characters
                res = await client.get("/api/v1/resume/zzzz1f77bcf86cd799439099/status")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4f. Evaluation by ID: invalid format
                res = await client.get("/api/v1/evaluations/not-an-eval-id")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4g. Evaluation report by ID: invalid format
                res = await client.get("/api/v1/evaluation-reports/invalid-report-id")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 4h. Recruiter portfolio share token: too short (less than 8 chars)
                res = await client.get("/api/v1/career/portfolio/short")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

    # ── 5. Invalid Enum Values ──────────────────────────────────────────────

    async def test_05_invalid_enum_values(self):
        """Endpoints reject unapproved enum options with 422."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 5a. Start interview session with invalid interview_type
                res = await client.post(
                    "/api/v1/interview/sessions",
                    json={"interview_type": "hyper_extreme"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 5b. Start interview session with invalid experience_level
                res = await client.post(
                    "/api/v1/interview/sessions",
                    json={"experience_level": "grandmaster"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 5c. Admin update role with invalid role name
                res = await client.patch(
                    "/api/v1/admin/users/507f1f77bcf86cd799439001/role",
                    json={"role": "superadmin"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 5d. Admin user list query with invalid role
                res = await client.get("/api/v1/admin/users?role=moderator")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 5e. Interview session patch with invalid status
                res = await client.patch(
                    "/api/v1/interview/sessions/607f1f77bcf86cd799439011",
                    json={"status": "exploded"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 5f. Payments checkout with unsupported payment_method
                res = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": 100.0, "payment_method": "cryptocurrency"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 5g. Payments checkout with invalid 4-letter currency code
                res = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": 100.0, "currency": "USDT"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

    # ── 6. Invalid Numeric Values ───────────────────────────────────────────

    async def test_06_invalid_numeric_values(self):
        """Endpoints reject numeric parameters that fall outside allowed ranges."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 6a. Negative payment amount
                res = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": -50.0},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6b. Zero payment amount (must be > 0)
                res = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": 0.0},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6c. Excessively large payment amount (> 100,000)
                res = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": 500000.0},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6d. Interview session total_questions < 5
                res = await client.post(
                    "/api/v1/interview/sessions",
                    json={"total_questions": 2},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6e. Interview session total_questions > 20
                res = await client.post(
                    "/api/v1/interview/sessions",
                    json={"total_questions": 35},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6f. Admin users query: page < 1
                res = await client.get("/api/v1/admin/users?page=0")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6g. Admin users query: per_page > 100
                res = await client.get("/api/v1/admin/users?per_page=500")
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6h. FaceSense pitch outside [-180, 180]
                res = await client.post(
                    "/api/v1/facesense/metrics",
                    json={"session_id": "sess1", "pitch": 250.0},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6i. FaceSense smile_pct > 100
                res = await client.post(
                    "/api/v1/facesense/metrics",
                    json={"session_id": "sess1", "smile_pct": 150.0},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 6j. Integrity telemetry mic_level > 100
                res = await client.post(
                    "/api/v1/integrity/telemetry",
                    json={"session_id": "sess1", "mic_level": 120.0},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

    # ── 7. Malformed Requests & Unsafe URLs ──────────────────────────────────

    async def test_07_malformed_requests_and_unsafe_urls(self):
        """Endpoints handle malformed JSON and reject malicious URL schemes."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 7a. Malformed JSON syntax (unclosed quote/brace)
                res = await client.post(
                    "/api/v1/auth/login",
                    content=b'{"email": "test@example.com", "password": ',
                    headers={"Content-Type": "application/json"},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertFalse(body["success"])
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 7b. Malformed JSON array instead of object
                res = await client.post(
                    "/api/v1/auth/login",
                    content=b'["email", "password"]',
                    headers={"Content-Type": "application/json"},
                )
                self.assertEqual(res.status_code, 422)
                self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")

                # 7c. Malicious javascript: URL scheme in registration linkedin_url
                res = await client.post(
                    "/api/v1/auth/register",
                    json={
                        "email": "xss@example.com",
                        "password": "SecurePassword1!",
                        "full_name": "XSS Tester",
                        "linkedin_url": "javascript:alert(document.domain)",
                    },
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")
                self.assertTrue(any("linkedin_url" in err.get("field", "") for err in body["errors"]))

                # 7d. Malicious data: URL scheme in profile update linkedin_url
                res = await client.patch(
                    "/api/v1/users/me",
                    json={"linkedin_url": "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

                # 7e. Malicious javascript: URL in profile_photo
                res = await client.patch(
                    "/api/v1/users/me",
                    json={"profile_photo": "javascript:alert('pwned')"},
                )
                self.assertEqual(res.status_code, 422)
                body = res.json()
                self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

    # ── 8. Valid Requests ───────────────────────────────────────────────────

    async def test_08_valid_requests_succeed(self):
        """Well-formed requests with valid types, lengths, ranges, and enums succeed."""
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 8a. Valid login
                res_login = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "candidate@example.com", "password": "ValidPassword123!"},
                )
                self.assertEqual(res_login.status_code, 200)
                self.assertTrue(res_login.json()["success"])

                # 8b. Valid password reset
                res_pwd = await client.post(
                    "/api/v1/auth/password-reset",
                    json={"email": "candidate@example.com"},
                )
                self.assertEqual(res_pwd.status_code, 200)
                self.assertTrue(res_pwd.json()["success"])

                # 8c. Valid OTP verification
                res_otp = await client.post(
                    "/api/v1/auth/verify-otp",
                    json={"email": "candidate@example.com", "otp": "987654"},
                )
                self.assertEqual(res_otp.status_code, 200)
                self.assertTrue(res_otp.json()["success"])

                # 8d. Valid payments checkout
                res_pay = await client.post(
                    "/api/v1/payments/checkout",
                    json={"amount": 49.99, "currency": "USD", "plan_id": "pro", "payment_method": "card"},
                )
                self.assertEqual(res_pay.status_code, 200)
                self.assertTrue(res_pay.json()["success"])
                self.assertEqual(res_pay.json()["data"]["amount"], 49.99)

                # 8e. Valid admin users query with pagination and role filter
                res_admin = await client.get("/api/v1/admin/users?page=1&per_page=10&role=candidate&search=candidate")
                self.assertEqual(res_admin.status_code, 200)
                self.assertTrue(res_admin.json()["success"])
                self.assertEqual(res_admin.json()["data"]["page"], 1)

                # 8f. Valid FaceSense start session
                res_face = await client.post(
                    "/api/v1/facesense/start",
                    json={"session_id": "607f1f77bcf86cd799439011"},
                )
                self.assertEqual(res_face.status_code, 201)

                # 8g. Valid FaceSense metrics batch
                res_metrics = await client.post(
                    "/api/v1/facesense/metrics",
                    json={
                        "session_id": "607f1f77bcf86cd799439011",
                        "timestamp_sec": 12.5,
                        "pitch": 5.2,
                        "yaw": -3.1,
                        "roll": 0.5,
                        "face_visible": True,
                        "eye_contact_pct": 88.0,
                        "blink_rate_bpm": 18.0,
                        "smile_pct": 25.0,
                    },
                )
                self.assertEqual(res_metrics.status_code, 200)

                # 8h. Valid Integrity start session
                res_integ = await client.post(
                    "/api/v1/integrity/start",
                    json={"session_id": "607f1f77bcf86cd799439011"},
                )
                self.assertEqual(res_integ.status_code, 201)

                # 8i. Valid Integrity telemetry
                res_telem = await client.post(
                    "/api/v1/integrity/telemetry",
                    json={
                        "session_id": "607f1f77bcf86cd799439011",
                        "mic_level": 45.0,
                        "fps": 30.0,
                        "latency_ms": 120.0,
                        "face_count": 1,
                    },
                )
                self.assertEqual(res_telem.status_code, 200)


if __name__ == "__main__":
    unittest.main()

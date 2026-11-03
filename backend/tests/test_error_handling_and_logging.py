"""
tests/test_error_handling_and_logging.py
----------------------------------------
Automated tests for backend error handling, production response sanitization,
and sensitive data logging redaction.

Verifies:
  1. 404 Not Found returns consistent JSON error envelope with X-Request-ID.
  2. 422 Request Validation Error returns structured field details without internal leaks.
  3. 401 Unauthorized returns standard error envelope without leaking credentials.
  4. 403 Forbidden returns standard error envelope without leaking internal auth details.
  5. 500 Internal Server Error sanitizes all messages, scrubbing stack traces,
     filesystem paths, and database connection URIs.
  6. StructuredLogger automatically redacts passwords, tokens, API keys, and authorization headers.
"""

import io
import logging
import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from fastapi import APIRouter
from httpx import ASGITransport, AsyncClient

from app.core.exceptions import (
    GetHireException,
    ResourceNotFoundError,
    _sanitize_text,
    _sanitize_details,
)
from app.core.logging import StructuredLogger, get_logger
from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.main import app
from app.models.user import UserModel


class TestErrorHandlingAndLogging(unittest.IsolatedAsyncioTestCase):
    """Test suite verifying production error responses and logging hygiene."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()
        self.candidate_user = UserModel(
            _id=ObjectId("507f1f77bcf86cd799439011"),
            email="candidate@example.com",
            full_name="Candidate User",
            password_hash="hashed_secret",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── 1. 404 Not Found Envelope & Information Leakage ───────────────────────

    async def test_404_not_found_standard_envelope(self) -> None:
        """Non-existent endpoints must return standard envelope without leaking internals."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/v1/route-that-does-not-exist")

        self.assertEqual(res.status_code, 404)
        self.assertIn("X-Request-ID", res.headers)

        body = res.json()
        self.assertFalse(body["success"])
        self.assertIsNone(body["data"])
        self.assertIn("errors", body)
        self.assertIn("error", body)
        self.assertIn("request_id", body["error"])
        self.assertIn("timestamp", body["error"])

        # Must not leak filesystem paths or server framework internals
        raw_text = res.text
        self.assertNotIn("/Users/", raw_text)
        self.assertNotIn("Traceback", raw_text)
        self.assertNotIn("File \"", raw_text)

    # ── 2. 422 Validation Error Envelope ──────────────────────────────────────

    async def test_422_validation_error_envelope(self) -> None:
        """Malformed requests must return clean validation envelope without leaking internal types."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/api/v1/auth/register", json={"email": "not-an-email"})

        self.assertEqual(res.status_code, 422)
        self.assertIn("X-Request-ID", res.headers)

        body = res.json()
        self.assertFalse(body["success"])
        self.assertIsNone(body["data"])
        self.assertIn("errors", body)
        self.assertGreater(len(body["errors"]), 0)

        # Confirm field information is provided cleanly
        first_error = body["errors"][0]
        self.assertIn("field", first_error)
        self.assertIn("message", first_error)

        raw_text = res.text
        self.assertNotIn("/Users/", raw_text)
        self.assertNotIn("Traceback", raw_text)

    # ── 3. 401 Unauthorized Error Envelope ────────────────────────────────────

    async def test_401_unauthorized_envelope(self) -> None:
        """Unauthenticated requests must return standard envelope without leaking auth secrets."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/v1/users/me")

        self.assertEqual(res.status_code, 401)
        self.assertIn("X-Request-ID", res.headers)

        body = res.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["errors"][0]["code"], "MISSING_TOKEN")
        self.assertIn("request_id", body["error"])

    # ── 4. 403 Forbidden Error Envelope ───────────────────────────────────────

    async def test_403_forbidden_envelope(self) -> None:
        """Unauthorized role requests must return 403 envelope without leaking route internals."""
        app.dependency_overrides[get_current_active_user] = lambda: self.candidate_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/v1/admin/users")

        self.assertEqual(res.status_code, 403)
        self.assertIn("X-Request-ID", res.headers)

        body = res.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["errors"][0]["code"], "FORBIDDEN")
        self.assertIn("request_id", body["error"])

    # ── 5. 500 Internal Server Error Sanitization ──────────────────────────────

    async def test_500_internal_error_scrubs_sensitive_details(self) -> None:
        """Unhandled exceptions must never expose stack traces, DB queries, or paths to clients."""
        test_router = APIRouter()

        @test_router.get("/test-internal-crash")
        async def trigger_crash():
            # Simulating a deep internal error with sensitive database URI and filesystem paths
            raise RuntimeError(
                "Database connection error to mongodb://admin:secret123@mongo.internal:27017 "
                "at /Users/internal/developer/GetHire/backend/app/db/mongo.py:84"
            )

        app.include_router(test_router, prefix="/api/v1/testing-errors")

        async with AsyncClient(
            transport=ASGITransport(app=app, raise_app_exceptions=False),
            base_url="http://test",
        ) as client:
            res = await client.get("/api/v1/testing-errors/test-internal-crash")

        self.assertEqual(res.status_code, 500)
        self.assertIn("X-Request-ID", res.headers)

        body = res.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "INTERNAL_ERROR")
        self.assertEqual(body["message"], "An unexpected error occurred. Our team has been notified.")
        self.assertEqual(body["error"]["details"], {})

        # Verify absolutely no database credentials, URLs, or local filesystem paths leaked in response
        raw_text = res.text
        self.assertNotIn("mongodb://", raw_text)
        self.assertNotIn("secret123", raw_text)
        self.assertNotIn("mongo.internal", raw_text)
        self.assertNotIn("/Users/", raw_text)
        self.assertNotIn("Traceback", raw_text)
        self.assertNotIn("RuntimeError", raw_text)

    # ── 6. Sanitization Utility Tests ─────────────────────────────────────────

    def test_sanitize_text_filters_paths_and_uris(self) -> None:
        """_sanitize_text must redact DB URIs and filesystem paths."""
        text_with_uri = "Connection failed at mongodb+srv://admin:pass@cluster.mongodb.net/test"
        sanitized_uri = _sanitize_text(text_with_uri, is_server_error=False)
        self.assertNotIn("mongodb+srv://", sanitized_uri)
        self.assertIn("[database-connection]", sanitized_uri)

        text_with_path = "File missing at /Users/developer/GetHire/uploads/resume.pdf"
        sanitized_path = _sanitize_text(text_with_path, is_server_error=False)
        self.assertNotIn("/Users/developer", sanitized_path)
        self.assertIn("[path]", sanitized_path)

        server_err_text = "Detailed internal stacktrace at line 42"
        self.assertEqual(
            _sanitize_text(server_err_text, is_server_error=True),
            "An unexpected error occurred. Our team has been notified.",
        )

    # ── 7. StructuredLogger Redaction Tests ────────────────────────────────────

    def test_logger_redacts_passwords_and_tokens(self) -> None:
        """StructuredLogger must automatically mask sensitive credentials and token arguments."""
        log_stream = io.StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setFormatter(logging.Formatter("%(message)s"))

        std_logger = logging.getLogger("test_redaction_logger")
        std_logger.setLevel(logging.INFO)
        std_logger.handlers.clear()
        std_logger.addHandler(handler)

        structured = StructuredLogger("test_redaction_logger")

        # 1. Test keyword argument redaction for sensitive fields
        structured.info(
            "User session initiated",
            user_id="user_123",
            password="PlainTextSecretPassword123!",
            access_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.sig",
            api_key="sk-live-998877665544332211",
            authorization="Bearer secret_token_xyz",
            credit_card="4111222233334444",
        )

        output = log_stream.getvalue()

        # Non-sensitive operational keys remain intact
        self.assertIn("user_id='user_123'", output)

        # Sensitive keys MUST be redacted
        self.assertNotIn("PlainTextSecretPassword123!", output)
        self.assertNotIn("sk-live-998877665544332211", output)
        self.assertNotIn("secret_token_xyz", output)
        self.assertNotIn("4111222233334444", output)

        self.assertIn("password='[REDACTED]'", output)
        self.assertIn("access_token='[REDACTED]'", output)
        self.assertIn("api_key='[REDACTED]'", output)
        self.assertIn("authorization='[REDACTED]'", output)
        self.assertIn("credit_card='[REDACTED]'", output)

    def test_logger_redacts_embedded_bearer_tokens(self) -> None:
        """StructuredLogger must scrub Bearer tokens embedded in message text."""
        log_stream = io.StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setFormatter(logging.Formatter("%(message)s"))

        std_logger = logging.getLogger("test_bearer_redaction_logger")
        std_logger.setLevel(logging.INFO)
        std_logger.handlers.clear()
        std_logger.addHandler(handler)

        structured = StructuredLogger("test_bearer_redaction_logger")
        structured.warning("Client presented header: Bearer SuperSecretToken123456789")

        output = log_stream.getvalue()
        self.assertNotIn("SuperSecretToken123456789", output)
        self.assertIn("Bearer [REDACTED]", output)


if __name__ == "__main__":
    unittest.main()

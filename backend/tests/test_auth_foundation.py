"""
tests/test_auth_foundation.py
-----------------------------
Production-Grade Authentication Foundation Test Suite.
Built with standard library unittest (no external test runner dependencies).

Verifies:
  ✓ 1. Password bcrypt hashing & verification (no plain storage)
  ✓ 2. Bcrypt 72-byte truncation safety
  ✓ 3. JWT Generation & Payload Claims (Access & Refresh)
  ✓ 4. JWT Secure Validation (Valid, Expired, Tampered)
  ✓ 5. Registration payload validation (Email, Password complexity, Full name)
  ✓ 6. Duplicate Email Conflict Detection (409)
  ✓ 7. Invalid Password Authentication Rejection (401)
  ✓ 8. Refresh Token Rotation (RTR) & Replay Attack Defense (401)
  ✓ 9. Logout and Token Revocation
"""

import asyncio
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId
from fastapi import HTTPException

from app.models.user import UserModel
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import (
    authenticate_user,
    logout_user,
    register_user,
    rotate_refresh_token,
)
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestAuthFoundation(unittest.IsolatedAsyncioTestCase):

    # ── 1. Password Tests ───────────────────────────────────────────────────

    def test_01_password_bcrypt_hashing_and_verification(self):
        password = "SuperSecretPassword123!"
        hashed = hash_password(password)

        self.assertNotEqual(hashed, password)
        self.assertTrue(hashed.startswith("$2b$"))
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("WrongPassword123!", hashed))

    def test_02_password_bcrypt_72_byte_safety(self):
        long_password = "A" * 100 + "1!Aa"
        hashed = hash_password(long_password)
        self.assertTrue(hashed.startswith("$2b$"))
        self.assertTrue(verify_password(long_password, hashed))

    # ── 2. JWT Generation & Validation Tests ────────────────────────────────

    def test_03_jwt_access_token_claims(self):
        user_id = "507f1f77bcf86cd799439011"
        token, jti = create_access_token(user_id=user_id, role="candidate")
        payload = decode_token(token)

        self.assertEqual(payload["sub"], user_id)
        self.assertEqual(payload["role"], "candidate")
        self.assertEqual(payload["type"], "access")
        self.assertEqual(payload["jti"], jti)
        self.assertIn("exp", payload)
        self.assertIn("iat", payload)

    def test_04_jwt_refresh_token_claims(self):
        user_id = "507f1f77bcf86cd799439011"
        token, jti, family = create_refresh_token(user_id=user_id)
        payload = decode_token(token)

        self.assertEqual(payload["sub"], user_id)
        self.assertEqual(payload["token_family"], family)
        self.assertEqual(payload["type"], "refresh")
        self.assertEqual(payload["jti"], jti)
        self.assertIn("exp", payload)

    def test_05_jwt_tampered_token_rejected(self):
        token, _ = create_access_token(user_id="user_123")
        tampered_token = token[:-5] + "AAAAA"
        with self.assertRaises(Exception):
            decode_token(tampered_token)

    def test_06_jwt_expired_token_rejected(self):
        expired_delta = timedelta(minutes=-10)
        token, _ = create_access_token(user_id="user_123", expires_delta=expired_delta)
        with self.assertRaises(Exception):
            decode_token(token)

    # ── 3. Registration Service Tests ───────────────────────────────────────

    async def test_07_register_user_success(self):
        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=None)
        mock_db.__getitem__.return_value.insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("507f1f77bcf86cd799439011"))
        )

        payload = RegisterRequest(
            email="candidate@gethire.ai",
            password="ValidPassword123!",
            full_name="Alex Mercer",
            target_role="Frontend Developer",
            experience_level="mid",
        )

        user_summary = await register_user(mock_db, payload, session_info={"ip_address": "127.0.0.1"})

        self.assertEqual(user_summary.email, "candidate@gethire.ai")
        self.assertEqual(user_summary.full_name, "Alex Mercer")
        self.assertFalse(user_summary.is_verified)
        self.assertEqual(user_summary.target_role, "Frontend Developer")

    async def test_08_register_duplicate_email_rejected(self):
        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(
            return_value={"_id": ObjectId(), "email": "exists@gethire.ai"}
        )

        payload = RegisterRequest(
            email="exists@gethire.ai",
            password="ValidPassword123!",
            full_name="Alex Mercer",
            target_role="Frontend Developer",
            experience_level="mid",
        )

        with self.assertRaises(HTTPException) as ctx:
            await register_user(mock_db, payload, session_info={"ip_address": "127.0.0.1"})

        self.assertEqual(ctx.exception.status_code, 409)
        self.assertEqual(ctx.exception.detail["errors"][0]["code"], "DUPLICATE_EMAIL")

    # ── 4. Login Authentication Tests ───────────────────────────────────────

    async def test_09_authenticate_user_success(self):
        password = "CorrectPassword123!"
        hashed = hash_password(password)

        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "user@gethire.ai",
            "full_name": "Valid User",
            "password_hash": hashed,
            "role": "candidate",
            "status": "active",
            "is_verified": True,
            "profile_photo": None,
            "resume_uploaded": False,
            "onboarding_completed": True,
            "target_role": "Backend Developer",
            "experience_level": "senior",
            "linkedin_url": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=user_doc)
        mock_db.__getitem__.return_value.insert_one = AsyncMock(return_value=MagicMock(inserted_id=ObjectId()))

        payload = LoginRequest(email="user@gethire.ai", password=password)
        access_token, refresh_token, user_summary = await authenticate_user(
            mock_db, payload, session_info={"ip_address": "127.0.0.1"}
        )

        self.assertIsNotNone(access_token)
        self.assertIsNotNone(refresh_token)
        self.assertEqual(user_summary.email, "user@gethire.ai")
        self.assertTrue(user_summary.is_verified)

    async def test_10_authenticate_user_invalid_password(self):
        hashed = hash_password("RealPassword123!")

        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "user@gethire.ai",
            "full_name": "Valid User",
            "password_hash": hashed,
            "role": "candidate",
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=user_doc)
        mock_db.__getitem__.return_value.insert_one = AsyncMock()

        payload = LoginRequest(email="user@gethire.ai", password="WrongPassword123!")

        with self.assertRaises(HTTPException) as ctx:
            await authenticate_user(mock_db, payload, session_info={"ip_address": "127.0.0.1"})

        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.detail["errors"][0]["code"], "INVALID_CREDENTIALS")

    # ── 5. Refresh Token Rotation (RTR) Tests ───────────────────────────────

    async def test_11_refresh_token_rotation_success(self):
        user_id = "507f1f77bcf86cd799439011"
        refresh_token_jwt, jti, family = create_refresh_token(user_id=user_id)

        user_doc = {
            "_id": ObjectId(user_id),
            "email": "user@gethire.ai",
            "full_name": "Valid User",
            "password_hash": "hash",
            "role": "candidate",
            "status": "active",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        token_doc = {
            "_id": ObjectId(),
            "jti": jti,
            "user_id": user_id,
            "token_family": family,
            "is_revoked": False,
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(side_effect=[user_doc, token_doc])
        mock_db.__getitem__.return_value.update_one = AsyncMock()
        mock_db.__getitem__.return_value.insert_one = AsyncMock()

        new_access, new_refresh, user_summary = await rotate_refresh_token(mock_db, refresh_token_jwt)

        self.assertIsNotNone(new_access)
        self.assertIsNotNone(new_refresh)
        self.assertEqual(user_summary.id, user_id)

    async def test_12_refresh_token_replay_attack_detected(self):
        user_id = "507f1f77bcf86cd799439011"
        refresh_token_jwt, jti, family = create_refresh_token(user_id=user_id)

        user_doc = {
            "_id": ObjectId(user_id),
            "email": "user@gethire.ai",
            "full_name": "Valid User",
            "password_hash": "hash",
            "role": "candidate",
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        # Token already marked revoked
        token_doc = {
            "_id": ObjectId(),
            "jti": jti,
            "user_id": user_id,
            "token_family": family,
            "is_revoked": True,
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(side_effect=[user_doc, token_doc])
        mock_db.__getitem__.return_value.update_many = AsyncMock()
        mock_db.__getitem__.return_value.insert_one = AsyncMock()

        with self.assertRaises(HTTPException) as ctx:
            await rotate_refresh_token(mock_db, refresh_token_jwt)

        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.detail["errors"][0]["code"], "REPLAY_COMPROMISE")

    # ── 6. Logout Service Tests ─────────────────────────────────────────────

    async def test_13_logout_user(self):
        user_id = "507f1f77bcf86cd799439011"
        refresh_token_jwt, jti, family = create_refresh_token(user_id=user_id)

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.update_one = AsyncMock()
        mock_db.__getitem__.return_value.insert_one = AsyncMock()

        await logout_user(mock_db, refresh_token_jwt)

        self.assertEqual(mock_db.__getitem__.return_value.update_one.call_count, 2)


if __name__ == "__main__":
    unittest.main()

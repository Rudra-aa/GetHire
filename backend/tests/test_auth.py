"""
tests/test_auth.py
------------------
Auth integration tests using unittest.
"""

import unittest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestAuthEndpoints(unittest.IsolatedAsyncioTestCase):

    def test_password_hashing(self) -> None:
        password = "SecurePassword123!"
        hashed = hash_password(password)
        self.assertNotEqual(hashed, password)
        self.assertTrue(hashed.startswith("$2b$"))
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("wrong_password", hashed))

    def test_jwt_access_token_creation(self) -> None:
        user_id = "507f1f77bcf86cd799439011"
        role = "candidate"
        token, jti = create_access_token(user_id=user_id, role=role)
        payload = decode_token(token)
        self.assertEqual(payload["sub"], user_id)
        self.assertEqual(payload["role"], role)
        self.assertEqual(payload["jti"], jti)

    async def test_auth_registration_validation(self) -> None:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Invalid email
            payload = {
                "email": "invalid-email",
                "password": "Password123!",
                "full_name": "John Doe",
                "target_role": "Frontend Developer",
                "experience_level": "entry"
            }
            res = await ac.post("/api/v1/auth/register", json=payload)
            self.assertEqual(res.status_code, 422)

            # 2. Weak password (missing uppercase)
            payload = {
                "email": "john@example.com",
                "password": "password123!",
                "full_name": "John Doe",
                "target_role": "Frontend Developer",
                "experience_level": "entry"
            }
            res = await ac.post("/api/v1/auth/register", json=payload)
            self.assertEqual(res.status_code, 422)

    async def test_protected_endpoints_require_auth(self) -> None:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # GET /users/me without Bearer token should return 401
            res = await ac.get("/api/v1/users/me")
            self.assertEqual(res.status_code, 401)

            # GET /auth/session without headers should return authenticated: false (success 200)
            res = await ac.get("/api/v1/auth/session")
            self.assertEqual(res.status_code, 200)
            self.assertFalse(res.json()["data"]["authenticated"])


if __name__ == "__main__":
    unittest.main()

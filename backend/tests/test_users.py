"""
tests/test_users.py
-------------------
User endpoints integration tests.
"""

import unittest
from httpx import AsyncClient, ASGITransport
from app.main import app


class TestUsersEndpoint(unittest.IsolatedAsyncioTestCase):
    """Test suite for GET and PATCH /api/v1/users/me."""

    async def test_get_me_unauthorized(self) -> None:
        """Endpoint should return HTTP 401 if request is unauthenticated."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/users/me")
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertIn("errors", data)

    async def test_patch_me_unauthorized(self) -> None:
        """Endpoint should return HTTP 401 if request is unauthenticated."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.patch(
                "/api/v1/users/me",
                json={"full_name": "New Name"}
            )
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertIn("errors", data)


if __name__ == "__main__":
    unittest.main()

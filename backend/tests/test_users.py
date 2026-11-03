"""
tests/test_users.py
-------------------
User endpoints integration tests including RBAC and field protection.
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.main import app
from app.models.user import UserModel


class TestUsersEndpoint(unittest.IsolatedAsyncioTestCase):
    """Test suite for GET and PATCH /api/v1/users/me."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()
        self.user_id = "507f1f77bcf86cd799439011"
        self.regular_user = UserModel(
            _id=ObjectId(self.user_id),
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

    async def test_get_me_authorized_regular_user(self) -> None:
        """Regular candidate can fetch their profile."""
        app.dependency_overrides[get_current_active_user] = lambda: self.regular_user
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/users/me")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["user"]["role"], "candidate")

    async def test_patch_me_allowed_fields(self) -> None:
        """Regular candidate can update normal profile fields."""
        app.dependency_overrides[get_current_active_user] = lambda: self.regular_user

        mock_db = MagicMock()
        updated_doc = self.regular_user.model_dump(by_alias=True)
        updated_doc["full_name"] = "Updated Name"
        mock_db.__getitem__.return_value.find_one_and_update = AsyncMock(return_value=updated_doc)

        with patch.object(mongo_manager, "get_database", return_value=mock_db):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.patch(
                    "/api/v1/users/me",
                    json={"full_name": "Updated Name"}
                )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["user"]["full_name"], "Updated Name")

    async def test_patch_me_protected_role_rejected(self) -> None:
        """Attempting to update role by regular user must return 403 Forbidden."""
        app.dependency_overrides[get_current_active_user] = lambda: self.regular_user

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.patch(
                "/api/v1/users/me",
                json={"role": "admin"}
            )
        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["errors"][0]["code"], "FORBIDDEN_FIELD_MODIFICATION")

    async def test_patch_me_protected_is_admin_rejected(self) -> None:
        """Attempting to set isAdmin flag by regular user must return 403 Forbidden."""
        app.dependency_overrides[get_current_active_user] = lambda: self.regular_user

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.patch(
                "/api/v1/users/me",
                json={"isAdmin": True}
            )
        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["errors"][0]["code"], "FORBIDDEN_FIELD_MODIFICATION")

    async def test_patch_me_protected_permissions_rejected(self) -> None:
        """Attempting to set permissions by regular user must return 403 Forbidden."""
        app.dependency_overrides[get_current_active_user] = lambda: self.regular_user

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.patch(
                "/api/v1/users/me",
                json={"permissions": ["admin", "root"]}
            )
        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["errors"][0]["code"], "FORBIDDEN_FIELD_MODIFICATION")

    async def test_reset_progress_unauthorized(self) -> None:
        """Endpoint should return HTTP 401 if reset request is unauthenticated."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/api/v1/users/me/reset-progress")
        self.assertEqual(response.status_code, 401)

    async def test_reset_progress_authorized(self) -> None:
        """Authorized reset should safely cancel running sessions and archive assessments."""
        app.dependency_overrides[get_current_active_user] = lambda: self.regular_user

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.update_many = AsyncMock(
            return_value=MagicMock(modified_count=1)
        )

        with patch.object(mongo_manager, "get_database", return_value=mock_db):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post("/api/v1/users/me/reset-progress")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertTrue(data["data"]["reset"])
        # Verify db collections were called for targeted status updates
        self.assertEqual(mock_db.__getitem__.call_count, 3)


if __name__ == "__main__":
    unittest.main()


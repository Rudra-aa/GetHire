"""
tests/test_rbac_authorization.py
---------------------------------
Automated tests for Authentication & RBAC (Role-Based Access Control) Enforcement.

Tests covered:
  1. Unauthenticated request to protected API -> 401 Unauthorized
  2. Regular user accessing regular functionality -> 200 OK
  3. Regular user accessing administrator functionality -> 403 Forbidden
  4. Administrator accessing administrator functionality -> 200 OK
  5. Attempt by normal user to change protected account fields (role, permissions, isAdmin) -> 403 Forbidden
  6. End-to-end JWT token validation and role verification
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user, get_current_user
from app.main import app
from app.models.user import UserModel
from app.utils.security import create_access_token


class TestRBACAuthorization(unittest.IsolatedAsyncioTestCase):
    """Integration and authorization test suite for GetHire RBAC."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()
        self.candidate_id = "507f1f77bcf86cd799439011"
        self.admin_id = "507f1f77bcf86cd799439012"
        self.target_id = "507f1f77bcf86cd799439013"

        self.candidate_user = UserModel(
            _id=ObjectId(self.candidate_id),
            email="candidate@example.com",
            full_name="Candidate Jane",
            password_hash="hashed_secret",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        self.admin_user = UserModel(
            _id=ObjectId(self.admin_id),
            email="admin@example.com",
            full_name="Admin Boss",
            password_hash="hashed_secret",
            role="admin",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── 1. Unauthenticated request to protected API ───────────────────────────

    async def test_unauthenticated_request_to_protected_api(self) -> None:
        """Unauthenticated requests to protected endpoints must be rejected with 401."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Protected regular endpoints
            res_user = await client.get("/api/v1/users/me")
            self.assertEqual(res_user.status_code, 401)
            self.assertFalse(res_user.json()["success"])

            res_patch = await client.patch("/api/v1/users/me", json={"full_name": "No Auth"})
            self.assertEqual(res_patch.status_code, 401)

            # Protected admin endpoints
            res_admin_users = await client.get("/api/v1/admin/users")
            self.assertEqual(res_admin_users.status_code, 401)

            res_admin_analytics = await client.get("/api/v1/admin/analytics/overview")
            self.assertEqual(res_admin_analytics.status_code, 401)

            res_admin_delete = await client.delete(f"/api/v1/admin/users/{self.target_id}")
            self.assertEqual(res_admin_delete.status_code, 401)

    # ── 2. Regular user accessing regular functionality ───────────────────────

    async def test_regular_user_accessing_regular_functionality(self) -> None:
        """Regular candidate users must successfully access standard protected features."""
        app.dependency_overrides[get_current_active_user] = lambda: self.candidate_user

        mock_db = MagicMock()
        mock_user_doc = self.candidate_user.model_dump(by_alias=True)
        mock_user_doc["full_name"] = "Candidate Jane Updated"
        mock_db.__getitem__.return_value.find_one_and_update = AsyncMock(return_value=mock_user_doc)

        with patch.object(mongo_manager, "get_database", return_value=mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # GET profile
                res_get = await client.get("/api/v1/users/me")
                self.assertEqual(res_get.status_code, 200)
                data_get = res_get.json()
                self.assertTrue(data_get["success"])
                self.assertEqual(data_get["data"]["user"]["email"], "candidate@example.com")
                self.assertEqual(data_get["data"]["user"]["role"], "candidate")

                # PATCH profile with allowed fields
                res_patch = await client.patch(
                    "/api/v1/users/me",
                    json={"full_name": "Candidate Jane Updated"},
                )
                self.assertEqual(res_patch.status_code, 200)
                data_patch = res_patch.json()
                self.assertTrue(data_patch["success"])
                self.assertEqual(data_patch["data"]["user"]["full_name"], "Candidate Jane Updated")

    # ── 3. Regular user accessing administrator functionality ─────────────────

    async def test_regular_user_accessing_administrator_functionality(self) -> None:
        """Regular candidate users must be rejected with 403 Forbidden for admin-only APIs."""
        app.dependency_overrides[get_current_active_user] = lambda: self.candidate_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. Admin users list
            res_users = await client.get("/api/v1/admin/users")
            self.assertEqual(res_users.status_code, 403)
            self.assertFalse(res_users.json()["success"])
            self.assertEqual(res_users.json()["errors"][0]["code"], "FORBIDDEN")

            # 2. Admin analytics
            res_analytics = await client.get("/api/v1/admin/analytics/overview")
            self.assertEqual(res_analytics.status_code, 403)
            self.assertEqual(res_analytics.json()["errors"][0]["code"], "FORBIDDEN")

            # 3. Admin user detail
            res_detail = await client.get(f"/api/v1/admin/users/{self.target_id}")
            self.assertEqual(res_detail.status_code, 403)

            # 4. Admin update user role
            res_role = await client.patch(
                f"/api/v1/admin/users/{self.target_id}/role",
                json={"role": "admin"},
            )
            self.assertEqual(res_role.status_code, 403)

            # 5. Admin soft-delete user
            res_delete = await client.delete(f"/api/v1/admin/users/{self.target_id}")
            self.assertEqual(res_delete.status_code, 403)

    # ── 4. Administrator accessing administrator functionality ────────────────

    async def test_administrator_accessing_administrator_functionality(self) -> None:
        """Authenticated administrators must successfully access administrative APIs."""
        app.dependency_overrides[get_current_active_user] = lambda: self.admin_user

        mock_db = MagicMock()
        mock_target_doc = {
            "_id": ObjectId(self.target_id),
            "email": "target@example.com",
            "full_name": "Target User",
            "password_hash": "hash",
            "role": "candidate",
            "status": "active",
            "is_verified": True,
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        mock_cursor = MagicMock()
        mock_cursor.sort.return_value = mock_cursor
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor

        async def async_iter():
            yield mock_target_doc

        mock_cursor.__aiter__ = lambda self: async_iter()

        mock_db.__getitem__.return_value.count_documents = AsyncMock(return_value=1)
        mock_db.__getitem__.return_value.find = MagicMock(return_value=mock_cursor)
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=mock_target_doc)
        mock_db.__getitem__.return_value.find_one_and_update = AsyncMock(
            return_value={**mock_target_doc, "role": "admin"}
        )
        mock_db.__getitem__.return_value.update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        with patch.object(mongo_manager, "get_database", return_value=mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 1. Admin users list
                res_users = await client.get("/api/v1/admin/users")
                self.assertEqual(res_users.status_code, 200)
                data_users = res_users.json()
                self.assertTrue(data_users["success"])
                self.assertEqual(len(data_users["data"]["users"]), 1)
                self.assertEqual(data_users["data"]["users"][0]["email"], "target@example.com")

                # 2. Admin platform analytics
                res_analytics = await client.get("/api/v1/admin/analytics/overview")
                self.assertEqual(res_analytics.status_code, 200)
                data_analytics = res_analytics.json()
                self.assertTrue(data_analytics["success"])
                self.assertIn("total_users", data_analytics["data"])

                # 3. Admin get user by ID
                res_detail = await client.get(f"/api/v1/admin/users/{self.target_id}")
                self.assertEqual(res_detail.status_code, 200)
                data_detail = res_detail.json()
                self.assertTrue(data_detail["success"])
                self.assertEqual(data_detail["data"]["user"]["id"], self.target_id)

                # 4. Admin update user role
                res_role = await client.patch(
                    f"/api/v1/admin/users/{self.target_id}/role",
                    json={"role": "admin"},
                )
                self.assertEqual(res_role.status_code, 200)
                data_role = res_role.json()
                self.assertTrue(data_role["success"])
                self.assertEqual(data_role["data"]["role"], "admin")

                # 5. Admin soft-delete user
                res_delete = await client.delete(f"/api/v1/admin/users/{self.target_id}")
                self.assertEqual(res_delete.status_code, 200)
                self.assertTrue(res_delete.json()["success"])

    # ── 5. Attempt to change protected role/permission fields ─────────────────

    async def test_attempt_to_change_protected_role_permission_fields(self) -> None:
        """Normal users must be prevented from changing role, permissions, or isAdmin flags."""
        app.dependency_overrides[get_current_active_user] = lambda: self.candidate_user

        mock_db = MagicMock()
        with patch.object(mongo_manager, "get_database", return_value=mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 1. Attempt to change role to admin
                res_role = await client.patch(
                    "/api/v1/users/me",
                    json={"role": "admin"},
                )
                self.assertEqual(res_role.status_code, 403)
                data_role = res_role.json()
                self.assertFalse(data_role["success"])
                self.assertEqual(data_role["errors"][0]["code"], "FORBIDDEN_FIELD_MODIFICATION")

                # 2. Attempt to change isAdmin flag
                res_is_admin = await client.patch(
                    "/api/v1/users/me",
                    json={"isAdmin": True},
                )
                self.assertEqual(res_is_admin.status_code, 403)

                # 3. Attempt to grant permissions
                res_perms = await client.patch(
                    "/api/v1/users/me",
                    json={"permissions": ["all", "admin"]},
                )
                self.assertEqual(res_perms.status_code, 403)

                # 4. Attempt mixed update (valid full_name + forbidden role)
                res_mixed = await client.patch(
                    "/api/v1/users/me",
                    json={"full_name": "Sneaky Candidate", "role": "admin"},
                )
                self.assertEqual(res_mixed.status_code, 403)

                # Ensure find_one_and_update was NEVER called with forbidden fields
                mock_db.__getitem__.return_value.find_one_and_update.assert_not_called()

    # ── 6. End-to-end Bearer token verification ───────────────────────────────

    async def test_bearer_token_role_verification(self) -> None:
        """Verify that genuine Bearer tokens are properly evaluated for role permissions."""
        candidate_token, _ = create_access_token(user_id=self.candidate_id, role="candidate")
        admin_token, _ = create_access_token(user_id=self.admin_id, role="admin")

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(
            side_effect=lambda query: (
                self.candidate_user.model_dump(by_alias=True)
                if query.get("_id") == ObjectId(self.candidate_id)
                else (
                    self.admin_user.model_dump(by_alias=True)
                    if query.get("_id") == ObjectId(self.admin_id)
                    else None
                )
            )
        )
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value = mock_cursor
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor

        async def async_iter():
            yield self.candidate_user.model_dump(by_alias=True)

        mock_cursor.__aiter__ = lambda self: async_iter()
        mock_db.__getitem__.return_value.find = MagicMock(return_value=mock_cursor)
        mock_db.__getitem__.return_value.count_documents = AsyncMock(return_value=1)

        with patch.object(mongo_manager, "get_database", return_value=mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # Candidate token accessing admin endpoint -> 403
                res_cand = await client.get(
                    "/api/v1/admin/users",
                    headers={"Authorization": f"Bearer {candidate_token}"},
                )
                self.assertEqual(res_cand.status_code, 403)

                # Admin token accessing admin endpoint -> 200
                res_adm = await client.get(
                    "/api/v1/admin/users",
                    headers={"Authorization": f"Bearer {admin_token}"},
                )
                self.assertEqual(res_adm.status_code, 200)
                self.assertTrue(res_adm.json()["success"])


if __name__ == "__main__":
    unittest.main()

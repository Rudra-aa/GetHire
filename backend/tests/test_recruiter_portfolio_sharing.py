"""
backend/tests/test_recruiter_portfolio_sharing.py
-------------------------------------------------
Unit test suite verifying Recruiter Portfolio & Share Center functionality:
- Configuration validation (no localhost share links)
- Persisted visibility settings (public vs private)
- Real view count analytics (owner views do NOT increment count)
- Assessment inclusion only when completed
- Recordings permanently marked unavailable
- Unauthenticated access control (404 when private)
"""

import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from datetime import datetime, timezone

from app.core.config import Settings
from app.services.career_intelligence.recruiter_portfolio_service import RecruiterPortfolioService


class TestRecruiterPortfolioSharing(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.service = RecruiterPortfolioService()
        self.user_id = "507f1f77bcf86cd799439011"
        self.collections = {}
        self.mock_db = MagicMock()
        self.mock_db.__getitem__.side_effect = lambda name: self.collections.setdefault(name, MagicMock())

    async def test_01_public_sharing_unconfigured_in_dev(self):
        """When PUBLIC_APP_URL is not set or points to localhost, configured is False and share_url is None."""
        with patch("app.services.career_intelligence.recruiter_portfolio_service.settings.PUBLIC_APP_URL", None):
            self.mock_db["assessment_sessions"].find_one = AsyncMock(return_value=None)
            self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value={
                "share_token": "valid_token_123",
                "user_id": self.user_id,
                "is_public": True,
                "access_count": 5,
            })

            res = await self.service.get_candidate_share_settings(self.mock_db, self.user_id)
            self.assertFalse(res["configured"])
            self.assertIsNone(res["share_url"])
            self.assertIsNone(res["access_count"])  # Analytics unavailable when not configured

        with patch("app.services.career_intelligence.recruiter_portfolio_service.settings.PUBLIC_APP_URL", "http://localhost:5173"):
            res = await self.service.get_candidate_share_settings(self.mock_db, self.user_id)
            self.assertFalse(res["configured"])
            self.assertIsNone(res["share_url"])

    async def test_02_public_sharing_configured_with_valid_domain(self):
        """When valid production URL is configured, returns verified share link and real analytics."""
        with patch("app.services.career_intelligence.recruiter_portfolio_service.settings.PUBLIC_APP_URL", "https://gethire.app"):
            self.mock_db["assessment_sessions"].find_one = AsyncMock(return_value={"status": "completed", "score": 88})
            self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value={
                "share_token": "tok_prod_45678",
                "user_id": self.user_id,
                "is_public": True,
                "include_assessment": True,
                "access_count": 14,
            })

            res = await self.service.get_candidate_share_settings(self.mock_db, self.user_id)
            self.assertTrue(res["configured"])
            self.assertEqual(res["share_url"], "https://gethire.app/portfolio/tok_prod_45678")
            self.assertEqual(res["access_count"], 14)
            self.assertTrue(res["has_assessment"])
            self.assertFalse(res["recordings_available"])
            self.assertFalse(res["include_interview"])

    async def test_03_visibility_toggle_and_privacy_enforcement(self):
        """Private portfolio returns None/404 to recruiters."""
        self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value={
            "share_token": "secret_tok_99",
            "user_id": self.user_id,
            "is_public": False,  # Candidate turned OFF public sharing
            "access_count": 2,
        })

        # Recruiter attempts lookup
        res = await self.service.get_portfolio_by_token(self.mock_db, "secret_tok_99", viewer_user_id=None)
        self.assertIsNone(res)  # Must be blocked

    async def test_04_recruiter_views_increment_only_for_external_viewers(self):
        """External recruiter view increments access_count; owner viewing their own portfolio does NOT."""
        share_doc = {
            "share_token": "tok_analytics_test",
            "user_id": self.user_id,
            "is_public": True,
            "access_count": 10,
        }
        self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value=share_doc)
        self.mock_db["recruiter_share_links"].update_one = AsyncMock()
        self.mock_db["users"].find_one = AsyncMock(return_value={"full_name": "Alex Candidate", "target_role": "Backend Engineer"})
        self.mock_db["hirescores"].find_one = AsyncMock(return_value={"overall_score": 75, "components": {}})
        self.mock_db["resumes"].find_one = AsyncMock(return_value=None)
        self.mock_db["assessment_sessions"].find_one = AsyncMock(return_value=None)

        # 1. External recruiter accesses portfolio -> views incremented
        res1 = await self.service.get_portfolio_by_token(self.mock_db, "tok_analytics_test", viewer_user_id="recruiter_123")
        self.assertIsNotNone(res1)
        self.mock_db["recruiter_share_links"].update_one.assert_called_with(
            {"share_token": "tok_analytics_test"},
            {"$inc": {"access_count": 1}}
        )

        self.mock_db["recruiter_share_links"].update_one.reset_mock()

        # 2. Candidate owner accesses their own portfolio -> views MUST NOT increment
        res2 = await self.service.get_portfolio_by_token(self.mock_db, "tok_analytics_test", viewer_user_id=self.user_id)
        self.assertIsNotNone(res2)
        self.mock_db["recruiter_share_links"].update_one.assert_not_called()

    async def test_05_assessment_inclusion_requires_completed_assessment(self):
        """Include assessment cannot be enabled if candidate has no completed assessment."""
        self.mock_db["assessment_sessions"].find_one = AsyncMock(return_value=None)  # No assessment
        self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value=None)
        self.mock_db["recruiter_share_links"].update_one = AsyncMock()

        # Candidate attempts to enable assessment
        res = await self.service.update_candidate_share_settings(
            self.mock_db,
            self.user_id,
            is_public=True,
            include_assessment=True,
            include_interview=True,  # Attempts to enable interview recordings
        )

        self.assertFalse(res["include_assessment"])  # Forced False because has_assessment is False
        self.assertFalse(res["include_interview"])   # Permanently False because recordings are unavailable

    async def test_06_unauthenticated_recruiter_data_sanitization(self):
        """Public portfolio output excludes private credentials, emails, and internal data."""
        self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value={
            "share_token": "public_safe_token",
            "user_id": self.user_id,
            "is_public": True,
            "include_assessment": False,
        })
        self.mock_db["recruiter_share_links"].update_one = AsyncMock()
        self.mock_db["users"].find_one = AsyncMock(return_value={
            "full_name": "Jane Doe",
            "email": "jane.private@example.com",
            "hashed_password": "supersecretpasswordhash",
            "target_role": "Full Stack Developer",
            "experience_level": "Senior",
        })
        self.mock_db["hirescores"].find_one = AsyncMock(return_value={"overall_score": 85, "components": {"technical_accuracy": 90}})
        self.mock_db["resumes"].find_one = AsyncMock(return_value={"parsed_data": {"skills": ["React", "FastAPI", "MongoDB"]}})

        res = await self.service.get_portfolio_by_token(self.mock_db, "public_safe_token")
        self.assertIsNotNone(res)
        self.assertEqual(res["candidate_name"], "Jane Doe")
        self.assertEqual(res["overall_hirescore"], 85)
        self.assertEqual(res["hiring_verdict"], "Strong Hire")
        self.assertEqual(res["skills"], ["React", "FastAPI", "MongoDB"])
        self.assertIsNone(res["assessment_score"])  # Excluded per candidate preference
        self.assertNotIn("email", res)
        self.assertNotIn("hashed_password", res)
        self.assertNotIn("password", res)

    async def test_07_api_endpoints_share_settings_and_public_portfolio(self):
        """Test FastAPI HTTP router endpoints for share-settings and public portfolio."""
        from httpx import AsyncClient, ASGITransport
        from app.main import app
        from app.utils.security import create_access_token
        from app.db.mongo import mongo_manager

        token, _ = create_access_token(self.user_id, "candidate")
        auth_headers = {"Authorization": f"Bearer {token}"}

        self.mock_db["users"].find_one = AsyncMock(return_value={
            "_id": ObjectId(self.user_id),
            "id": self.user_id,
            "email": "candidate@example.com",
            "password_hash": "mock_bcrypt_hash",
            "full_name": "Test Candidate",
            "target_role": "Full Stack Engineer",
            "experience_level": "Senior",
            "is_active": True,
            "role": "candidate",
        })
        self.mock_db["assessment_sessions"].find_one = AsyncMock(return_value=None)
        self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value={
            "share_token": "valid_public_token_123",
            "user_id": self.user_id,
            "is_public": True,
            "access_count": 3,
        })
        self.mock_db["recruiter_share_links"].update_one = AsyncMock()
        self.mock_db["hirescores"].find_one = AsyncMock(return_value={"overall_score": 80, "components": {}})
        self.mock_db["resumes"].find_one = AsyncMock(return_value=None)

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://testserver") as client:
                # 1. Candidate fetches their share settings
                res = await client.get("/api/v1/career/share-settings", headers=auth_headers)
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertIn("configured", data)
                self.assertIn("is_public", data)

                # 2. Candidate updates visibility to private
                self.mock_db["recruiter_share_links"].update_one = AsyncMock()
                self.mock_db["recruiter_share_links"].find_one = AsyncMock(return_value={
                    "share_token": "valid_public_token_123",
                    "user_id": self.user_id,
                    "is_public": False,
                    "access_count": 3,
                })
                patch_res = await client.patch(
                    "/api/v1/career/share-settings",
                    headers=auth_headers,
                    json={"is_public": False},
                )
                self.assertEqual(patch_res.status_code, 200)
                self.assertFalse(patch_res.json()["is_public"])

                # 3. Public recruiter requests portfolio when private -> 404
                pub_res = await client.get("/api/v1/career/portfolio/valid_public_token_123")
                self.assertEqual(pub_res.status_code, 404)


if __name__ == "__main__":
    unittest.main()


"""
app/services/career_intelligence/recruiter_portfolio_service.py
------------------------------------------------------------------
Recruiter Portfolio & Candidate Share Link Service (Module 6).
Provides candidate shareable recruiter links, access control, and privacy enforcement.

LOC Constraint: < 300 LOC
Single Responsibility: Recruiter Share Links & Executive Portfolio Summary
"""

from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class RecruiterPortfolioService:
    """Manages recruiter shareable candidate portfolios and directory search."""

    def _get_user_filter(self, user_id: str) -> Any:
        return {"$in": [str(user_id), ObjectId(user_id)]} if ObjectId.is_valid(user_id) else str(user_id)

    async def get_candidate_share_settings(
        self, db: AsyncIOMotorDatabase, user_id: str
    ) -> Dict[str, Any]:
        """Retrieves candidate's current share link configuration, visibility, and recruiter view analytics."""
        user_filter = self._get_user_filter(user_id)
        has_assessment = await db["assessment_sessions"].find_one(
            {"user_id": user_filter, "status": "completed"}
        ) is not None

        is_configured = settings.is_public_sharing_configured
        public_base = settings.PUBLIC_APP_URL.rstrip("/") if is_configured and settings.PUBLIC_APP_URL else None

        share_doc = await db["recruiter_share_links"].find_one({"user_id": str(user_id)})
        if not share_doc:
            return {
                "configured": is_configured,
                "public_base_url": public_base,
                "share_token": None,
                "share_url": None,
                "is_public": False,
                "include_assessment": False,
                "include_interview": False,
                "recordings_available": False,
                "has_assessment": has_assessment,
                "access_count": None,  # Analytics unavailable
            }

        token = share_doc.get("share_token")
        share_url = f"{public_base}/portfolio/{token}" if is_configured and public_base and token else None
        is_public = bool(share_doc.get("is_public", False))

        return {
            "configured": is_configured,
            "public_base_url": public_base,
            "share_token": token,
            "share_url": share_url,
            "is_public": is_public,
            "include_assessment": bool(share_doc.get("include_assessment", True)) and has_assessment,
            "include_interview": False,
            "recordings_available": False,
            "has_assessment": has_assessment,
            "access_count": share_doc.get("access_count", 0) if is_configured else None,
        }

    async def generate_share_link(
        self, db: AsyncIOMotorDatabase, user_id: str
    ) -> Dict[str, Any]:
        """Generates or activates a secure share link token for recruiters."""
        user_filter = self._get_user_filter(user_id)
        has_assessment = await db["assessment_sessions"].find_one(
            {"user_id": user_filter, "status": "completed"}
        ) is not None

        existing = await db["recruiter_share_links"].find_one({"user_id": str(user_id)})
        token = existing.get("share_token") if (existing and existing.get("share_token")) else secrets.token_urlsafe(16)

        now = datetime.now(timezone.utc)
        update_data = {
            "share_token": token,
            "user_id": str(user_id),
            "is_public": True,
            "include_assessment": has_assessment,
            "include_interview": False,
            "updated_at": now,
        }

        await db["recruiter_share_links"].update_one(
            {"user_id": str(user_id)},
            {"$set": update_data, "$setOnInsert": {"access_count": 0, "created_at": now}},
            upsert=True,
        )

        is_configured = settings.is_public_sharing_configured
        public_base = settings.PUBLIC_APP_URL.rstrip("/") if is_configured and settings.PUBLIC_APP_URL else None
        share_url = f"{public_base}/portfolio/{token}" if is_configured and public_base else f"/portfolio/{token}"

        return {
            "share_token": token,
            "share_url": share_url,
            "configured": is_configured,
            "is_public": True,
            "include_assessment": has_assessment,
            "include_interview": False,
            "recordings_available": False,
            "access_count": existing.get("access_count", 0) if existing else 0,
        }

    async def update_candidate_share_settings(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        is_public: Optional[bool] = None,
        include_assessment: Optional[bool] = None,
        include_interview: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """Updates candidate's share visibility and included modules."""
        user_filter = self._get_user_filter(user_id)
        has_assessment = await db["assessment_sessions"].find_one(
            {"user_id": user_filter, "status": "completed"}
        ) is not None

        existing = await db["recruiter_share_links"].find_one({"user_id": str(user_id)})
        token = existing.get("share_token") if (existing and existing.get("share_token")) else secrets.token_urlsafe(16)

        now = datetime.now(timezone.utc)
        update_fields: Dict[str, Any] = {
            "share_token": token,
            "user_id": str(user_id),
            "updated_at": now,
            "include_interview": False,  # Recordings permanently unsupported
        }

        if is_public is not None:
            update_fields["is_public"] = bool(is_public)

        if include_assessment is not None:
            # Only enable assessment if completed assessment exists
            update_fields["include_assessment"] = bool(include_assessment) if has_assessment else False

        await db["recruiter_share_links"].update_one(
            {"user_id": str(user_id)},
            {"$set": update_fields, "$setOnInsert": {"access_count": 0, "created_at": now}},
            upsert=True,
        )

        return await self.get_candidate_share_settings(db, user_id=str(user_id))

    async def get_portfolio_by_token(
        self, db: AsyncIOMotorDatabase, share_token: str, viewer_user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves candidate executive portfolio using share token without auth.
        Increments access_count only if viewer is an external recruiter (not the owner).
        Returns None if portfolio does not exist or candidate set it to private.
        """
        share_doc = await db["recruiter_share_links"].find_one({"share_token": share_token})
        if not share_doc:
            return None

        # Verify candidate explicitly enabled public access
        if not share_doc.get("is_public", False):
            logger.info(f"Access denied to private recruiter portfolio: token={share_token}")
            return None

        user_id = str(share_doc["user_id"])

        # Do not increment views just because the owner opens their own link
        if not viewer_user_id or str(viewer_user_id) != user_id:
            await db["recruiter_share_links"].update_one(
                {"share_token": share_token}, {"$inc": {"access_count": 1}}
            )

        user_filter = self._get_user_filter(user_id)
        user_doc = await db["users"].find_one({"_id": user_filter})
        if not user_doc:
            return None

        hirescore_doc = await db["hirescores"].find_one(
            {"user_id": user_filter}, sort=[("created_at", -1), ("_id", -1)]
        )
        resume_doc = await db["resumes"].find_one(
            {"user_id": user_filter}, sort=[("created_at", -1), ("_id", -1)]
        )

        score = hirescore_doc.get("overall_score", 0) if hirescore_doc else 0
        skills = resume_doc.get("parsed_data", {}).get("skills", []) if resume_doc else []

        # Determine verified verdict
        if score == 0:
            verdict = "Not Evaluated"
        elif score >= 80:
            verdict = "Strong Hire"
        elif score >= 65:
            verdict = "Hire"
        else:
            verdict = "Calibration in Progress"

        # Technical Assessment evaluation inclusion
        assessment_score = None
        assessment_concepts = None
        if share_doc.get("include_assessment", True):
            assessment_doc = await db["assessment_sessions"].find_one(
                {"user_id": user_filter, "status": "completed"},
                sort=[("completed_at", -1), ("_id", -1)],
            )
            if assessment_doc:
                assessment_score = assessment_doc.get("score")
                assessment_concepts = {
                    "strong_concepts": assessment_doc.get("strong_concepts", []),
                    "weak_concepts": assessment_doc.get("weak_concepts", []),
                    "category_breakdown": assessment_doc.get("category_breakdown", {}),
                }

        return {
            "candidate_name": user_doc.get("full_name") or user_doc.get("name") or "Candidate",
            "target_role": user_doc.get("target_role") or "Software Engineer",
            "experience_level": user_doc.get("experience_level") or "Mid Level",
            "overall_hirescore": score,
            "hiring_verdict": verdict,
            "skills": skills[:10],
            "assessment_score": assessment_score,
            "assessment_concepts": assessment_concepts,
            "components": hirescore_doc.get("components", {}) if hirescore_doc else {},
            "verified": True,
        }


# Singleton instance
recruiter_portfolio_service = RecruiterPortfolioService()

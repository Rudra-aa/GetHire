"""
app/services/career_intelligence/recruiter_portfolio_service.py
------------------------------------------------------------------
Recruiter Portfolio & Candidate Share Link Service (Module 6).
Provides candidate search, shareable recruiter links, and hiring recommendations.

LOC Constraint: < 300 LOC
Single Responsibility: Recruiter Share Links & Executive Portfolio Summary
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase


class RecruiterPortfolioService:
    """Manages recruiter shareable candidate portfolios and directory search."""

    async def generate_share_link(
        self, db: AsyncIOMotorDatabase, user_id: str
    ) -> Dict[str, Any]:
        """Generates a secure share link token for recruiters."""
        token = str(uuid.uuid4())[:12]
        share_doc = {
            "share_token": token,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc),
            "access_count": 0,
        }

        await db["recruiter_share_links"].insert_one(share_doc)
        return {"share_token": token, "share_url": f"/recruiter/portfolio/{token}"}

    async def get_portfolio_by_token(
        self, db: AsyncIOMotorDatabase, share_token: str
    ) -> Optional[Dict[str, Any]]:
        """Retrieves candidate executive portfolio using share token."""
        share_doc = await db["recruiter_share_links"].find_one({"share_token": share_token})
        if not share_doc:
            return None

        user_id = share_doc["user_id"]
        await db["recruiter_share_links"].update_one(
            {"share_token": share_token}, {"$inc": {"access_count": 1}}
        )

        from bson import ObjectId
        # Aggregate user, latest resume, latest hirescore, latest assessment
        user_query = {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"_id": user_id}
        user_doc = await db["users"].find_one(user_query)
        hirescore_doc = await db["hirescores"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
        resume_doc = await db["resumes"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
        assessment_doc = await db["assessment_sessions"].find_one({"user_id": user_id, "status": "completed"}, sort=[("completed_at", -1)])

        score = hirescore_doc.get("overall_score") if hirescore_doc else (assessment_doc.get("score") if assessment_doc else 0)
        skills = resume_doc.get("parsed_data", {}).get("skills", []) if resume_doc else []

        return {
            "candidate_name": user_doc.get("full_name", "Candidate") if user_doc else "Candidate",
            "target_role": user_doc.get("target_role", "Software Engineer") if user_doc else "Software Engineer",
            "experience_level": user_doc.get("experience_level", "Mid Level") if user_doc else "Mid Level",
            "overall_hirescore": score,
            "hiring_verdict": "Strong Hire" if score >= 80 else ("Hire" if score >= 65 else "In Assessment"),
            "skills": skills[:8],
            "assessment_score": assessment_doc.get("score") if assessment_doc else None,
            "components": hirescore_doc.get("components", {}) if hirescore_doc else {},
        }


# Singleton instance
recruiter_portfolio_service = RecruiterPortfolioService()

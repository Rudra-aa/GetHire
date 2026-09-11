"""
app/services/career_intelligence/candidate_evolution.py
---------------------------------------------------------
Candidate Evolution Growth Loop & Historical Progress Service (Module 6 Flagship).
Tracks candidate historical progress curve across months (e.g. Jan 58 -> Feb 67 -> Mar 76 -> Apr 84 -> May 91).

LOC Constraint: < 300 LOC
Single Responsibility: Historical Candidate Growth Timeline & Evolution Analytics
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase


class CandidateEvolutionService:
    """Computes candidate monthly growth timeline and progress trajectory."""

    async def get_candidate_evolution_timeline(
        self, db: AsyncIOMotorDatabase, user_id: str
    ) -> Dict[str, Any]:
        """
        Retrieves historical monthly snapshots of candidate HireScore, Technical Score, and Integrity.
        """
        cursor = db["evaluation_reports"].find({"candidate_id": user_id}).sort("evaluation_number", 1)
        scores_docs = await cursor.to_list(length=100)

        # Only construct timeline if at least 2 real snapshots exist
        if not scores_docs or len(scores_docs) < 2:
            single_score = scores_docs[0].get("hirescore", 0) if scores_docs else 0
            single_points = []
            if scores_docs:
                created = scores_docs[0].get("created_at") or datetime.now(timezone.utc)
                month_str = created.strftime("%b %d") if isinstance(created, datetime) else "Report 1"
                single_points.append({
                    "month": f"Report #{scores_docs[0].get('evaluation_number', 1)}",
                    "hirescore": scores_docs[0].get("hirescore", 0),
                    "technical": scores_docs[0].get("technical_accuracy", 0),
                    "integrity": scores_docs[0].get("facesense_score", 0),
                    "readiness_pct": scores_docs[0].get("readiness", {}).get("readiness_percentage", 0),
                    "session_id": scores_docs[0].get("interview_session_id"),
                })
            return {
                "user_id": user_id,
                "has_sufficient_history": False,
                "starting_score": single_score,
                "current_score": single_score,
                "total_growth_points": 0,
                "growth_trajectory": "Calibration Phase",
                "message": "Complete at least two full Evaluation Cycles to unlock Candidate Evolution.",
                "evolution_points": single_points,
            }

        monthly_points = []
        for doc in scores_docs:
            created = doc.get("created_at") or datetime.now(timezone.utc)
            monthly_points.append({
                "month": f"Report #{doc.get('evaluation_number', 1)}",
                "hirescore": doc.get("hirescore", 0),
                "technical": doc.get("technical_accuracy", 0),
                "integrity": doc.get("facesense_score", 0),
                "readiness_pct": doc.get("readiness", {}).get("readiness_percentage", 0),
                "session_id": doc.get("interview_session_id"),
            })

        first_score = monthly_points[0]["hirescore"]
        latest_score = monthly_points[-1]["hirescore"]
        growth_delta = latest_score - first_score

        return {
            "user_id": user_id,
            "has_sufficient_history": True,
            "starting_score": first_score,
            "current_score": latest_score,
            "total_growth_points": growth_delta,
            "growth_trajectory": "High Growth" if growth_delta >= 15 else "Steady Progress",
            "evolution_points": monthly_points,
        }


# Singleton instance
candidate_evolution_service = CandidateEvolutionService()

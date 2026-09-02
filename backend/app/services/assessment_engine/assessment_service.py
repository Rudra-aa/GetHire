"""
app/services/assessment_engine/assessment_service.py
------------------------------------------------------
Assessment Engine Service & DB Persistence Manager (Module 2).
Orchestrates adaptive quiz generation, answer scoring, Knowledge Graph building,
and MongoDB storage for assessment_sessions.

LOC Constraint: < 300 LOC
Single Responsibility: Assessment Session Management & Persistence
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.services.assessment_engine.mcq_engine import mcq_engine
from app.services.assessment_engine.knowledge_graph import knowledge_graph_builder

logger = get_logger(__name__)


class AssessmentService:
    """Manages technical assessment test sessions and score persistence."""

    async def create_assessment_session(
        self, db: AsyncIOMotorDatabase, user_id: str, target_role: str, experience_level: str
    ) -> Dict[str, Any]:
        """Creates a new assessment session with generated MCQs."""
        questions = mcq_engine.generate_assessment_quiz(target_role, experience_level)
        session_doc = {
            "user_id": user_id,
            "target_role": target_role,
            "experience_level": experience_level,
            "status": "active",
            "started_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "questions": questions,
            "score": 0,
        }

        res = await db["assessment_sessions"].insert_one(session_doc)
        session_doc["id"] = str(res.inserted_id)
        session_doc.pop("_id", None)
        logger.info("Assessment session created", user_id=user_id, session_id=session_doc["id"])
        return session_doc

    async def submit_assessment(
        self, db: AsyncIOMotorDatabase, user_id: str, assessment_id: str, candidate_answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Evaluates quiz submission, generates Knowledge Graph, and persists results."""
        eval_res = mcq_engine.evaluate_quiz_answers(candidate_answers)
        kg_res = knowledge_graph_builder.build_knowledge_graph(
            eval_res["strong_concepts"], eval_res["weak_concepts"], eval_res["score"]
        )

        result_doc = {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc),
            "score": eval_res["score"],
            "correct_count": eval_res["correct_count"],
            "total_questions": eval_res["total_questions"],
            "strong_concepts": eval_res["strong_concepts"],
            "weak_concepts": eval_res["weak_concepts"],
            "knowledge_graph": kg_res,
        }

        try:
            from bson import ObjectId
            await db["assessment_sessions"].update_one(
                {"_id": ObjectId(assessment_id)}, {"$set": result_doc}
            )
        except Exception:
            await db["assessment_sessions"].update_one(
                {"id": assessment_id}, {"$set": result_doc}
            )

        result_doc["id"] = assessment_id
        logger.info("Assessment submitted and scored", assessment_id=assessment_id, score=eval_res["score"])
        return result_doc

    async def get_latest_assessment(self, db: AsyncIOMotorDatabase, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves user's latest completed assessment session."""
        doc = await db["assessment_sessions"].find_one(
            {"user_id": user_id, "status": "completed"}, sort=[("completed_at", -1)]
        )
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        return doc


# Singleton instance
assessment_service = AssessmentService()

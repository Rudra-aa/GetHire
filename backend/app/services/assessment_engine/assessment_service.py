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


from bson import ObjectId


class AssessmentService:
    """Manages technical assessment test sessions and score persistence."""

    async def create_assessment_session(
        self, db: AsyncIOMotorDatabase, user_id: str, target_role: str, experience_level: str
    ) -> Dict[str, Any]:
        """Creates a new assessment session with generated MCQs."""
        questions = mcq_engine.generate_assessment_quiz(target_role, experience_level)
        session_doc = {
            "user_id": str(user_id),
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

        now = datetime.now(timezone.utc)
        result_doc = {
            "user_id": str(user_id),
            "status": "completed",
            "completed_at": now,
            "updated_at": now,
            "score": eval_res["score"],
            "correct_count": eval_res["correct_count"],
            "total_questions": eval_res["total_questions"],
            "strong_concepts": eval_res["strong_concepts"],
            "weak_concepts": eval_res["weak_concepts"],
            "knowledge_graph": kg_res,
        }

        user_filter = {"$in": [str(user_id), ObjectId(user_id)]} if ObjectId.is_valid(user_id) else str(user_id)
        matched = False

        if assessment_id and assessment_id != "sess-demo":
            filter_candidates = []
            if ObjectId.is_valid(assessment_id):
                filter_candidates.append({"_id": ObjectId(assessment_id)})
            filter_candidates.append({"id": assessment_id})
            filter_candidates.append({"_id": assessment_id})

            for fc in filter_candidates:
                update_res = await db["assessment_sessions"].update_one(fc, {"$set": result_doc})
                if update_res.matched_count > 0:
                    matched = True
                    break

        if not matched:
            # Try to update the user's most recent active assessment session
            update_res = await db["assessment_sessions"].update_one(
                {"user_id": user_filter, "status": "active"},
                {"$set": result_doc},
                sort=[("started_at", -1)],
            )
            if update_res.matched_count > 0:
                matched = True

        if not matched:
            # Upsert / insert a completed assessment session
            insert_doc = {
                "target_role": "Software Engineer",
                "experience_level": "Mid Level",
                "started_at": now,
                "questions": [],
                **result_doc,
            }
            ins_res = await db["assessment_sessions"].insert_one(insert_doc)
            result_doc["id"] = str(ins_res.inserted_id)
        else:
            result_doc["id"] = str(assessment_id)

        # Trigger automatic HireScore recomputation so dashboard is immediately up to date
        try:
            from app.services.hire_score_engine import get_or_compute_user_hirescore
            await get_or_compute_user_hirescore(db, user_id=str(user_id), force_recompute=True)
        except Exception as hs_err:
            logger.warning("HireScore auto-recompute after assessment notice", error=str(hs_err))

        logger.info("Assessment submitted and scored", assessment_id=result_doc["id"], score=eval_res["score"])
        return result_doc

    async def get_latest_assessment(self, db: AsyncIOMotorDatabase, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves user's latest completed assessment session."""
        user_filter = {"$in": [str(user_id), ObjectId(user_id)]} if ObjectId.is_valid(user_id) else str(user_id)
        doc = await db["assessment_sessions"].find_one(
            {"user_id": user_filter, "status": "completed"},
            sort=[("completed_at", -1), ("updated_at", -1), ("_id", -1)],
        )
        if not doc:
            # Fallback to any assessment session for this user with a valid score
            doc = await db["assessment_sessions"].find_one(
                {"user_id": user_filter, "score": {"$exists": True, "$gt": 0}},
                sort=[("completed_at", -1), ("updated_at", -1), ("_id", -1)],
            )
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        return doc


# Singleton instance
assessment_service = AssessmentService()

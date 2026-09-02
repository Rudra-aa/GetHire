"""
app/services/turn_evaluator.py
-------------------------------
Continuous Turn-Level Evaluation Engine for GetHire V3.2.
Evaluates candidate answers immediately after each question turn.

LOC Constraint: < 200 LOC
Single Responsibility: Immediate Per-Question Turn Evaluation
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.providers.gemini_live import gemini_live_provider
from app.core.logging import get_logger

logger = get_logger(__name__)


class TurnEvaluator:
    """Evaluates candidate response turns immediately and persists turn evidence."""

    async def evaluate_turn(
        self,
        db: AsyncIOMotorDatabase,
        session_id: str,
        turn_index: int,
        question_id: str,
        candidate_transcript: str,
        expected_skills: List[str],
        rubric: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Performs turn evaluation and appends result to session memory."""
        logger.info("Evaluating turn response", session_id=session_id, turn_index=turn_index)

        # Execute evaluation via provider
        eval_result = await gemini_live_provider.evaluate_turn_quality(
            candidate_transcript=candidate_transcript,
            expected_skills=expected_skills,
            rubric=rubric,
        )

        turn_eval_doc = {
            "session_id": session_id,
            "turn_index": turn_index,
            "question_id": question_id,
            "candidate_transcript": candidate_transcript,
            "technical_score": eval_result.get("technical_score", 75),
            "communication_score": eval_result.get("communication_score", 80),
            "verdict": eval_result.get("verdict", "Average"),
            "evidence_quote": eval_result.get("evidence_quote", candidate_transcript[:100]),
            "reasoning": eval_result.get("reasoning", "Answer provided."),
            "evaluated_at": datetime.now(timezone.utc),
        }

        # Persist turn evaluation
        await db["turn_evaluations"].insert_one(turn_eval_doc)
        
        turn_eval_doc["_id"] = str(turn_eval_doc["_id"])
        if "evaluated_at" in turn_eval_doc:
            turn_eval_doc["evaluated_at"] = turn_eval_doc["evaluated_at"].isoformat()

        return turn_eval_doc


# Singleton Instance
turn_evaluator = TurnEvaluator()

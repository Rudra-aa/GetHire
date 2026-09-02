"""
app/services/interview_intelligence_engine.py
----------------------------------------------
Interview Intelligence Engine for GetHire V3.2.
Dedicated decision brain for follow-up routing, question advancement,
and interview pacing. Keeps intelligence decisions separated from session orchestration.

LOC Constraint: < 300 LOC
Single Responsibility: Interview Decision & Follow-Up Engine
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


class InterviewIntelligenceEngine:
    """Decides turn advancement, dynamic follow-up, challenge routing, and interview completion."""

    def decide_next_action(
        self,
        current_question_index: int,
        total_questions: int,
        turn_evaluation: Dict[str, Any],
        rubric: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Determines next interview turn decision based on evaluation verdict and rubric."""
        verdict = turn_evaluation.get("verdict", "Average")
        score = turn_evaluation.get("technical_score", 75)
        is_last_question = current_question_index >= total_questions - 1

        logger.info(
            "Computing Interview Intelligence decision",
            current_index=current_question_index,
            verdict=verdict,
            score=score,
        )

        if is_last_question and score >= 70:
            return {
                "action": "complete_interview",
                "reason": "All blueprint questions completed successfully.",
                "follow_up_prompt": None,
            }

        # Decision Tree Logic
        if score >= 85:
            return {
                "action": "advance_question",
                "next_question_index": current_question_index + 1,
                "reason": "Excellent answer. Advancing to next topic.",
                "follow_up_prompt": None,
            }
        elif score >= 70:
            return {
                "action": "request_clarification",
                "next_question_index": current_question_index,
                "reason": "Average answer. Requesting technical clarification.",
                "follow_up_prompt": "Could you elaborate on how your approach handles edge-case failures under high load?",
            }
        elif score >= 50:
            return {
                "action": "challenge_answer",
                "next_question_index": current_question_index,
                "reason": "Weak answer. Challenging architecture assumptions.",
                "follow_up_prompt": "Interesting, but why choose this design over a distributed message queue?",
            }
        else:
            return {
                "action": "probe_deeper",
                "next_question_index": current_question_index,
                "reason": "Incomplete answer. Probing deeper for STAR methodology.",
                "follow_up_prompt": "Can you walk me step-by-step through the concrete implementation details?",
            }


# Singleton Instance
interview_intelligence_engine = InterviewIntelligenceEngine()

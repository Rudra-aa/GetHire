"""
app/domains/interview/rubric.py
--------------------------------
Rich Question Evaluation Rubric Schema for GetHire V3.2.

LOC Constraint: < 150 LOC
Single Responsibility: Question Evaluation Rubric Definition
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class QuestionRubricModel(BaseModel):
    question_id: str
    expected_skills: List[str] = Field(default_factory=list)
    evaluation_dimensions: List[str] = Field(default_factory=list)
    passing_threshold: float = 70.0
    weight: float = 1.0
    followup_rules: Dict[str, Any] = Field(
        default_factory=lambda: {
            "excellent_action": "advance_question",
            "average_action": "request_clarification",
            "weak_action": "challenge_answer",
            "incomplete_action": "probe_deeper",
        }
    )


def build_default_rubric(question_id: str, category: str) -> QuestionRubricModel:
    """Builds a default evaluation rubric for a given question."""
    return QuestionRubricModel(
        question_id=question_id,
        expected_skills=["System Architecture", "Problem Solving", "Code Quality"],
        evaluation_dimensions=["technical_accuracy", "concept_coverage", "communication"],
        passing_threshold=70.0,
        weight=1.0,
    )

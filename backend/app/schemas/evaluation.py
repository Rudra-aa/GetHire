"""
app/schemas/evaluation.py
-------------------------
Pydantic v2 validation and transfer schemas for Evaluation Engine REST endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Request Payloads ────────────────────────────────────────────────────────

class EvaluateAnswerRequest(BaseModel):
    """Payload to trigger evaluation for a specific session question."""
    session_id: str = Field(description="Interview Session ID")
    question_id: str = Field(description="Target Question ID")
    answer_text: Optional[str] = Field(default=None, description="Optional raw text override; pulls from DB if omitted")


class BatchEvaluateSessionRequest(BaseModel):
    """Payload to evaluate all answers in an interview session."""
    session_id: str = Field(description="Interview Session ID")


# ── Response Data Schemas ───────────────────────────────────────────────────

class DimensionScoreOut(BaseModel):
    score: int
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    explanation: str = ""


class EvaluationScoresOut(BaseModel):
    overall: int
    technical_accuracy: DimensionScoreOut
    concept_coverage: DimensionScoreOut
    problem_solving: DimensionScoreOut
    communication: DimensionScoreOut
    completeness: DimensionScoreOut
    confidence: Optional[DimensionScoreOut] = None
    presence: Optional[DimensionScoreOut] = None


class FollowUpRecommendationOut(BaseModel):
    follow_up_required: bool = False
    follow_up_reason: Optional[str] = None
    suggested_follow_up: Optional[str] = None


class EvaluationOut(BaseModel):
    id: str
    session_id: str
    question_id: str
    answer_id: Optional[str] = None
    user_id: str
    overall_score: int
    scores: EvaluationScoresOut
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommended_improvements: List[str] = Field(default_factory=list)
    follow_up: FollowUpRecommendationOut
    rubric_snapshot: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class BatchEvaluationResponseData(BaseModel):
    session_id: str
    overall_interview_score: int
    total_evaluated: int
    average_dimensions: Dict[str, int]
    evaluations: List[EvaluationOut]

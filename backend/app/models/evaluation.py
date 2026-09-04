"""
app/models/evaluation.py
------------------------
MongoDB domain models for Phase 4: Evaluation Engine.
Stores structured rubrics, dimensional scores, strengths/weaknesses,
and future-proof multimodal integration hooks.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PyObjectId


class DimensionScore(BaseModel):
    """Score breakdown for an individual evaluation dimension."""
    score: int = Field(ge=0, le=100, description="Normalized score 0-100")
    strengths: List[str] = Field(default_factory=list, description="Observed strengths in this dimension")
    weaknesses: List[str] = Field(default_factory=list, description="Identified areas for growth")
    explanation: str = Field(default="", description="Explainable rationale behind the dimension score")


class EvaluationScores(BaseModel):
    """Aggregate multidimensional scores for an answer."""
    overall: int = Field(ge=0, le=100, description="Weighted composite score 0-100")
    technical_accuracy: DimensionScore
    concept_coverage: DimensionScore
    problem_solving: DimensionScore
    communication: DimensionScore
    completeness: DimensionScore

    # Future multi-modal extensions (FaceSense / VoiceSense)
    confidence: Optional[DimensionScore] = None
    presence: Optional[DimensionScore] = None


class FollowUpRecommendation(BaseModel):
    """Actionable follow-up recommendation if concepts were missing or weak."""
    follow_up_required: bool = Field(default=False)
    follow_up_reason: Optional[str] = None
    suggested_follow_up: Optional[str] = None


class EvaluationModel(BaseModel):
    """
    Canonical Evaluation document stored in `evaluations` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    session_id: str = Field(description="Associated InterviewSession ID")
    question_id: str = Field(description="Target question identifier")
    answer_id: Optional[str] = Field(default=None, description="Associated Answer ID")
    user_id: str = Field(description="Candidate User ID")

    scores: EvaluationScores
    overall_score: int = Field(ge=0, le=100)

    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommended_improvements: List[str] = Field(default_factory=list)

    follow_up: FollowUpRecommendation = Field(default_factory=FollowUpRecommendation)
    rubric_snapshot: Dict[str, Any] = Field(default_factory=dict, description="Snapshot of the rubric applied")

    # Future integration hooks
    facesense_analysis_id: Optional[str] = None
    voicesense_analysis_id: Optional[str] = None
    hirescore_component_id: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

"""
app/models/evaluation_report.py
-------------------------------
MongoDB domain model for Immutable Evaluation History.
Represents a strict, immutable snapshot of one Assessment Attempt + one Interview Session,
along with its finalized HireScore.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PyObjectId
from app.models.hirescore import ReadinessDetails


class EvaluationReportModel(BaseModel):
    """
    Immutable Evaluation Report document stored in `evaluation_reports` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    candidate_id: str = Field(description="The User ID of the candidate")
    evaluation_number: int = Field(description="Sequential number for this candidate's reports (1, 2, 3...)")
    
    assessment_session_id: str = Field(description="The exact Assessment Session ID evaluated")
    interview_session_id: str = Field(description="The exact Interview Session ID evaluated")
    
    assessment_score: int = Field(ge=0, le=100)
    interview_score: int = Field(ge=0, le=100)
    
    # Aggregated dimensional scores for snapshot
    technical_accuracy: int = Field(ge=0, le=100, default=0)
    concept_coverage: int = Field(ge=0, le=100, default=0)
    problem_solving: int = Field(ge=0, le=100, default=0)
    communication: int = Field(ge=0, le=100, default=0)
    completeness: int = Field(ge=0, le=100, default=0)
    
    # AI extensions
    facesense_score: Optional[int] = Field(default=None)
    voicesense_score: Optional[int] = Field(default=None)
    
    # Final HireScore Snapshot
    hirescore: int = Field(ge=0, le=100)
    readiness: ReadinessDetails
    
    # Qualitative insights
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

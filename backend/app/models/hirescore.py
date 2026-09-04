"""
app/models/hirescore.py
------------------------
MongoDB domain models for Phase 5: HireScore Engine & Career Intelligence Platform.
Stores comprehensive candidate readiness intelligence, historical score snapshots,
industry benchmark calibrations, skill gaps, recommendations, and adaptive roadmaps.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PyObjectId


class HireScoreComponents(BaseModel):
    """Normalized 0-100 dimensional breakdown of candidate HireScore."""
    resume_quality: int = Field(ge=0, le=100, default=0)
    technical_accuracy: int = Field(ge=0, le=100, default=0)
    communication: int = Field(ge=0, le=100, default=0)
    problem_solving: int = Field(ge=0, le=100, default=0)
    concept_coverage: int = Field(ge=0, le=100, default=0)
    star_structure: int = Field(ge=0, le=100, default=0)
    interview_consistency: int = Field(ge=0, le=100, default=0)

    # Multi-modal extensions / Future placeholders
    voicesense_score: Optional[int] = Field(default=None, ge=0, le=100)
    facesense_score: Optional[int] = Field(default=None, ge=0, le=100)
    confidence_score: Optional[int] = Field(default=None, ge=0, le=100)
    eye_contact_score: Optional[int] = Field(default=None, ge=0, le=100)
    speech_clarity_score: Optional[int] = Field(default=None, ge=0, le=100)


class ReadinessDetails(BaseModel):
    """Synthesized interview readiness metrics and hiring verdict."""
    readiness_percentage: int = Field(ge=0, le=100, default=0)
    verdict: str = Field(default="Early Stage", description="Offer Ready | Hire | Borderline | Needs Improvement | Early Stage")
    confidence_level: str = Field(default="Medium", description="High | Medium | Low calibration confidence")
    summary: str = Field(default="")


class BenchmarkDetails(BaseModel):
    """Comparative benchmarking against industry peer levels."""
    target_level: str = Field(default="Mid", description="Junior | Mid | Senior | Staff")
    percentile: int = Field(ge=1, le=99, default=50)
    band: str = Field(default="Average", description="Top Tier | Above Average | Average | Below Average")
    relative_position: str = Field(default="Mid Ready", description="Readable hiring position summary")
    peer_averages: Dict[str, int] = Field(default_factory=dict, description="Benchmark averages for comparison")


class SkillGapItem(BaseModel):
    """Actionable skill gap detected from resume and interview evaluations."""
    skill: str
    severity: str = Field(description="Critical | High | Medium | Low")
    reason: str
    impact_score: int = Field(ge=1, le=10, description="Impact on HireScore (1-10)")
    learning_hours: int = Field(ge=1, description="Estimated hours to bridge gap")
    recommended_resources: List[str] = Field(default_factory=list)


class RecommendationDetails(BaseModel):
    """Personalized action items derived from evaluations and skill gaps."""
    daily_tasks: List[str] = Field(default_factory=list)
    weekly_goals: List[str] = Field(default_factory=list)
    practice_questions: List[str] = Field(default_factory=list)
    resume_improvements: List[str] = Field(default_factory=list)
    project_suggestions: List[str] = Field(default_factory=list)


class RoadmapMilestone(BaseModel):
    """Weekly adaptive roadmap milestone step."""
    week: int = Field(ge=1, le=6)
    title: str
    focus_area: str
    status: str = Field(default="upcoming", description="completed | active | upcoming")
    deliverables: List[str] = Field(default_factory=list)


class HireScoreModel(BaseModel):
    """
    Canonical HireScore document stored in `hirescores` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str = Field(description="Candidate User ID")
    session_id: Optional[str] = Field(default=None, description="Latest evaluated Interview Session ID")
    resume_id: Optional[str] = Field(default=None, description="Latest analyzed Resume ID")

    overall_score: int = Field(ge=0, le=100)
    components: HireScoreComponents = Field(default_factory=HireScoreComponents)
    readiness: ReadinessDetails = Field(default_factory=ReadinessDetails)
    benchmark: BenchmarkDetails = Field(default_factory=BenchmarkDetails)
    gaps: List[SkillGapItem] = Field(default_factory=list)
    recommendations: RecommendationDetails = Field(default_factory=RecommendationDetails)
    career_roadmap: List[RoadmapMilestone] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

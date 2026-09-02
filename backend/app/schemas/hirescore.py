"""
app/schemas/hirescore.py
-------------------------
Pydantic v2 validation and transfer schemas for HireScore & Career Intelligence REST endpoints.
"""

from __future__ import annotations

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ── Sub-component Transfer Schemas ─────────────────────────────────────────

class HireScoreComponentsOut(BaseModel):
    resume_quality: int
    technical_accuracy: int
    communication: int
    problem_solving: int
    concept_coverage: int
    star_structure: int
    interview_consistency: int
    voicesense_score: Optional[int] = None
    facesense_score: Optional[int] = None
    confidence_score: Optional[int] = None
    eye_contact_score: Optional[int] = None
    speech_clarity_score: Optional[int] = None


class ReadinessDetailsOut(BaseModel):
    readiness_percentage: int
    verdict: str
    confidence_level: str
    summary: str


class BenchmarkDetailsOut(BaseModel):
    target_level: str
    percentile: int
    band: str
    relative_position: str
    peer_averages: Dict[str, int] = Field(default_factory=dict)


class SkillGapItemOut(BaseModel):
    skill: str
    severity: str
    reason: str
    impact_score: int
    learning_hours: int
    recommended_resources: List[str] = Field(default_factory=list)


class RecommendationDetailsOut(BaseModel):
    daily_tasks: List[str] = Field(default_factory=list)
    weekly_goals: List[str] = Field(default_factory=list)
    practice_questions: List[str] = Field(default_factory=list)
    resume_improvements: List[str] = Field(default_factory=list)
    project_suggestions: List[str] = Field(default_factory=list)


class RoadmapMilestoneOut(BaseModel):
    week: int
    title: str
    focus_area: str
    status: str
    deliverables: List[str] = Field(default_factory=list)


# ── Full HireScore Entity Response ─────────────────────────────────────────

class HireScoreSummaryOut(BaseModel):
    id: str
    user_id: str
    session_id: Optional[str] = None
    resume_id: Optional[str] = None
    overall_score: int
    components: HireScoreComponentsOut
    readiness: ReadinessDetailsOut
    benchmark: BenchmarkDetailsOut
    gaps: List[SkillGapItemOut] = Field(default_factory=list)
    recommendations: RecommendationDetailsOut
    career_roadmap: List[RoadmapMilestoneOut] = Field(default_factory=list)
    created_at: str
    updated_at: str


class HireScoreHistoryItemOut(BaseModel):
    id: str
    overall_score: int
    readiness_percentage: int
    verdict: str
    target_level: str
    created_at: str


class RecomputeHireScoreRequest(BaseModel):
    session_id: Optional[str] = Field(default=None, description="Optional interview session ID to anchor calculation")

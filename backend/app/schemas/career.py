"""
app/schemas/career.py
---------------------
Pydantic schemas for Module 6 Career Intelligence and Recruiter Portfolio sharing.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ShareSettingsResponse(BaseModel):
    configured: bool = Field(description="Whether public sharing is configured with a valid public domain")
    public_base_url: Optional[str] = Field(default=None, description="Public frontend base URL if configured")
    share_token: Optional[str] = Field(default=None, description="Active recruiter share token")
    share_url: Optional[str] = Field(default=None, description="Complete verified public share URL")
    is_public: bool = Field(default=False, description="Whether public recruiter access is actively enabled")
    include_assessment: bool = Field(default=False, description="Whether verified technical assessment is included")
    include_interview: bool = Field(default=False, description="Interview recordings sharing (permanently False)")
    recordings_available: bool = Field(default=False, description="Whether interview session recordings storage exists")
    has_assessment: bool = Field(default=False, description="Whether candidate has completed a technical assessment")
    access_count: Optional[int] = Field(default=None, description="Persisted recruiter views count from real analytics")


class UpdateShareSettingsRequest(BaseModel):
    is_public: Optional[bool] = Field(default=None, description="Toggle public access on/off")
    include_assessment: Optional[bool] = Field(default=None, description="Toggle assessment inclusion on/off")
    include_interview: Optional[bool] = Field(default=None, description="Attempting to toggle recordings (will be ignored/False)")


class PublicPortfolioResponse(BaseModel):
    candidate_name: str
    target_role: str
    experience_level: str
    overall_hirescore: int
    hiring_verdict: str
    skills: List[str]
    assessment_score: Optional[int] = None
    assessment_concepts: Optional[Dict[str, Any]] = None
    components: Dict[str, Any] = Field(default_factory=dict)
    verified: bool = True

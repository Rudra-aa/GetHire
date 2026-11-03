"""
app/schemas/assessment.py
--------------------------
Pydantic v2 validation schemas for Module 2: Assessment Engine REST endpoints.
"""

from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, Field


class StartAssessmentRequest(BaseModel):
    """Payload to initialize a new technical assessment test session."""
    target_role: Optional[str] = Field(default=None, min_length=2, max_length=100, description="Target role name")
    experience_level: Optional[str] = Field(default=None, min_length=2, max_length=50, description="Experience level: Entry | Mid Level | Senior")


class SubmitAssessmentRequest(BaseModel):
    """Payload to evaluate candidate assessment submissions and generate Knowledge Graph."""
    assessment_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Assessment session ID")
    answers: List[Any] = Field(default_factory=list, description="Candidate submitted answers")

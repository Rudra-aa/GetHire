"""
app/schemas/resume.py
---------------------
Pydantic response and transfer schemas for Resume Intelligence endpoints.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.resume import (
    CertificationItem,
    EducationItem,
    ExperienceItem,
    PersonalInfo,
    ProjectItem,
    QualityScoreBreakdown,
)


class ResumeSummaryOut(BaseModel):
    id: str
    user_id: str
    version: int
    filename: str
    file_size_bytes: int
    page_count: int
    status: str
    quality_score: QualityScoreBreakdown
    created_at: str
    updated_at: str


class ParsedDataOut(BaseModel):
    personal_info: PersonalInfo
    skills: List[str]
    technologies: List[str]
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    education: List[EducationItem]
    certifications: List[CertificationItem]


class ResumeDetailResponseData(BaseModel):
    id: str
    user_id: str
    version: int
    filename: str
    file_size_bytes: int
    page_count: int
    status: str
    raw_text: str
    parsed_data: ParsedDataOut
    quality_score: QualityScoreBreakdown
    created_at: str
    updated_at: str


class ResumeUploadResponseData(BaseModel):
    resume: ResumeDetailResponseData


class ResumeStatusResponseData(BaseModel):
    id: str
    status: str
    quality_score: Optional[int] = None
    error_message: Optional[str] = None

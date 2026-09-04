"""
app/models/resume.py
--------------------
MongoDB domain models for structured Resume Intelligence in GetHire.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PyObjectId


class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None


class ExperienceItem(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    location: Optional[str] = None
    bullets: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    bullets: List[str] = Field(default_factory=list)
    link: Optional[str] = None


class EducationItem(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None


class CertificationItem(BaseModel):
    name: str
    issuer: Optional[str] = None
    year: Optional[str] = None
    url: Optional[str] = None


class QualityScoreBreakdown(BaseModel):
    overall_score: int = Field(ge=0, le=100, description="Overall score 0-100")
    completeness_score: int = Field(ge=0, le=100)
    skills_score: int = Field(ge=0, le=100)
    impact_score: int = Field(ge=0, le=100)
    structure_score: int = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)


class ParsedResumeData(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    skills: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)


class ResumeModel(BaseModel):
    """
    Canonical Resume domain model stored in the `resumes` MongoDB collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId = Field(description="Owner user ID")
    version: int = Field(default=1, description="Resume version number")
    
    filename: str = Field(description="Original uploaded filename")
    file_path: str = Field(description="Absolute storage path on disk")
    file_size_bytes: int = Field(description="File size in bytes")
    page_count: int = Field(default=1, description="Total PDF page count")
    raw_text: str = Field(default="", description="Extracted raw text")

    status: str = Field(
        default="completed",
        description="Status: uploaded | extracting | parsing | completed | failed"
    )
    error_message: Optional[str] = None

    parsed_data: ParsedResumeData = Field(default_factory=ParsedResumeData)
    quality_score: QualityScoreBreakdown = Field(
        default_factory=lambda: QualityScoreBreakdown(
            overall_score=75,
            completeness_score=80,
            skills_score=75,
            impact_score=70,
            structure_score=75,
            strengths=["Clear section structure"],
            improvements=["Add more quantifiable metrics"],
        )
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

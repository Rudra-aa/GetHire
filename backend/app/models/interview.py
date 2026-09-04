"""
app/models/interview.py
-----------------------
MongoDB domain models for Phase 3 AI Interview Engine.
Normalized collections for Interview Sessions and Answers with future-proof hooks.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PyObjectId


class InterviewQuestion(BaseModel):
    """A personalized, contextualized interview question."""
    id: str = Field(description="Unique question identifier within session")
    position: int = Field(default=1, description="Question sequence index (1-based)")
    category: str = Field(description="Technical | Behavioral | Projects | Resume-based | Problem Solving")
    difficulty: str = Field(description="Easy | Medium | Hard")
    question_text: str = Field(description="The formulated interview prompt")
    context_snippet: Optional[str] = Field(default=None, description="Resume or role context hook")
    skill_targeted: Optional[str] = Field(default=None, description="Primary skill or competency targeted")
    expected_concepts: List[str] = Field(default_factory=list, description="Key criteria for evaluation engine")
    source: str = Field(default="dataset", description="resume.projects | resume.experience | dataset | system_design")


class InterviewAnswerModel(BaseModel):
    """
    Independent candidate answer document stored in `interview_answers` collection.
    Prevents MongoDB 16MB document cap and enables high-frequency autosave drafts.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    session_id: str = Field(description="Associated InterviewSession ID")
    user_id: str = Field(description="Candidate User ID")
    question_id: str = Field(description="Associated question identifier")

    answer_text: str = Field(default="", description="Candidate transcript or text response")
    is_draft: bool = Field(default=False, description="True if background autosaved draft")
    word_count: int = Field(default=0, description="Response word count")
    time_taken_seconds: int = Field(default=0, description="Time spent on this question")

    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    submitted_at: Optional[datetime] = None

    # Future evaluation result attachment
    evaluation_result: Optional[Dict[str, Any]] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


class InterviewSessionModel(BaseModel):
    """
    Canonical Interview Session document stored in `interview_sessions` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str = Field(description="Candidate User ID")
    resume_id: Optional[str] = Field(default=None, description="Source Resume ID")

    target_role: str = Field(default="Fullstack Developer", description="Target job role")
    experience_level: str = Field(default="mid", description="entry | mid | senior")
    interview_type: str = Field(default="mixed", description="technical | behavioral | mixed")

    status: str = Field(
        default="running",
        description="draft | running | paused | completed | cancelled | expired"
    )

    total_questions: int = Field(default=10)
    current_question_index: int = Field(default=0, description="0-based current active question index")
    overall_progress: float = Field(default=0.0, description="Completion percentage 0.0-100.0")
    elapsed_seconds: int = Field(default=0, description="Total active seconds spent in interview")

    questions: List[InterviewQuestion] = Field(default_factory=list)

    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    paused_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Future attachment hooks for downstream engines
    evaluation_id: Optional[str] = None
    facesense_session_id: Optional[str] = None
    voicesense_session_id: Optional[str] = None
    hirescore_id: Optional[str] = None
    report_id: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

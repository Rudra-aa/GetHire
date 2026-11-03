"""
app/schemas/interview.py
------------------------
Pydantic v2 validation and transfer schemas for Interview Engine REST endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator

from app.models.interview import InterviewQuestion


# ── Request Payloads ────────────────────────────────────────────────────────

class StartInterviewSessionRequest(BaseModel):
    """Payload to initialize a new personalized interview session."""
    resume_id: Optional[str] = Field(default=None, max_length=50, description="Optional resume ID; uses latest if omitted")
    target_role: Optional[str] = Field(default=None, min_length=2, max_length=100, description="Target role (e.g. Frontend Developer)")
    experience_level: Optional[str] = Field(default=None, max_length=50, description="entry | mid | senior")
    interview_type: str = Field(default="mixed", pattern=r"^(technical|behavioral|mixed)$", description="technical | behavioral | mixed")
    total_questions: int = Field(default=10, ge=5, le=20, description="Total question count (5-20)")

    @field_validator("experience_level")
    @classmethod
    def validate_experience_level(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        allowed = {"entry", "mid", "senior"}
        if v.lower() not in allowed:
            raise ValueError("Experience level must be one of: entry, mid, senior")
        return v.lower()


class UpdateSessionStateRequest(BaseModel):
    """Payload to update session progression, elapsed time, or state."""
    status: Optional[str] = Field(default=None, pattern=r"^(running|paused|completed|cancelled)$", description="running | paused | completed | cancelled")
    current_question_index: Optional[int] = Field(default=None, ge=0, le=100)
    elapsed_seconds: Optional[int] = Field(default=None, ge=0, le=86400)


class SubmitAnswerRequest(BaseModel):
    """Payload to autosave draft or submit finalized answer."""
    question_id: str = Field(..., min_length=1, max_length=100, description="Target question identifier")
    answer_text: str = Field(..., min_length=1, max_length=50000, description="Transcript or text answer")
    time_taken_seconds: int = Field(default=0, ge=0, le=86400)
    is_draft: bool = Field(default=False, description="True for debounced autosave draft")


class TurnRequest(BaseModel):
    """Payload for conversational turn transcript processing."""
    candidate_transcript: str = Field(..., min_length=1, max_length=10000, description="Candidate speech or text turn transcript")


# ── Response Data Schemas ───────────────────────────────────────────────────

class InterviewAnswerOut(BaseModel):
    id: str
    session_id: str
    question_id: str
    answer_text: str
    is_draft: bool
    word_count: int
    time_taken_seconds: int
    started_at: str
    submitted_at: Optional[str] = None
    evaluation_result: Optional[Dict[str, Any]] = None


class InterviewSessionResponseData(BaseModel):
    id: str
    user_id: str
    resume_id: Optional[str] = None
    target_role: str
    experience_level: str
    interview_type: str
    status: str
    total_questions: int
    current_question_index: int
    overall_progress: float
    elapsed_seconds: int
    questions: List[InterviewQuestion]
    answers: List[InterviewAnswerOut] = Field(default_factory=list)
    transcripts: List[Dict[str, Any]] = Field(default_factory=list)
    started_at: str
    paused_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str
    updated_at: str


class InterviewHistoryItem(BaseModel):
    id: str
    target_role: str
    experience_level: str
    interview_type: str
    status: str
    total_questions: int
    answers_count: int
    overall_progress: float
    elapsed_seconds: int
    started_at: str
    completed_at: Optional[str] = None


class InterviewHistoryResponseData(BaseModel):
    sessions: List[InterviewHistoryItem]
    total: int

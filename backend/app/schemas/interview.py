"""
app/schemas/interview.py
------------------------
Pydantic v2 validation and transfer schemas for Interview Engine REST endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.models.interview import InterviewQuestion


# ── Request Payloads ────────────────────────────────────────────────────────

class StartInterviewSessionRequest(BaseModel):
    """Payload to initialize a new personalized interview session."""
    resume_id: Optional[str] = Field(default=None, description="Optional resume ID; uses latest if omitted")
    target_role: Optional[str] = Field(default=None, description="Target role (e.g. Frontend Developer)")
    experience_level: Optional[str] = Field(default=None, description="entry | mid | senior")
    interview_type: str = Field(default="mixed", description="technical | behavioral | mixed")
    total_questions: int = Field(default=10, ge=5, le=20, description="Total question count (5-20)")


class UpdateSessionStateRequest(BaseModel):
    """Payload to update session progression, elapsed time, or state."""
    status: Optional[str] = Field(default=None, description="running | paused | completed | cancelled")
    current_question_index: Optional[int] = Field(default=None, ge=0)
    elapsed_seconds: Optional[int] = Field(default=None, ge=0)


class SubmitAnswerRequest(BaseModel):
    """Payload to autosave draft or submit finalized answer."""
    question_id: str = Field(description="Target question identifier")
    answer_text: str = Field(description="Transcript or text answer")
    time_taken_seconds: int = Field(default=0, ge=0)
    is_draft: bool = Field(default=False, description="True for debounced autosave draft")


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

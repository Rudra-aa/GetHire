"""
schemas.py
----------
Pydantic request/response models for all GetHire API endpoints.
"""

from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Interview / Question Generation
# ---------------------------------------------------------------------------

class GenerateQuestionsRequest(BaseModel):
    skills: list[str] = Field(..., description="List of canonical skill names extracted from resume")
    session_id: Optional[str] = Field(None, description="Optional existing session ID to attach questions to")
    max_per_skill: Optional[int] = Field(5, ge=1, le=20, description="Max questions per skill (default 5)")

    class Config:
        json_schema_extra = {
            "example": {
                "skills": ["Python", "React", "SQL"],
                "max_per_skill": 5
            }
        }


class QuestionOut(BaseModel):
    id: str
    skill: str
    difficulty: str
    question: str
    topic: str


class GenerateQuestionsResponse(BaseModel):
    session_id: str
    questions: list[QuestionOut]
    total: int
    skills_used: list[str]
    skills_skipped: list[str]


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------

class SessionCreate(BaseModel):
    candidate_name: Optional[str] = Field("Candidate", description="Candidate's name")
    skills: list[str] = Field(..., description="Detected skills from resume")
    resume_text: Optional[str] = Field(None, description="Full resume text")


class SessionResponse(BaseModel):
    session_id: str
    candidate_name: str
    skills: list[str]
    status: str  # "created" | "in_progress" | "completed"
    created_at: str


# ---------------------------------------------------------------------------
# Answer Submission
# ---------------------------------------------------------------------------

class SubmitAnswerRequest(BaseModel):
    session_id: str = Field(..., description="Interview session ID")
    question_id: str = Field(..., description="Question ID being answered")
    question_text: str = Field(..., description="The question text")
    answer_text: str = Field(..., description="Candidate's answer")
    skill: str = Field(..., description="Skill being tested")
    difficulty: str = Field(..., description="Question difficulty: easy/medium/hard")
    time_taken_seconds: Optional[int] = Field(None, description="Time taken in seconds")


class EvaluateAnswerResponse(BaseModel):
    question_id: str
    technical_score: float = Field(..., ge=0, le=100)
    communication_score: float = Field(..., ge=0, le=100)
    feedback: str
    strengths: list[str]
    improvements: list[str]
    keywords_matched: list[str]


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

class ScoreRequest(BaseModel):
    session_id: str
    technical_score: float = Field(..., ge=0, le=100)
    communication_score: float = Field(..., ge=0, le=100)
    face_score: Optional[float] = Field(75.0, ge=0, le=100)
    voice_score: Optional[float] = Field(70.0, ge=0, le=100)


class ScoreResponse(BaseModel):
    session_id: str
    technical_score: float
    communication_score: float
    face_score: float
    voice_score: float
    overall_score: float
    recommendation: str  # "Strong Hire" | "Hire" | "Maybe" | "No Hire"
    recommendation_color: str  # hex color for UI


# ---------------------------------------------------------------------------
# Follow-up
# ---------------------------------------------------------------------------

class FollowUpRequest(BaseModel):
    session_id: str
    question: str
    candidate_answer: str
    skill: str


class FollowUpResponse(BaseModel):
    follow_up_question: str


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

class ReportRequest(BaseModel):
    session_id: str
    candidate_name: Optional[str] = "Candidate"


class ReportResponse(BaseModel):
    session_id: str
    report_url: str
    generated_at: str

"""
interview.py
------------
FastAPI router for Interview Session Management.

Endpoints:
    POST /api/v1/sessions              — Create interview session
    GET  /api/v1/sessions/{id}         — Get session details
    POST /api/v1/generate-questions    — Generate interview questions
    GET  /api/v1/sessions/{id}/questions — Get session questions
    POST /api/v1/follow-up             — Get a follow-up question
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from backend.database.session_store import (
    create_session, get_session, set_session_questions, get_session_questions
)
from backend.models.schemas import (
    GenerateQuestionsRequest, GenerateQuestionsResponse, QuestionOut,
    SessionCreate, SessionResponse,
    FollowUpRequest, FollowUpResponse,
)
from backend.services.question_generator import QuestionGenerator
from backend.services.evaluator_service import generate_follow_up


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/v1", tags=["Interview"])
_generator = QuestionGenerator()


# ---------------------------------------------------------------------------
# Session Management
# ---------------------------------------------------------------------------

@router.post(
    "/sessions",
    summary="Create a new interview session",
    status_code=status.HTTP_201_CREATED,
)
async def create_interview_session(body: SessionCreate) -> JSONResponse:
    """
    Create an interview session after resume upload.
    Returns a session_id used in all subsequent calls.
    """
    session = create_session(
        candidate_name=body.candidate_name or "Candidate",
        skills=body.skills,
        resume_text=body.resume_text or "",
    )
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "session_id": session["session_id"],
            "candidate_name": session["candidate_name"],
            "skills": session["skills"],
            "status": session["status"],
            "created_at": session["created_at"],
        },
    )


@router.get(
    "/sessions/{session_id}",
    summary="Get session details",
)
async def get_interview_session(session_id: str) -> JSONResponse:
    """Retrieve session metadata and status."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    return JSONResponse(content={
        "session_id": session["session_id"],
        "candidate_name": session["candidate_name"],
        "skills": session["skills"],
        "status": session["status"],
        "created_at": session["created_at"],
        "question_count": len(session.get("questions", [])),
    })


# ---------------------------------------------------------------------------
# Question Generation
# ---------------------------------------------------------------------------

@router.post(
    "/generate-questions",
    summary="Generate personalized interview questions from extracted skills",
    response_description="List of questions with difficulty and topic",
)
async def generate_questions(body: GenerateQuestionsRequest) -> JSONResponse:
    """
    Generate a balanced set of interview questions based on candidate's skills.

    Uses the Pyramid Distribution (2 easy / 2 medium / 1 hard per skill).
    Questions are randomized and deduplicated across skills.

    If a session_id is provided, questions are attached to that session.
    Otherwise, a new session is created automatically.
    """
    if not body.skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one skill is required to generate questions.",
        )

    # Generate questions via question generator
    result = _generator.generate(body.skills)

    if not result.questions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"No questions found for skills: {body.skills}. "
                "Please ensure skills match supported categories."
            ),
        )

    # Build question list with IDs
    questions_out: list[dict] = []
    for q in result.questions:
        q_dict = {
            "id": str(uuid.uuid4()),
            "skill": q.skill,
            "difficulty": q.difficulty,
            "question": q.question,
            "topic": q.topic,
        }
        questions_out.append(q_dict)

    # Attach to session if provided
    session_id = body.session_id
    if session_id:
        session = get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session '{session_id}' not found.",
            )
        set_session_questions(session_id, questions_out)
    else:
        # Auto-create a session
        session = create_session(
            candidate_name="Candidate",
            skills=body.skills,
        )
        session_id = session["session_id"]
        set_session_questions(session_id, questions_out)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "session_id": session_id,
            "questions": questions_out,
            "total": result.total,
            "skills_used": result.skills_used,
            "skills_skipped": result.skills_skipped,
        },
    )


@router.get(
    "/sessions/{session_id}/questions",
    summary="Get all questions for a session",
)
async def get_session_questions_endpoint(session_id: str) -> JSONResponse:
    """Return all questions attached to an interview session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )

    questions = get_session_questions(session_id)
    return JSONResponse(content={
        "session_id": session_id,
        "questions": questions,
        "total": len(questions),
    })


# ---------------------------------------------------------------------------
# Follow-up Question
# ---------------------------------------------------------------------------

@router.post(
    "/follow-up",
    summary="Generate a follow-up question based on candidate's answer",
)
async def get_follow_up(body: FollowUpRequest) -> JSONResponse:
    """
    Generate a contextual follow-up question.

    The follow-up type adapts to answer quality:
    - Short/shallow answer → probing elaboration question
    - Good answer → deeper production/edge-case question
    - Average answer → clarification/tradeoff question
    """
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{body.session_id}' not found.",
        )

    follow_up = generate_follow_up(
        question=body.question,
        answer=body.candidate_answer,
        skill=body.skill,
    )

    return JSONResponse(content={
        "session_id": body.session_id,
        "follow_up_question": follow_up,
    })

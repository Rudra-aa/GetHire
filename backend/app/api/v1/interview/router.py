"""
app/api/v1/interview/router.py
------------------------------
Resource-oriented REST API endpoints for Phase 3 AI Interview Engine.
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.interview import InterviewAnswerModel, InterviewSessionModel
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.interview import (
    InterviewAnswerOut,
    InterviewHistoryItem,
    InterviewHistoryResponseData,
    InterviewSessionResponseData,
    StartInterviewSessionRequest,
    SubmitAnswerRequest,
    UpdateSessionStateRequest,
)
from app.services.interview_answer_service import (
    get_answers_for_session,
    save_interview_answer,
)
from app.services.interview_session_service import (
    complete_interview_session,
    create_interview_session,
    get_interview_session,
    get_user_interview_history,
    update_session_state,
)

interview_router = APIRouter()


def _format_answer_out(answer: InterviewAnswerModel) -> InterviewAnswerOut:
    return InterviewAnswerOut(
        id=str(answer.id),
        session_id=answer.session_id,
        question_id=answer.question_id,
        answer_text=answer.answer_text,
        is_draft=answer.is_draft,
        word_count=answer.word_count,
        time_taken_seconds=answer.time_taken_seconds,
        started_at=answer.started_at.isoformat(),
        submitted_at=answer.submitted_at.isoformat() if answer.submitted_at else None,
        evaluation_result=answer.evaluation_result,
    )


def _format_session_response(
    session: InterviewSessionModel,
    answers: List[InterviewAnswerModel],
) -> InterviewSessionResponseData:
    return InterviewSessionResponseData(
        id=str(session.id),
        user_id=session.user_id,
        resume_id=session.resume_id,
        target_role=session.target_role,
        experience_level=session.experience_level,
        interview_type=session.interview_type,
        status=session.status,
        total_questions=session.total_questions,
        current_question_index=session.current_question_index,
        overall_progress=session.overall_progress,
        elapsed_seconds=session.elapsed_seconds,
        questions=session.questions,
        answers=[_format_answer_out(a) for a in answers],
        started_at=session.started_at.isoformat(),
        paused_at=session.paused_at.isoformat() if session.paused_at else None,
        completed_at=session.completed_at.isoformat() if session.completed_at else None,
        created_at=session.created_at.isoformat(),
        updated_at=session.updated_at.isoformat(),
    )


# ── POST /sessions ──────────────────────────────────────────────────────────

@interview_router.post(
    "/sessions",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create & start a personalized interview session",
)
async def start_session(
    payload: StartInterviewSessionRequest,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    session = await create_interview_session(db, user_id, payload)
    data = _format_session_response(session, [])

    return APIResponse(
        success=True,
        message="Interview session initialized successfully.",
        data=data.model_dump(),
    )


# ── GET /sessions/history ───────────────────────────────────────────────────

@interview_router.get(
    "/sessions/history",
    response_model=APIResponse,
    summary="Retrieve candidate interview history",
)
async def list_history(
    limit: int = Query(default=20, ge=1, le=50),
    skip: int = Query(default=0, ge=0),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    sessions, total = await get_user_interview_history(db, user_id, limit=limit, skip=skip)

    items: List[InterviewHistoryItem] = []
    for s in sessions:
        # Query answer count
        ans_count = await db["interview_answers"].count_documents({"session_id": str(s.id), "is_draft": False})
        items.append(
            InterviewHistoryItem(
                id=str(s.id),
                target_role=s.target_role,
                experience_level=s.experience_level,
                interview_type=s.interview_type,
                status=s.status,
                total_questions=s.total_questions,
                answers_count=ans_count,
                overall_progress=s.overall_progress,
                elapsed_seconds=s.elapsed_seconds,
                started_at=s.started_at.isoformat(),
                completed_at=s.completed_at.isoformat() if s.completed_at else None,
            )
        )

    out_data = InterviewHistoryResponseData(sessions=items, total=total)
    return APIResponse(
        success=True,
        message="Interview history retrieved.",
        data=out_data.model_dump(),
    )


# ── GET /sessions/{id} ──────────────────────────────────────────────────────

@interview_router.get(
    "/sessions/{session_id}",
    response_model=APIResponse,
    summary="Retrieve interview session state and answers",
)
async def get_session(
    session_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    session = await get_interview_session(db, session_id, user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    answers = await get_answers_for_session(db, session_id, user_id)
    data = _format_session_response(session, answers)

    return APIResponse(
        success=True,
        message="Interview session retrieved.",
        data=data.model_dump(),
    )


# ── PATCH /sessions/{id} ────────────────────────────────────────────────────

@interview_router.patch(
    "/sessions/{session_id}",
    response_model=APIResponse,
    summary="Update session state, question index, or elapsed timer",
)
async def patch_session(
    session_id: str,
    payload: UpdateSessionStateRequest,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    session = await update_session_state(db, session_id, user_id, payload)
    answers = await get_answers_for_session(db, session_id, user_id)
    data = _format_session_response(session, answers)

    return APIResponse(
        success=True,
        message="Session state updated.",
        data=data.model_dump(),
    )


# ── POST /sessions/{id}/answers ─────────────────────────────────────────────

@interview_router.post(
    "/sessions/{session_id}/answers",
    response_model=APIResponse,
    summary="Autosave draft or submit finalized answer",
)
async def submit_answer(
    session_id: str,
    payload: SubmitAnswerRequest,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    answer = await save_interview_answer(db, session_id, user_id, payload)
    return APIResponse(
        success=True,
        message="Answer saved successfully." if not payload.is_draft else "Draft autosaved.",
        data=_format_answer_out(answer).model_dump(),
    )


# ── GET /sessions/{id}/answers ──────────────────────────────────────────────

@interview_router.get(
    "/sessions/{session_id}/answers",
    response_model=APIResponse,
    summary="Get all answers and drafts for a session",
)
async def list_answers(
    session_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    answers = await get_answers_for_session(db, session_id, user_id)
    return APIResponse(
        success=True,
        message="Answers retrieved.",
        data={"answers": [_format_answer_out(a).model_dump() for a in answers]},
    )


# ── POST /sessions/{id}/complete ────────────────────────────────────────────

@interview_router.post(
    "/sessions/{session_id}/complete",
    response_model=APIResponse,
    summary="Finalize and complete interview session",
)
async def finish_session(
    session_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    session = await complete_interview_session(db, session_id, user_id)
    answers = await get_answers_for_session(db, session_id, user_id)
    data = _format_session_response(session, answers)

    return APIResponse(
        success=True,
        message="Interview completed successfully.",
        data=data.model_dump(),
    )


# ── POST /sessions/{id}/turn ────────────────────────────────────────────────

@interview_router.post(
    "/sessions/{session_id}/turn",
    response_model=APIResponse,
    summary="Process candidate turn response through Interview Orchestrator",
)
async def process_session_turn(
    session_id: str,
    candidate_transcript: str = Query(..., description="Candidate speech or text turn transcript"),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    from app.services.interview_orchestrator import interview_orchestrator
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    res = await interview_orchestrator.process_turn(db, session_id, user_id, candidate_transcript)
    return APIResponse(
        success=True,
        message="Turn processed successfully.",
        data=res,
    )


# ── GET /sessions/{id}/recover ──────────────────────────────────────────────

@interview_router.get(
    "/sessions/{session_id}/recover",
    response_model=APIResponse,
    summary="Recover active interview session state upon browser refresh",
)
async def recover_session_state(
    session_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    session = await get_interview_session(db, session_id, user_id)
    answers = await get_answers_for_session(db, session_id, user_id)
    data = _format_session_response(session, answers)

    return APIResponse(
        success=True,
        message="Session recovered successfully.",
        data=data.model_dump(),
    )


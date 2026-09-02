"""
app/services/interview_answer_service.py
----------------------------------------
Interview Answer & Autosave Draft Management Service.
Handles debounced autosaving, word count calculation, and answer submission.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.models.interview import InterviewAnswerModel
from app.schemas.interview import SubmitAnswerRequest
from app.services.interview_session_service import get_interview_session

logger = get_logger(__name__)


async def save_interview_answer(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
    payload: SubmitAnswerRequest,
) -> InterviewAnswerModel:
    """
    Upsert candidate response as a background draft or finalized answer.
    """
    session = await get_interview_session(db, session_id, user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    # Validate question_id belongs to this session
    valid_q_ids = {q.id for q in session.questions}
    if payload.question_id not in valid_q_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": f"Question '{payload.question_id}' does not belong to session.", "errors": [{"code": "INVALID_QUESTION_ID"}]},
        )

    now = datetime.now(timezone.utc)
    word_count = len(payload.answer_text.strip().split()) if payload.answer_text else 0

    filter_query = {
        "session_id": session_id,
        "question_id": payload.question_id,
    }

    update_doc = {
        "$set": {
            "session_id": session_id,
            "user_id": user_id,
            "question_id": payload.question_id,
            "answer_text": payload.answer_text,
            "is_draft": payload.is_draft,
            "word_count": word_count,
            "time_taken_seconds": payload.time_taken_seconds,
            "updated_at": now,
        },
        "$setOnInsert": {
            "started_at": now,
            "created_at": now,
        },
    }

    if not payload.is_draft:
        update_doc["$set"]["submitted_at"] = now

    await db["interview_answers"].update_one(filter_query, update_doc, upsert=True)

    # If finalized (not draft), auto-advance session question index if matching current
    if not payload.is_draft:
        curr_idx = session.current_question_index
        # Find index of this question
        q_indices = {q.id: idx for idx, q in enumerate(session.questions)}
        answered_idx = q_indices.get(payload.question_id, curr_idx)

        # Advance to next question if currently at this question
        if answered_idx == curr_idx and curr_idx + 1 < session.total_questions:
            next_idx = curr_idx + 1
            progress = round(((next_idx) / session.total_questions) * 100.0, 1)
            await db["interview_sessions"].update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"current_question_index": next_idx, "overall_progress": progress, "updated_at": now}},
            )

    saved_doc = await db["interview_answers"].find_one(filter_query)
    return InterviewAnswerModel(**saved_doc)  # type: ignore[arg-type]


async def get_answers_for_session(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> List[InterviewAnswerModel]:
    """Retrieve all answers (and drafts) for an interview session."""
    session = await get_interview_session(db, session_id, user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    cursor = db["interview_answers"].find({"session_id": session_id}).sort("created_at", 1)
    docs = await cursor.to_list(length=100)
    return [InterviewAnswerModel(**doc) for doc in docs]

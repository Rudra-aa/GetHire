"""
app/services/interview_session_service.py
-----------------------------------------
Interview Session Lifecycle Service.
Orchestrates creation from plan, state machine transitions, and history retrieval.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional, Tuple

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.models.interview import InterviewSessionModel
from app.models.resume import ResumeModel
from app.schemas.interview import StartInterviewSessionRequest, UpdateSessionStateRequest
from app.services.interview_planner import create_interview_plan
from app.services.question_generator import generate_questions_from_plan
from app.services.resume_service import get_latest_resume_for_user, get_resume_by_id

logger = get_logger(__name__)


async def create_interview_session(
    db: AsyncIOMotorDatabase,
    user_id: str,
    payload: StartInterviewSessionRequest,
) -> InterviewSessionModel:
    """
    Initialize a new personalized interview session using the Interview Planner pattern.
    """
    # 1. Resolve Resume
    resume: Optional[ResumeModel] = None
    if payload.resume_id:
        resume = await get_resume_by_id(db, payload.resume_id, user_id)
    if not resume:
        resume = await get_latest_resume_for_user(db, user_id)

    # 2. Resolve Role & Experience
    target_role = payload.target_role or (resume and resume.parsed_data and resume.parsed_data.personal_info and "Fullstack Developer") or "Software Engineer"
    experience_level = payload.experience_level or "mid"

    # 3. Create Interview Blueprint
    plan = create_interview_plan(
        resume=resume,
        target_role=target_role,
        experience_level=experience_level,
        interview_type=payload.interview_type,
        total_questions=payload.total_questions,
    )

    # 4. Generate Questions from Blueprint
    questions = generate_questions_from_plan(plan, resume)

    # 5. Persist Session Document
    now = datetime.now(timezone.utc)
    session = InterviewSessionModel(
        user_id=user_id,
        resume_id=str(resume.id) if resume and resume.id else None,
        target_role=target_role,
        experience_level=experience_level,
        interview_type=payload.interview_type,
        status="running",
        total_questions=len(questions),
        current_question_index=0,
        overall_progress=0.0,
        elapsed_seconds=0,
        questions=questions,
        started_at=now,
        created_at=now,
        updated_at=now,
    )

    res = await db["interview_sessions"].insert_one(session.model_dump(by_alias=True, exclude_none=True))
    session.id = str(res.inserted_id)

    logger.info(
        "Created interview session",
        session_id=session.id,
        user_id=user_id,
        question_count=len(questions),
        role=target_role,
    )
    return session


async def get_interview_session(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> Optional[InterviewSessionModel]:
    """Retrieve an interview session ensuring user ownership."""
    if not ObjectId.is_valid(session_id):
        return None
    doc = await db["interview_sessions"].find_one({"_id": ObjectId(session_id), "user_id": user_id})
    return InterviewSessionModel(**doc) if doc else None


async def update_session_state(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
    payload: UpdateSessionStateRequest,
) -> InterviewSessionModel:
    """
    Update session progression, active question index, timer, and state.
    """
    session = await get_interview_session(db, session_id, user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    updates: dict = {"updated_at": datetime.now(timezone.utc)}

    if payload.status:
        valid_statuses = {"draft", "running", "paused", "completed", "cancelled", "expired"}
        if payload.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": f"Invalid status '{payload.status}'.", "errors": [{"code": "INVALID_STATUS"}]},
            )
        updates["status"] = payload.status
        if payload.status == "paused":
            updates["paused_at"] = datetime.now(timezone.utc)
        elif payload.status == "running":
            updates["paused_at"] = None

    if payload.current_question_index is not None:
        idx = max(0, min(session.total_questions - 1, payload.current_question_index))
        updates["current_question_index"] = idx
        updates["overall_progress"] = round((idx / max(1, session.total_questions)) * 100.0, 1)

    if payload.elapsed_seconds is not None:
        updates["elapsed_seconds"] = payload.elapsed_seconds

    await db["interview_sessions"].update_one(
        {"_id": ObjectId(session_id)},
        {"$set": updates},
    )

    updated_doc = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
    return InterviewSessionModel(**updated_doc)  # type: ignore[arg-type]


async def complete_interview_session(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> InterviewSessionModel:
    """
    Finalize an interview session and mark as completed.
    """
    session = await get_interview_session(db, session_id, user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    now = datetime.now(timezone.utc)
    updates = {
        "status": "completed",
        "overall_progress": 100.0,
        "completed_at": now,
        "updated_at": now,
    }

    await db["interview_sessions"].update_one(
        {"_id": ObjectId(session_id)},
        {"$set": updates},
    )

    # 1. Publish Event to Event Bus
    from app.core.event_bus import event_bus
    from app.domains.candidate_graph.graph_service import candidate_graph_service
    await event_bus.publish("InterviewCompleted", {"session_id": session_id, "user_id": user_id})

    # 2. Append node to Candidate Intelligence Graph
    await candidate_graph_service.update_graph_nodes(
        db=db,
        user_id=user_id,
        new_nodes=[
            {
                "id": f"int_{session_id}",
                "label": f"Interview Session ({session.target_role})",
                "node_type": "interview",
                "properties": {"session_id": session_id, "target_role": session.target_role},
            }
        ],
        new_edges=[
            {
                "source_id": f"u_{user_id}",
                "target_id": f"int_{session_id}",
                "relation": "completed_interview",
                "weight": 1.0,
            }
        ],
    )

    updated_doc = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
    logger.info("Completed interview session & updated Candidate Graph", session_id=session_id, user_id=user_id)
    return InterviewSessionModel(**updated_doc)  # type: ignore[arg-type]


async def get_user_interview_history(
    db: AsyncIOMotorDatabase,
    user_id: str,
    limit: int = 20,
    skip: int = 0,
) -> Tuple[List[InterviewSessionModel], int]:
    """Retrieve paginated interview history for candidate."""
    cursor = (
        db["interview_sessions"]
        .find({"user_id": user_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    docs = await cursor.to_list(length=limit)
    total = await db["interview_sessions"].count_documents({"user_id": user_id})

    sessions = [InterviewSessionModel(**doc) for doc in docs]
    return sessions, total

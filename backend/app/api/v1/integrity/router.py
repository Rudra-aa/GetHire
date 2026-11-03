"""
app/api/v1/integrity/router.py
-------------------------------
REST API router for Interview Intelligence & Integrity Engine.
JWT-protected endpoints for real-time telemetry processing, event logging,
integrity score calculation, and evaluation reporting.
"""

from __future__ import annotations

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
from app.schemas.integrity import (
    FinishIntegritySessionRequest,
    IntegrityTelemetryRequest,
    LogIntegrityEventRequest,
    StartIntegritySessionRequest,
)
from app.services.interview_intelligence.interview_intelligence_service import (
    interview_intelligence_service,
)

integrity_router = APIRouter()


def _extract_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("_id") or user.get("id"))
    if hasattr(user, "id"):
        return str(user.id)
    return str(user)


@integrity_router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_integrity_session(
    payload: StartIntegritySessionRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Starts an Interview Intelligence session."""
    user_id = _extract_user_id(current_user)
    return await interview_intelligence_service.start_session(db, user_id=user_id, session_id=payload.session_id)


@integrity_router.post("/event")
async def log_integrity_event(
    payload: LogIntegrityEventRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Logs an objective integrity event (tab switch, fullscreen exit, copy attempt, etc.)."""
    user_id = _extract_user_id(current_user)
    return await interview_intelligence_service.log_event(db, user_id=user_id, payload=payload.model_dump())


@integrity_router.post("/telemetry")
async def process_telemetry_batch(
    payload: IntegrityTelemetryRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Processes 1-second real-time telemetry (mic level, camera state, FPS, latency, face count)."""
    user_id = _extract_user_id(current_user)
    return await interview_intelligence_service.process_telemetry(db, user_id=user_id, payload=payload.model_dump())


@integrity_router.post("/finish")
async def finish_integrity_session(
    payload: FinishIntegritySessionRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Finalizes session and returns complete integrity report."""
    user_id = _extract_user_id(current_user)
    is_admin = getattr(current_user, "role", None) == "admin"
    return await interview_intelligence_service.finish_session(
        db, session_id=payload.session_id, user_id=user_id, is_admin=is_admin
    )


@integrity_router.get("/session/{session_id}")
async def get_integrity_session(
    session_id: str = Path(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Session ID"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves current integrity session summary."""
    user_id = _extract_user_id(current_user)
    is_admin = getattr(current_user, "role", None) == "admin"

    query = {"session_id": session_id}
    if not is_admin:
        query["user_id"] = user_id

    doc = await db["interview_intelligence_sessions"].find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Interview Intelligence session not found")
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@integrity_router.get("/session/{session_id}/report")
async def get_integrity_report(
    session_id: str = Path(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Session ID"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves full integrity report & event log for Evaluation Page integration."""
    user_id = _extract_user_id(current_user)
    is_admin = getattr(current_user, "role", None) == "admin"
    return await interview_intelligence_service.finish_session(
        db, session_id=session_id, user_id=user_id, is_admin=is_admin
    )

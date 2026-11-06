"""
app/api/v1/facesense/router.py
-------------------------------
REST API router for FaceSense Intelligence Engine.
JWT-protected endpoints for session control, 1-second batched metric processing,
timeline queries, and session analytics.
"""

from __future__ import annotations

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
from app.schemas.facesense import (
    FaceSenseMetricsBatchRequest,
    FinishFaceSenseRequest,
    StartFaceSenseRequest,
    ToggleVisualAnalysisRequest,
    VisualPresentationSummaryOut,
)
from app.services.facesense.facesense_service import facesense_service

facesense_router = APIRouter()


def _extract_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("_id") or user.get("id"))
    if hasattr(user, "id"):
        return str(user.id)
    return str(user)


@facesense_router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_facesense_session(
    payload: StartFaceSenseRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Starts a new FaceSense monitoring session for an interview."""
    user_id = _extract_user_id(current_user)
    return await facesense_service.start_session(
        db,
        user_id=user_id,
        session_id=payload.session_id,
        visual_analysis_enabled=payload.visual_analysis_enabled,
    )


@facesense_router.post("/toggle")
async def toggle_visual_analysis(
    payload: ToggleVisualAnalysisRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Allows candidate to toggle visual presentation analysis on or off mid-interview."""
    user_id = _extract_user_id(current_user)
    return await facesense_service.toggle_visual_analysis(
        db,
        session_id=payload.session_id,
        user_id=user_id,
        enabled=payload.enabled,
    )


@facesense_router.post("/metrics")
async def process_metrics_batch(
    payload: FaceSenseMetricsBatchRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Processes 1-second batched metrics/landmarks from the client webcam feed."""
    user_id = _extract_user_id(current_user)
    return await facesense_service.process_metrics_batch(db, user_id=user_id, payload=payload.model_dump())


@facesense_router.post("/finish")
async def finish_facesense_session(
    payload: FinishFaceSenseRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Finalizes session and computes overall timeline analytics."""
    user_id = _extract_user_id(current_user)
    is_admin = getattr(current_user, "role", None) == "admin"
    return await facesense_service.finish_session(db, session_id=payload.session_id, user_id=user_id, is_admin=is_admin)


@facesense_router.get("/session/{session_id}")
async def get_session_summary(
    session_id: str = Path(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="FaceSense Session ID"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves full FaceSense session summary and question analytics."""
    user_id = _extract_user_id(current_user)
    is_admin = getattr(current_user, "role", None) == "admin"
    doc = await facesense_service.get_session_summary(db, session_id=session_id, user_id=user_id, is_admin=is_admin)
    if not doc:
        raise HTTPException(status_code=404, detail="FaceSense session not found")
    return doc


@facesense_router.get("/session/{session_id}/timeline")
async def get_session_timeline(
    session_id: str = Path(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="FaceSense Session ID"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves timeline series and behavioral events for a FaceSense session."""
    user_id = _extract_user_id(current_user)
    is_admin = getattr(current_user, "role", None) == "admin"
    doc = await facesense_service.get_session_summary(db, session_id=session_id, user_id=user_id, is_admin=is_admin)
    if not doc:
        raise HTTPException(status_code=404, detail="FaceSense session not found")

    events_query = {"session_id": session_id}
    if not is_admin:
        events_query["user_id"] = user_id

    events_cursor = db["facesense_events"].find(events_query).sort("timestamp_sec", 1)
    events_docs = await events_cursor.to_list(length=200)
    for ev in events_docs:
        ev["id"] = str(ev["_id"])
        ev.pop("_id", None)

    return {
        "session_id": session_id,
        "timeline": doc.get("timeline", {}),
        "events": events_docs,
    }

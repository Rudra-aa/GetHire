"""
app/api/v1/facesense/router.py
-------------------------------
REST API router for FaceSense Intelligence Engine.
JWT-protected endpoints for session control, 1-second batched metric processing,
timeline queries, and session analytics.
"""

from __future__ import annotations

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
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
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Starts a new FaceSense monitoring session for an interview."""
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    user_id = _extract_user_id(current_user)
    return await facesense_service.start_session(db, user_id=user_id, session_id=session_id)


@facesense_router.post("/metrics")
async def process_metrics_batch(
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Processes 1-second batched metrics/landmarks from the client webcam feed."""
    user_id = _extract_user_id(current_user)
    return await facesense_service.process_metrics_batch(db, user_id=user_id, payload=payload)


@facesense_router.post("/finish")
async def finish_facesense_session(
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Finalizes session and computes overall timeline analytics."""
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    return await facesense_service.finish_session(db, session_id=session_id)


@facesense_router.get("/session/{session_id}")
async def get_session_summary(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves full FaceSense session summary and question analytics."""
    doc = await facesense_service.get_session_summary(db, session_id=session_id)
    if not doc:
        raise HTTPException(status_code=404, detail="FaceSense session not found")
    return doc


@facesense_router.get("/session/{session_id}/timeline")
async def get_session_timeline(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves timeline series and behavioral events for a FaceSense session."""
    doc = await facesense_service.get_session_summary(db, session_id=session_id)
    if not doc:
        raise HTTPException(status_code=404, detail="FaceSense session not found")

    events_cursor = db["facesense_events"].find({"session_id": session_id}).sort("timestamp_sec", 1)
    events_docs = await events_cursor.to_list(length=200)
    for ev in events_docs:
        ev["id"] = str(ev["_id"])
        ev.pop("_id", None)

    return {
        "session_id": session_id,
        "timeline": doc.get("timeline", {}),
        "events": events_docs,
    }

"""
app/api/v1/assessment/router.py
--------------------------------
REST API router for Module 2 Assessment Engine.
Endpoints for starting adaptive technical quizzes, submitting answers, and fetching Knowledge Graphs.
"""

from __future__ import annotations

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
from app.services.assessment_engine.assessment_service import assessment_service

assessment_router = APIRouter()


def _extract_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("_id") or user.get("id"))
    if hasattr(user, "id"):
        return str(user.id)
    return str(user)


@assessment_router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_assessment(
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Initializes a new technical assessment test session."""
    user_id = _extract_user_id(current_user)
    target_role = payload.get("target_role", getattr(current_user, "target_role", "Software Engineer"))
    exp_level = payload.get("experience_level", getattr(current_user, "experience_level", "Mid Level"))
    return await assessment_service.create_assessment_session(db, user_id=user_id, target_role=target_role, experience_level=exp_level)


@assessment_router.post("/submit")
async def submit_assessment(
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Evaluates candidate assessment submission and returns Knowledge Graph."""
    user_id = _extract_user_id(current_user)
    assessment_id = payload.get("assessment_id")
    answers = payload.get("answers", [])

    if not assessment_id:
        raise HTTPException(status_code=400, detail="assessment_id is required")

    return await assessment_service.submit_assessment(db, user_id=user_id, assessment_id=assessment_id, candidate_answers=answers)


@assessment_router.get("/latest")
async def get_latest_assessment(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves candidate's latest technical assessment and Knowledge Graph."""
    user_id = _extract_user_id(current_user)
    doc = await assessment_service.get_latest_assessment(db, user_id=user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="No assessment session found")
    return doc

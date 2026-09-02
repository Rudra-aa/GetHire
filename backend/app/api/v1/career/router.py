"""
app/api/v1/career/router.py
----------------------------
REST API router for Module 6 Career Intelligence, Candidate Evolution, and Recruiter Portfolios.
"""

from __future__ import annotations

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
from app.services.career_intelligence.candidate_evolution import candidate_evolution_service
from app.services.career_intelligence.recruiter_portfolio_service import recruiter_portfolio_service

career_router = APIRouter()


def _extract_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("_id") or user.get("id"))
    if hasattr(user, "id"):
        return str(user.id)
    return str(user)


@career_router.get("/evolution")
async def get_candidate_evolution(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves candidate's historical monthly progress curve and evolution timeline."""
    user_id = _extract_user_id(current_user)
    return await candidate_evolution_service.get_candidate_evolution_timeline(db, user_id=user_id)


@career_router.post("/share-link")
async def create_recruiter_share_link(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generates a shareable portfolio link for recruiters."""
    user_id = _extract_user_id(current_user)
    return await recruiter_portfolio_service.generate_share_link(db, user_id=user_id)


@career_router.get("/portfolio/{share_token}")
async def get_recruiter_portfolio(
    share_token: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Dict[str, Any]:
    """Public recruiter endpoint: fetches candidate portfolio by share token."""
    res = await recruiter_portfolio_service.get_portfolio_by_token(db, share_token=share_token)
    if not res:
        raise HTTPException(status_code=404, detail="Invalid or expired share token")
    return res

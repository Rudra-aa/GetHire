"""
app/api/v1/career/router.py
----------------------------
REST API router for Module 6 Career Intelligence, Candidate Evolution, and Recruiter Portfolios.
"""

from __future__ import annotations

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user, get_optional_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
from app.schemas.career import (
    ShareSettingsResponse,
    UpdateShareSettingsRequest,
    PublicPortfolioResponse,
)
from app.schemas.base import APIResponse
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


@career_router.get("/share-settings", response_model=ShareSettingsResponse)
async def get_share_settings(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> ShareSettingsResponse:
    """Retrieves candidate's active recruiter portfolio share settings and analytics."""
    user_id = _extract_user_id(current_user)
    settings_dict = await recruiter_portfolio_service.get_candidate_share_settings(db, user_id=user_id)
    return ShareSettingsResponse(**settings_dict)


@career_router.patch("/share-settings", response_model=ShareSettingsResponse)
async def update_share_settings(
    body: UpdateShareSettingsRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> ShareSettingsResponse:
    """Updates candidate's recruiter portfolio share visibility and module preferences."""
    user_id = _extract_user_id(current_user)
    updated = await recruiter_portfolio_service.update_candidate_share_settings(
        db,
        user_id=user_id,
        is_public=body.is_public,
        include_assessment=body.include_assessment,
        include_interview=body.include_interview,
    )
    return ShareSettingsResponse(**updated)


@career_router.post("/share-link")
async def create_recruiter_share_link(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generates a shareable portfolio link for recruiters."""
    user_id = _extract_user_id(current_user)
    return await recruiter_portfolio_service.generate_share_link(db, user_id=user_id)


@career_router.get("/portfolio/{share_token}", response_model=PublicPortfolioResponse)
async def get_recruiter_portfolio(
    share_token: str = Path(..., min_length=8, max_length=128, pattern=r"^[0-9a-zA-Z_\-]+$", description="Recruiter share token"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    viewer: Optional[UserModel] = Depends(get_optional_current_user),
) -> PublicPortfolioResponse:
    """Public recruiter endpoint: fetches candidate portfolio by share token."""
    viewer_id = _extract_user_id(viewer) if viewer else None
    res = await recruiter_portfolio_service.get_portfolio_by_token(db, share_token=share_token, viewer_user_id=viewer_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio is private, invalid, or expired",
        )
    return PublicPortfolioResponse(**res)

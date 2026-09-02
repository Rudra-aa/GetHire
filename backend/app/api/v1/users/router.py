"""
app/api/v1/users/router.py
--------------------------
User profile management endpoints:
  - GET   /users/me
  - PATCH /users/me
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.user import UserMeResponseData, UserProfileUpdateRequest
from app.services.auth_service import _to_user_summary
from app.services.user_service import update_user_profile

users_router = APIRouter()


# ── GET /users/me ───────────────────────────────────────────────────────────

@users_router.get(
    "/me",
    response_model=APIResponse,
    summary="Retrieve current authenticated user profile",
)
async def get_me(current_user: UserModel = Depends(get_current_active_user)) -> APIResponse:
    user_summary = _to_user_summary(current_user)
    data = UserMeResponseData(
        user=user_summary,
        created_at=current_user.created_at.isoformat(),
        updated_at=current_user.updated_at.isoformat(),
    )
    return APIResponse(
        success=True,
        message="Profile retrieved successfully.",
        data=data.model_dump(),
    )


# ── PATCH /users/me ──────────────────────────────────────────────────────────

@users_router.patch(
    "/me",
    response_model=APIResponse,
    summary="Update current authenticated user profile",
)
async def update_me(
    payload: UserProfileUpdateRequest,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    updated_summary = await update_user_profile(db, str(current_user.id), payload)
    return APIResponse(
        success=True,
        message="Profile updated successfully.",
        data={"user": updated_summary.model_dump()},
    )

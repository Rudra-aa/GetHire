"""
app/api/v1/users/router.py
--------------------------
User profile management endpoints:
  - GET   /users/me
  - PATCH /users/me
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.user import UserMeResponseData, UserProfileUpdateRequest
from app.services.auth_service import _to_user_summary
from app.services.user_service import update_user_profile

users_router = APIRouter()

PROTECTED_ACCOUNT_FIELDS = {"role", "permissions", "isAdmin", "is_admin"}


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
    request: Request,
    payload: UserProfileUpdateRequest,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    # 1. Parse raw request body and payload to detect any attempt to alter protected fields
    try:
        raw_body = await request.json()
    except Exception:
        raw_body = {}

    attempted_fields = set()
    if isinstance(raw_body, dict):
        for field in PROTECTED_ACCOUNT_FIELDS:
            if field in raw_body:
                attempted_fields.add(field)

    for field in PROTECTED_ACCOUNT_FIELDS:
        if getattr(payload, field, None) is not None:
            attempted_fields.add(field)

    # Normal users must never be allowed to change protected role/permission/admin fields
    if attempted_fields and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": f"Modifying protected account fields ({', '.join(sorted(attempted_fields))}) is forbidden.",
                "errors": [{"code": "FORBIDDEN_FIELD_MODIFICATION", "field": f} for f in sorted(attempted_fields)],
            },
        )

    db = mongo_manager.get_database()
    updated_summary = await update_user_profile(db, str(current_user.id), payload)
    return APIResponse(
        success=True,
        message="Profile updated successfully.",
        data={"user": updated_summary.model_dump()},
    )


# ── POST /users/me/reset-progress ───────────────────────────────────────────

@users_router.post(
    "/me/reset-progress",
    response_model=APIResponse,
    summary="Safely reset active progress to start fresh from Step 1",
)
async def reset_candidate_progress(
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    """
    Safely resets the candidate's active progress to allow starting fresh from beginning:
    - Cancels active/running interview sessions and active session pointers.
    - Cancels active and archives completed assessment sessions to enable a fresh assessment attempt.
    - Preserves user account credentials, profile data, resume documents,
      and immutable completed evaluation reports (#1, #2...) and candidate evolution history.
    """
    from datetime import datetime, timezone
    from bson import ObjectId

    db = mongo_manager.get_database()
    user_id = str(current_user.id)
    user_filter = {"$in": [user_id, ObjectId(user_id)]} if ObjectId.is_valid(user_id) else user_id
    now = datetime.now(timezone.utc)

    # 1. Cancel in-progress or paused interview sessions
    interview_res = await db["interview_sessions"].update_many(
        {"user_id": user_id, "status": {"$in": ["running", "paused"]}},
        {"$set": {"status": "cancelled", "updated_at": now}},
    )

    # 2. Cancel in-progress assessments
    active_assessment_res = await db["assessment_sessions"].update_many(
        {"user_id": user_filter, "status": "active"},
        {"$set": {"status": "cancelled", "updated_at": now}},
    )

    # 3. Archive completed assessments so candidate can take a fresh assessment from beginning
    archived_assessment_res = await db["assessment_sessions"].update_many(
        {"user_id": user_filter, "status": "completed"},
        {"$set": {"status": "archived", "archived_at": now, "updated_at": now}},
    )

    return APIResponse(
        success=True,
        message="Active progress reset successfully. You can now begin a fresh assessment and interview.",
        data={
            "reset": True,
            "cancelled_interviews": interview_res.modified_count,
            "cancelled_assessments": active_assessment_res.modified_count,
            "archived_assessments": archived_assessment_res.modified_count,
            "timestamp": now.isoformat(),
        },
    )


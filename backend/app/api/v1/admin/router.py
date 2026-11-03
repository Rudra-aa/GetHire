"""
app/api/v1/admin/router.py
--------------------------
REST API endpoints for Platform Administration and RBAC Management.
All endpoints require authenticated user with role == 'admin'.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Path, Query, status

from app.db.mongo import mongo_manager
from app.dependencies.auth import require_admin
from app.models.user import UserModel
from app.schemas.admin import (
    AdminAnalyticsOverviewData,
    AdminUpdateRoleRequest,
    AdminUserListResponseData,
)
from app.schemas.base import APIResponse
from app.services.admin_service import (
    admin_get_platform_analytics,
    admin_get_user_by_id,
    admin_list_users,
    admin_soft_delete_user,
    admin_update_user_role,
)
from app.services.auth_service import _to_user_summary

admin_router = APIRouter()


# ── 1. GET /admin/users ─────────────────────────────────────────────────────

@admin_router.get(
    "/users",
    response_model=APIResponse,
    summary="List all users with pagination (Admin only)",
    description="Retrieve a paginated list of registered users. Requires administrator role.",
)
async def list_users(
    page: int = Query(1, ge=1, le=10000, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    role: Optional[str] = Query(None, pattern=r"^(candidate|admin)$", description="Filter by role: candidate | admin"),
    search: Optional[str] = Query(None, min_length=1, max_length=100, description="Search by email or name"),
    current_admin: UserModel = Depends(require_admin),
) -> APIResponse:
    db = mongo_manager.get_database()
    users, total = await admin_list_users(
        db, page=page, per_page=per_page, role=role, search=search
    )
    total_pages = (total + per_page - 1) // per_page if total > 0 else 1

    data = AdminUserListResponseData(
        users=users,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )
    return APIResponse(
        success=True,
        message="Users retrieved successfully.",
        data=data.model_dump(),
    )


# ── 2. GET /admin/users/{user_id} ───────────────────────────────────────────

@admin_router.get(
    "/users/{user_id}",
    response_model=APIResponse,
    summary="Retrieve full user profile (Admin only)",
    description="Inspect full user account and metadata for administrative review.",
)
async def get_user_detail(
    user_id: str = Path(..., pattern=r"^[0-9a-fA-F]{24}$", description="User ObjectId"),
    current_admin: UserModel = Depends(require_admin),
) -> APIResponse:
    db = mongo_manager.get_database()
    user = await admin_get_user_by_id(db, user_id)
    summary = _to_user_summary(user)
    return APIResponse(
        success=True,
        message="User profile retrieved successfully.",
        data={
            "user": summary.model_dump(),
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat(),
            "is_deleted": user.is_deleted,
        },
    )


# ── 3. PATCH /admin/users/{user_id}/role ────────────────────────────────────

@admin_router.patch(
    "/users/{user_id}/role",
    response_model=APIResponse,
    summary="Update user role (Admin only)",
    description="Promote or demote a user role. Only accessible to administrators.",
)
async def update_user_role_endpoint(
    user_id: str = Path(..., pattern=r"^[0-9a-fA-F]{24}$", description="User ObjectId"),
    payload: AdminUpdateRoleRequest = ...,
    current_admin: UserModel = Depends(require_admin),
) -> APIResponse:
    db = mongo_manager.get_database()
    updated_user = await admin_update_user_role(db, user_id, payload.role)
    summary = _to_user_summary(updated_user)
    return APIResponse(
        success=True,
        message="User role updated successfully.",
        data={"user": summary.model_dump(), "role": updated_user.role},
    )


# ── 4. DELETE /admin/users/{user_id} ────────────────────────────────────────

@admin_router.delete(
    "/users/{user_id}",
    response_model=APIResponse,
    summary="Soft-delete user account (Admin only)",
    description="Soft-deletes and deactivates a user account.",
)
async def delete_user_endpoint(
    user_id: str = Path(..., pattern=r"^[0-9a-fA-F]{24}$", description="User ObjectId"),
    current_admin: UserModel = Depends(require_admin),
) -> APIResponse:
    db = mongo_manager.get_database()
    await admin_soft_delete_user(db, user_id)
    return APIResponse(
        success=True,
        message="User account deactivated successfully.",
        data={"user_id": user_id, "is_deleted": True},
    )


# ── 5. GET /admin/analytics/overview ────────────────────────────────────────

@admin_router.get(
    "/analytics/overview",
    response_model=APIResponse,
    summary="Platform usage metrics overview (Admin only)",
    description="Platform-wide operational analytics and user distributions.",
)
async def get_analytics_overview(
    current_admin: UserModel = Depends(require_admin),
) -> APIResponse:
    db = mongo_manager.get_database()
    analytics = await admin_get_platform_analytics(db)
    return APIResponse(
        success=True,
        message="Platform analytics retrieved successfully.",
        data=analytics.model_dump(),
    )

"""
app/services/admin_service.py
-----------------------------
Service layer for administrator-only operations and user management.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional, Tuple, List
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UserModel
from app.schemas.admin import AdminUserListItem, AdminAnalyticsOverviewData


async def admin_list_users(
    db: AsyncIOMotorDatabase,
    page: int = 1,
    per_page: int = 20,
    role: Optional[str] = None,
    search: Optional[str] = None,
) -> Tuple[List[AdminUserListItem], int]:
    """List all registered users with pagination and optional filtering."""
    query: dict = {}
    if role:
        query["role"] = role
    if search and search.strip():
        safe_search = re.escape(search.strip())
        query["$or"] = [
            {"email": {"$regex": safe_search, "$options": "i"}},
            {"full_name": {"$regex": safe_search, "$options": "i"}},
        ]

    total = await db["users"].count_documents(query)
    skip = (page - 1) * per_page
    cursor = db["users"].find(query).sort("created_at", -1).skip(skip).limit(per_page)

    users: List[AdminUserListItem] = []
    async for doc in cursor:
        users.append(
            AdminUserListItem(
                id=str(doc["_id"]),
                email=doc.get("email", ""),
                full_name=doc.get("full_name", ""),
                role=doc.get("role", "candidate"),
                status=doc.get("status", "active"),
                is_verified=doc.get("is_verified", False),
                is_deleted=doc.get("is_deleted", False),
                created_at=doc.get("created_at", datetime.now(timezone.utc)).isoformat()
                if isinstance(doc.get("created_at"), datetime)
                else str(doc.get("created_at", "")),
                updated_at=doc.get("updated_at", datetime.now(timezone.utc)).isoformat()
                if isinstance(doc.get("updated_at"), datetime)
                else str(doc.get("updated_at", "")),
            )
        )

    return users, total


async def admin_get_user_by_id(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> UserModel:
    """Retrieve full user profile by user_id for administrator review."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    return UserModel(**user_doc)


async def admin_update_user_role(
    db: AsyncIOMotorDatabase,
    user_id: str,
    new_role: str,
) -> UserModel:
    """Update user's system role (candidate | admin). Only accessible to administrators."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    now = datetime.now(timezone.utc)
    result = await db["users"].find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": new_role, "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    return UserModel(**result)


async def admin_soft_delete_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> bool:
    """Soft-delete user account (GDPR/erasure or deactivation). Only accessible to administrators."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    now = datetime.now(timezone.utc)
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_deleted": True, "deleted_at": now, "updated_at": now, "status": "suspended"}},
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    return True


async def admin_get_platform_analytics(
    db: AsyncIOMotorDatabase,
) -> AdminAnalyticsOverviewData:
    """Aggregate platform-wide operational statistics."""
    total_users = await db["users"].count_documents({"is_deleted": False})
    total_candidates = await db["users"].count_documents({"role": "candidate", "is_deleted": False})
    total_admins = await db["users"].count_documents({"role": "admin", "is_deleted": False})
    active_users = await db["users"].count_documents({"status": "active", "is_deleted": False})
    total_sessions = await db["interview_sessions"].count_documents({})

    return AdminAnalyticsOverviewData(
        total_users=total_users,
        total_candidates=total_candidates,
        total_admins=total_admins,
        total_sessions=total_sessions,
        active_users=active_users,
    )

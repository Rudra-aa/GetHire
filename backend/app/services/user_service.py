"""
app/services/user_service.py
----------------------------
User entity and profile management service.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UserModel
from app.schemas.user import UserProfileUpdateRequest, UserSummary
from app.services.auth_service import _to_user_summary


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[UserModel]:
    """Retrieve active user document by ID."""
    if not ObjectId.is_valid(user_id):
        return None
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id), "is_deleted": False})
    return UserModel(**user_doc) if user_doc else None


async def update_user_profile(
    db: AsyncIOMotorDatabase,
    user_id: str,
    payload: UserProfileUpdateRequest,
) -> UserSummary:
    """Update profile fields on the unified UserModel."""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )

    update_fields = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not update_fields:
        user = await get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return _to_user_summary(user)

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await db["users"].find_one_and_update(
        {"_id": ObjectId(user_id), "is_deleted": False},
        {"$set": update_fields},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )

    updated_user = UserModel(**result)
    return _to_user_summary(updated_user)

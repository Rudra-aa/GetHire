"""
app/schemas/admin.py
--------------------
Pydantic schemas for Platform Administration and RBAC Management endpoints.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class AdminUserListItem(BaseModel):
    """Safe user summary for admin list view."""
    id: str
    email: EmailStr
    full_name: str
    role: str
    status: str
    is_verified: bool
    is_deleted: bool
    created_at: str
    updated_at: str


class AdminUserListResponseData(BaseModel):
    """Paginated user listing for administrators."""
    users: List[AdminUserListItem]
    total: int
    page: int
    per_page: int
    total_pages: int


class AdminUpdateRoleRequest(BaseModel):
    """Payload for updating a user's system role by administrator."""
    role: str = Field(description="Role: candidate | admin")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"candidate", "admin"}
        if v.lower() not in allowed:
            raise ValueError(f"Role must be one of: {', '.join(allowed)}")
        return v.lower()


class AdminAnalyticsOverviewData(BaseModel):
    """Platform-wide analytics and usage metrics overview."""
    total_users: int
    total_candidates: int
    total_admins: int
    total_sessions: int
    active_users: int

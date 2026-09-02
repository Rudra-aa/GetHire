"""
app/schemas/user.py
-------------------
Pydantic schemas for User entity summaries and profile operations.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserSummary(BaseModel):
    """
    Public safe summary of a user account.
    Never exposes passwords, hashes, or internal token secrets.
    """
    id: str
    email: EmailStr
    full_name: str
    is_verified: bool
    profile_photo: Optional[str] = None
    resume_uploaded: bool = False
    onboarding_completed: bool = False
    role: str = "candidate"
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    linkedin_url: Optional[str] = None


class UserProfileUpdateRequest(BaseModel):
    """
    Payload for updating user profile fields.
    """
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    profile_photo: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    linkedin_url: Optional[str] = None
    onboarding_completed: Optional[bool] = None

    @field_validator("target_role")
    @classmethod
    def validate_target_role(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        allowed = {
            "Frontend Developer", "Backend Developer", "AI/ML Engineer",
            "Data Scientist", "DevOps Engineer", "Fullstack Developer", "Mobile Developer"
        }
        if v not in allowed:
            raise ValueError(f"Target role must be one of: {', '.join(allowed)}")
        return v

    @field_validator("experience_level")
    @classmethod
    def validate_experience_level(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        allowed = {"entry", "mid", "senior"}
        if v.lower() not in allowed:
            raise ValueError("Experience level must be one of: entry, mid, senior")
        return v.lower()


class UserMeResponseData(BaseModel):
    """
    Response payload for GET /users/me.
    """
    user: UserSummary
    created_at: str
    updated_at: str

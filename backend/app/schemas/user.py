"""
app/schemas/user.py
-------------------
Pydantic schemas for User entity summaries and profile operations.
"""

from __future__ import annotations

from typing import Any, Optional
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


import re

_URL_REGEX = re.compile(
    r"^https?:\/\/"
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}\.?|"
    r"localhost|"
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
    r"(?::\d+)?"
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)


class UserProfileUpdateRequest(BaseModel):
    """
    Payload for updating user profile fields.
    Protected fields (role, permissions, isAdmin, is_admin) are accepted by the schema
    so that security middleware/handlers can detect privilege escalation attempts.
    """
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    profile_photo: Optional[str] = Field(default=None, max_length=2048)
    target_role: Optional[str] = Field(default=None, max_length=100)
    experience_level: Optional[str] = Field(default=None, max_length=20)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    onboarding_completed: Optional[bool] = None

    # Protected account fields
    role: Optional[str] = Field(default=None, max_length=50)
    permissions: Optional[Any] = None
    isAdmin: Optional[bool] = None
    is_admin: Optional[bool] = None

    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            val = v.strip()
            if not _URL_REGEX.match(val) or any(val.lower().startswith(b) for b in ("javascript:", "data:", "vbscript:")):
                raise ValueError("Invalid URL format. LinkedIn URL must start with http:// or https://")
            return val
        return None

    @field_validator("profile_photo")
    @classmethod
    def validate_profile_photo(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            val = v.strip()
            if any(val.lower().startswith(b) for b in ("javascript:", "vbscript:")):
                raise ValueError("Invalid photo URL scheme.")
            return val
        return None

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

"""
app/schemas/auth.py
-------------------
Pydantic schemas for Authentication endpoints (register, login, refresh, session).
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserSummary


# ── Request Payloads ────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """
    User registration payload with strict password complexity rules.
    """
    email: EmailStr = Field(description="User email address")
    password: str = Field(min_length=8, max_length=72, description="Plaintext password")
    full_name: str = Field(min_length=2, max_length=100, description="Full name")
    target_role: Optional[str] = Field(default="Frontend Developer", description="Target job role")
    experience_level: Optional[str] = Field(default="entry", description="Experience level: entry | mid | senior")
    linkedin_url: Optional[str] = Field(default=None, description="LinkedIn profile URL")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c in "!@#$%^&*()-_=+[]{}|;:',.<>?/~`" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("target_role")
    @classmethod
    def validate_target_role(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return "Frontend Developer"
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
            return "entry"
        allowed = {"entry", "mid", "senior"}
        if v.lower() not in allowed:
            raise ValueError("Experience level must be one of: entry, mid, senior")
        return v.lower()


class LoginRequest(BaseModel):
    """
    Login credentials payload.
    """
    email: EmailStr = Field(description="Account email address")
    password: str = Field(min_length=1, description="Account password")


# ── Response Data Payloads ──────────────────────────────────────────────────

class RegisterResponseData(BaseModel):
    user: UserSummary


class LoginResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary


class SessionResponseData(BaseModel):
    authenticated: bool
    user: Optional[UserSummary] = None


class TokenRefreshResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"

"""
app/schemas/auth.py
-------------------
Pydantic schemas for Authentication endpoints (register, login, refresh, session).
"""

from __future__ import annotations

import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserSummary


_URL_REGEX = re.compile(
    r"^https?:\/\/"
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}\.?|"
    r"localhost|"
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
    r"(?::\d+)?"
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)


# ── Request Payloads ────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """
    User registration payload with strict password complexity rules.
    """
    email: EmailStr = Field(max_length=255, description="User email address")
    password: str = Field(min_length=8, max_length=72, description="Plaintext password")
    full_name: str = Field(min_length=2, max_length=100, description="Full name")
    target_role: Optional[str] = Field(default="Frontend Developer", max_length=100, description="Target job role")
    experience_level: Optional[str] = Field(default="entry", max_length=20, description="Experience level: entry | mid | senior")
    linkedin_url: Optional[str] = Field(default=None, max_length=500, description="LinkedIn profile URL")

    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            val = v.strip()
            if not _URL_REGEX.match(val) or any(val.lower().startswith(b) for b in ("javascript:", "data:", "vbscript:")):
                raise ValueError("Invalid URL format. LinkedIn URL must start with http:// or https://")
            return val
        return None

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
    email: EmailStr = Field(max_length=255, description="Account email address")
    password: str = Field(min_length=1, max_length=256, description="Account password")


class PasswordResetRequest(BaseModel):
    """
    Password reset request payload.
    """
    email: EmailStr = Field(max_length=255, description="Account email address")


class VerifyOtpRequest(BaseModel):
    """
    OTP / email verification payload.
    """
    email: Optional[EmailStr] = Field(default=None, max_length=255, description="Account email address")
    otp: str = Field(min_length=4, max_length=10, pattern=r"^[0-9A-Za-z]+$", description="OTP verification code")


class TokenRefreshRequest(BaseModel):
    """
    Token refresh request payload when passed via JSON body.
    """
    refresh_token: Optional[str] = Field(default=None, min_length=10, max_length=1024, description="Refresh token")


# ── Response Data Payloads ──────────────────────────────────────────────────

class RegisterResponseData(BaseModel):
    user: UserSummary
    refresh_token: Optional[str] = None


class LoginResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary
    refresh_token: Optional[str] = None


class SessionResponseData(BaseModel):
    authenticated: bool
    user: Optional[UserSummary] = None


class TokenRefreshResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None

"""
app/models/user.py
------------------
Canonical MongoDB domain model for User accounts in GetHire.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Any, Optional

from bson import ObjectId
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    EmailStr,
    Field,
    PlainSerializer,
    WithJsonSchema,
    model_validator,
)


# ── MongoDB PyObjectId Helper (Pydantic v2) ────────────────────────────────

def _validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId string: {v}")
        return v
    raise ValueError(f"Invalid ObjectId type: {type(v)}")


PyObjectId = Annotated[
    str,
    BeforeValidator(_validate_object_id),
    PlainSerializer(lambda x: str(x), return_type=str),
    WithJsonSchema({"type": "string", "example": "507f1f77bcf86cd799439011"}),
]


# ── User Domain Model ──────────────────────────────────────────────────────

class UserModel(BaseModel):
    """
    Unified User model representing authentication credentials, verification state,
    and profile information stored in the `users` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    schema_version: int = Field(default=1)

    # Core required fields
    full_name: str = Field(min_length=2, max_length=100, description="Candidate full name")
    email: EmailStr = Field(description="Unique email address")
    password_hash: str = Field(description="Bcrypt hashed password")

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Verification and onboarding state
    is_verified: bool = Field(default=False, description="Email verification status")
    profile_photo: Optional[str] = Field(default=None, description="Avatar image URL")
    resume_uploaded: bool = Field(default=False, description="Has uploaded resume")
    onboarding_completed: bool = Field(default=False, description="Has completed onboarding")

    # Role & Career metadata
    role: str = Field(default="candidate", description="System role: candidate | admin")
    status: str = Field(default="active", description="Account status: active | suspended | pending")
    target_role: Optional[str] = Field(default="Frontend Developer", description="Target job role")
    experience_level: Optional[str] = Field(default="entry", description="Experience level: entry | mid | senior")
    linkedin_url: Optional[str] = Field(default=None, description="LinkedIn profile URL")

    # Soft deletion & token security
    refresh_token_version: int = Field(default=1, description="Increment to revoke all tokens")
    is_deleted: bool = Field(default=False)
    deleted_at: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_fields(cls, data: Any) -> Any:
        """Handle legacy MongoDB documents with older field names."""
        if isinstance(data, dict):
            # Password alias fallback
            if "password_hash" not in data and "hashed_password" in data:
                data["password_hash"] = data["hashed_password"]

            # Full name fallback
            if "full_name" not in data or not data["full_name"]:
                email = data.get("email", "Candidate")
                name_part = email.split("@")[0].replace(".", " ").title() if isinstance(email, str) else "Candidate"
                data["full_name"] = name_part or "Candidate"

            # Verified status fallback
            if "is_verified" not in data and "email_verified" in data:
                data["is_verified"] = data["email_verified"]

            # Profile photo fallback
            if "profile_photo" not in data and "avatar_url" in data:
                data["profile_photo"] = data["avatar_url"]

        return data

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

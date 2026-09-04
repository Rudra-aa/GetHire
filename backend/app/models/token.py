"""
app/models/token.py
-------------------
MongoDB domain models for refresh token rotation, active sessions, and audit trail.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import PyObjectId


# ── Refresh Token Model ────────────────────────────────────────────────────

class AuthRefreshTokenModel(BaseModel):
    """
    Active refresh tokens with family rotation identifier for RTR replay protection.
    Stored in the `auth_refresh_tokens` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    jti: str = Field(description="Unique token identifier")
    user_id: PyObjectId = Field(description="Reference to users._id")
    token_family: str = Field(description="UUID indicating the token generation family")
    expires_at: datetime = Field(description="Timestamp when token expires")
    is_revoked: bool = Field(default=False, description="Revocation flag")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


# ── User Session Model ─────────────────────────────────────────────────────

class UserSessionModel(BaseModel):
    """
    Active device sessions for security tracking and multi-device auditing.
    Stored in the `user_sessions` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId = Field(description="Reference to users._id")
    
    device_name: str = Field(description="Friendly device category (e.g. Desktop, Mobile)")
    browser: str = Field(description="Browser name (e.g. Chrome, Firefox)")
    operating_system: str = Field(description="OS name (e.g. macOS, Windows)")
    ip_address: str = Field(description="Client IP address")
    country: Optional[str] = Field(default=None, description="Inferred country code")
    user_agent: str = Field(description="Full user agent header")
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True, description="Session active state")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


# ── Audit Log Model ────────────────────────────────────────────────────────

class AuditLogModel(BaseModel):
    """
    Immutable application-wide audit log trail for security and IAM events.
    Stored in the `audit_logs` collection.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    schema_version: int = Field(default=1)
    
    event: str = Field(description="Event name: REGISTER | LOGIN | REFRESH | LOGOUT")
    module: str = Field(default="auth", description="Module category")
    severity: str = Field(default="info", description="Severity level: info | warning | error")
    user_id: Optional[str] = Field(default=None, description="User identifier reference")
    
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Safe metadata dictionary")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

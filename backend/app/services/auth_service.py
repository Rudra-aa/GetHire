"""
app/services/auth_service.py
----------------------------
Core authentication service implementing business logic for:
  - User registration & password hashing
  - User login & session creation
  - Refresh Token Rotation (RTR) & replay attack protection
  - Safe user logout & session revocation
  - Structured event-only auditing
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.models.token import AuditLogModel, AuthRefreshTokenModel, UserSessionModel
from app.models.user import UserModel
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserSummary
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

logger = get_logger(__name__)


# ── Audit Log Helper ────────────────────────────────────────────────────────

async def log_auth_event(
    db: AsyncIOMotorDatabase,
    event: str,
    user_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log IAM security events. Never logs passwords or sensitive token secrets.
    """
    try:
        log = AuditLogModel(
            event=event,
            module="auth",
            severity="info",
            user_id=user_id,
            metadata=metadata or {},
            timestamp=datetime.now(timezone.utc),
        )
        await db["audit_logs"].insert_one(log.model_dump(by_alias=True, exclude_none=True))
    except Exception as exc:
        logger.error("Failed to write auth audit log", event=event, error=str(exc))


def _to_user_summary(user: UserModel) -> UserSummary:
    """Convert a UserModel into a safe public UserSummary."""
    return UserSummary(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_verified=user.is_verified,
        profile_photo=user.profile_photo,
        resume_uploaded=user.resume_uploaded,
        onboarding_completed=user.onboarding_completed,
        role=user.role,
        target_role=user.target_role,
        experience_level=user.experience_level,
        linkedin_url=user.linkedin_url,
    )


# ── Service Methods ─────────────────────────────────────────────────────────

async def register_user(
    db: AsyncIOMotorDatabase,
    payload: RegisterRequest,
    session_info: dict,
) -> UserSummary:
    """
    Register a new user account with duplicate prevention and bcrypt password hashing.
    """
    # 1. Check duplicate email
    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "message": "Registration failed.",
                "errors": [{"code": "DUPLICATE_EMAIL", "field": "email", "message": "Email is already registered."}],
            },
        )

    # 2. Create user model with hashed password
    now = datetime.now(timezone.utc)
    hashed = hash_password(payload.password)
    user = UserModel(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hashed,
        is_verified=False,
        profile_photo=None,
        resume_uploaded=False,
        onboarding_completed=False,
        role="candidate",
        status="active",
        target_role=payload.target_role,
        experience_level=payload.experience_level,
        linkedin_url=payload.linkedin_url,
        created_at=now,
        updated_at=now,
    )

    # 3. Save to database
    result = await db["users"].insert_one(user.model_dump(by_alias=True, exclude_none=True))
    user.id = str(result.inserted_id)

    # 4. Log registration event (no passwords)
    await log_auth_event(
        db,
        event="REGISTER",
        user_id=user.id,
        metadata={"ip": session_info.get("ip_address"), "target_role": user.target_role},
    )

    return _to_user_summary(user)


async def authenticate_user(
    db: AsyncIOMotorDatabase,
    payload: LoginRequest,
    session_info: dict,
) -> Tuple[str, str, UserSummary]:
    """
    Authenticate user credentials, generate tokens, create session.
    Returns (access_token, refresh_token, user_summary).
    """
    error_401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "success": False,
            "message": "Invalid email or password.",
            "errors": [{"code": "INVALID_CREDENTIALS"}],
        },
    )

    user_doc = await db["users"].find_one({"email": payload.email, "is_deleted": False})
    if not user_doc:
        await log_auth_event(db, "LOGIN_FAILED", metadata={"email": payload.email, "ip": session_info.get("ip_address")})
        raise error_401

    if "full_name" not in user_doc:
        profile_doc = await db["user_profiles"].find_one({"user_id": str(user_doc["_id"])})
        if profile_doc:
            user_doc["full_name"] = profile_doc.get("full_name")
            if "target_role" in profile_doc:
                user_doc["target_role"] = profile_doc.get("target_role")
            if "experience_level" in profile_doc:
                user_doc["experience_level"] = profile_doc.get("experience_level")
            if "avatar_url" in profile_doc:
                user_doc["profile_photo"] = profile_doc.get("avatar_url")

    user = UserModel(**user_doc)

    if user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "message": "Account has been suspended.", "errors": [{"code": "ACCOUNT_SUSPENDED"}]},
        )

    if not verify_password(payload.password, user.password_hash):
        await log_auth_event(db, "LOGIN_FAILED", user_id=str(user.id), metadata={"ip": session_info.get("ip_address")})
        raise error_401

    user_id_str = str(user.id)

    # Record User Session
    user_session = UserSessionModel(
        user_id=user_id_str,
        device_name=session_info.get("device_name", "Desktop"),
        browser=session_info.get("browser", "Browser"),
        operating_system=session_info.get("operating_system", "OS"),
        ip_address=session_info.get("ip_address", "127.0.0.1"),
        country=session_info.get("country"),
        user_agent=session_info.get("user_agent", ""),
        is_active=True,
    )
    await db["user_sessions"].insert_one(user_session.model_dump(by_alias=True, exclude_none=True))

    # Generate Access & Refresh Tokens
    access_token, _ = create_access_token(user_id=user_id_str, role=user.role)
    refresh_token, r_jti, r_family = create_refresh_token(user_id=user_id_str)

    # Store Refresh Token
    token_doc = AuthRefreshTokenModel(
        jti=r_jti,
        user_id=user_id_str,
        token_family=r_family,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        is_revoked=False,
    )
    await db["auth_refresh_tokens"].insert_one(token_doc.model_dump(by_alias=True, exclude_none=True))

    # Log Login Event
    await log_auth_event(db, "LOGIN", user_id=user_id_str, metadata={"ip": session_info.get("ip_address")})

    return access_token, refresh_token, _to_user_summary(user)


async def rotate_refresh_token(
    db: AsyncIOMotorDatabase,
    refresh_token_jwt: str,
) -> Tuple[str, str, UserSummary]:
    """
    Validate refresh token and issue rotated access & refresh tokens with replay protection.
    """
    try:
        payload = decode_token(refresh_token_jwt)
        user_id = payload.get("sub")
        jti = payload.get("jti")
        family = payload.get("token_family")
        if not user_id or not jti or not family or payload.get("type") != "refresh":
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid or expired session token.", "errors": [{"code": "INVALID_REFRESH_TOKEN"}]},
        )

    user_doc = await db["users"].find_one({"_id": ObjectId(user_id), "is_deleted": False})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "User not found.", "errors": [{"code": "USER_NOT_FOUND"}]},
        )
    user = UserModel(**user_doc)

    token_doc = await db["auth_refresh_tokens"].find_one({"jti": jti})

    # Replay attack detection
    if not token_doc or token_doc.get("is_revoked", False):
        logger.warning("Token replay detected", user_id=user_id, family=family)
        await db["auth_refresh_tokens"].update_many({"token_family": family}, {"$set": {"is_revoked": True}})
        await db["user_sessions"].update_many({"user_id": user_id, "is_active": True}, {"$set": {"is_active": False}})
        await log_auth_event(db, "REVOKE_SESSIONS", user_id=user_id, metadata={"family": family})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Security compromise detected. Please sign in again.", "errors": [{"code": "REPLAY_COMPROMISE"}]},
        )

    # Revoke old token & generate new pair
    await db["auth_refresh_tokens"].update_one({"_id": token_doc["_id"]}, {"$set": {"is_revoked": True}})

    new_access, _ = create_access_token(user_id=user_id, role=user.role)
    new_refresh, new_jti, _ = create_refresh_token(user_id=user_id, token_family=family)

    new_token_doc = AuthRefreshTokenModel(
        jti=new_jti,
        user_id=user_id,
        token_family=family,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        is_revoked=False,
    )
    await db["auth_refresh_tokens"].insert_one(new_token_doc.model_dump(by_alias=True, exclude_none=True))

    await log_auth_event(db, "REFRESH", user_id=user_id)

    return new_access, new_refresh, _to_user_summary(user)


async def logout_user(db: AsyncIOMotorDatabase, refresh_token_jwt: Optional[str]) -> None:
    """Revoke active refresh token family and terminate active session."""
    if not refresh_token_jwt:
        return
    try:
        payload = decode_token(refresh_token_jwt)
        jti = payload.get("jti")
        user_id = payload.get("sub")
        if jti and user_id:
            await db["auth_refresh_tokens"].update_one({"jti": jti}, {"$set": {"is_revoked": True}})
            await db["user_sessions"].update_one(
                {"user_id": user_id, "is_active": True},
                {"$set": {"is_active": False, "last_seen": datetime.now(timezone.utc)}},
            )
            await log_auth_event(db, "LOGOUT", user_id=user_id)
    except Exception as exc:
        logger.warning("Error during logout session cleanup", error=str(exc))

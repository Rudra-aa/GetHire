"""
app/dependencies/auth.py
------------------------
FastAPI dependencies for authentication, authorization, and session tracking.
"""

from __future__ import annotations

from typing import Callable, Optional

from bson import ObjectId
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError

from app.core.logging import get_logger
from app.db.mongo import mongo_manager
from app.models.user import UserModel
from app.utils.security import decode_token

logger = get_logger(__name__)
oauth2_scheme = HTTPBearer(auto_error=False)


# ── Dependency: Get Current User ───────────────────────────────────────────

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme),
) -> UserModel:
    """
    Extract and validate Bearer access token, retrieving UserModel from database.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Authentication required. Bearer token missing.",
                "errors": [{"code": "MISSING_TOKEN", "field": "Authorization"}],
            },
        )

    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id or payload.get("type") != "access":
            raise JWTError("Invalid token subject or type")
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Token has expired. Please refresh your session.",
                "errors": [{"code": "TOKEN_EXPIRED"}],
            },
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Invalid authentication token signature.",
                "errors": [{"code": "INVALID_TOKEN"}],
            },
        )

    db = mongo_manager.get_database()
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id), "is_deleted": False})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "User account associated with this token was not found.",
                "errors": [{"code": "USER_NOT_FOUND"}],
            },
        )

    return UserModel(**user_doc)


# ── Dependency: Get Current Active User ────────────────────────────────────

async def get_current_active_user(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    """Verify that user account is active and not suspended."""
    if current_user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "message": "Account suspended. Contact support.", "errors": [{"code": "ACCOUNT_SUSPENDED"}]},
        )
    return current_user


# ── Dependency Factory: Require Roles ──────────────────────────────────────

def require_roles(*allowed_roles: str) -> Callable[[UserModel], UserModel]:
    """RBAC dependency checking required roles."""
    def dependency(current_user: UserModel = Depends(get_current_active_user)) -> UserModel:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"success": False, "message": "Insufficient permissions.", "errors": [{"code": "FORBIDDEN"}]},
            )
        return current_user
    return dependency


# ── Dependency: Get Session Information ────────────────────────────────────

def get_current_session_info(request: Request) -> dict:
    """Extract browser, OS, and client IP from request headers."""
    user_agent = request.headers.get("User-Agent", "Unknown")
    ip_address = request.client.host if request.client else "127.0.0.1"
    if request.headers.get("X-Forwarded-For"):
        ip_address = request.headers.get("X-Forwarded-For").split(",")[0].strip()

    country = request.headers.get("CF-IPCountry")

    os_name = "macOS" if ("Macintosh" in user_agent or "Mac OS" in user_agent) else (
        "Windows" if "Windows" in user_agent else (
            "Linux" if "Linux" in user_agent else "Unknown OS"
        )
    )

    browser = "Chrome" if "Chrome" in user_agent and "Safari" in user_agent and "Edge" not in user_agent else (
        "Safari" if "Safari" in user_agent and "Chrome" not in user_agent else (
            "Firefox" if "Firefox" in user_agent else (
                "Edge" if "Edge" in user_agent or "Edg" in user_agent else "Browser"
            )
        )
    )

    device = "Mobile" if any(x in user_agent for x in ["Mobile", "Android", "iPhone"]) else "Desktop"

    return {
        "device_name": device,
        "browser": browser,
        "operating_system": os_name,
        "ip_address": ip_address,
        "country": country,
        "user_agent": user_agent,
    }

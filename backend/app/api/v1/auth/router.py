"""
app/api/v1/auth/router.py
-------------------------
Authentication REST API endpoints:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
  - GET  /auth/session
"""

from __future__ import annotations

from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.config import settings
from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_session_info, oauth2_scheme
from app.models.user import UserModel
from app.schemas.auth import (
    LoginRequest,
    LoginResponseData,
    RegisterRequest,
    RegisterResponseData,
    SessionResponseData,
    TokenRefreshResponseData,
)
from app.schemas.base import APIResponse
from app.services.auth_service import (
    authenticate_user,
    logout_user,
    register_user,
    rotate_refresh_token,
    _to_user_summary,
)
from app.utils.security import decode_token

auth_router = APIRouter()


# ── Cookie Configuration Helper ─────────────────────────────────────────────

def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set secure HttpOnly cookie for refresh token, supporting cross-domain requests."""
    is_prod = settings.ENVIRONMENT == "production" or not settings.DEBUG
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_prod,  # True in production HTTPS
        samesite="none" if is_prod else "lax",
        max_age=7 * 24 * 3600,
        path="/api/v1/auth",
    )


# ── POST /auth/register ─────────────────────────────────────────────────────

@auth_router.post(
    "/register",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new candidate account",
)
async def register(
    payload: RegisterRequest,
    session_info: dict = Depends(get_current_session_info),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_summary = await register_user(db, payload, session_info)
    return APIResponse(
        success=True,
        message="User account registered successfully.",
        data=RegisterResponseData(user=user_summary).model_dump(),
    )


# ── POST /auth/login ────────────────────────────────────────────────────────

@auth_router.post(
    "/login",
    response_model=APIResponse,
    summary="Authenticate user credentials and issue tokens",
)
async def login(
    payload: LoginRequest,
    response: Response,
    session_info: dict = Depends(get_current_session_info),
) -> APIResponse:
    db = mongo_manager.get_database()
    access_token, refresh_token, user_summary = await authenticate_user(db, payload, session_info)
    _set_refresh_cookie(response, refresh_token)
    return APIResponse(
        success=True,
        message="Login successful.",
        data=LoginResponseData(
            access_token=access_token,
            user=user_summary,
            refresh_token=refresh_token,
        ).model_dump(),
    )


# ── POST /auth/refresh ──────────────────────────────────────────────────────

@auth_router.post(
    "/refresh",
    response_model=APIResponse,
    summary="Rotate refresh token and issue a new access token",
)
async def refresh(request: Request, response: Response) -> APIResponse:
    refresh_token = request.cookies.get("refresh_token") or request.headers.get("x-refresh-token")
    if not refresh_token and request.headers.get("content-type", "").startswith("application/json"):
        try:
            body = await request.json()
            if isinstance(body, dict):
                refresh_token = body.get("refresh_token")
        except Exception:
            pass

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Refresh token missing from cookies or request.", "errors": [{"code": "MISSING_COOKIE"}]},
        )
    db = mongo_manager.get_database()
    new_access, new_refresh, _ = await rotate_refresh_token(db, refresh_token)
    _set_refresh_cookie(response, new_refresh)
    return APIResponse(
        success=True,
        message="Token refreshed successfully.",
        data=TokenRefreshResponseData(
            access_token=new_access,
            refresh_token=new_refresh,
        ).model_dump(),
    )


# ── POST /auth/logout ───────────────────────────────────────────────────────

@auth_router.post(
    "/logout",
    response_model=APIResponse,
    summary="Revoke active refresh token and terminate session",
)
async def logout(request: Request, response: Response) -> APIResponse:
    refresh_token = request.cookies.get("refresh_token") or request.headers.get("x-refresh-token")
    if not refresh_token and request.headers.get("content-type", "").startswith("application/json"):
        try:
            body = await request.json()
            if isinstance(body, dict):
                refresh_token = body.get("refresh_token")
        except Exception:
            pass

    if refresh_token:
        db = mongo_manager.get_database()
        await logout_user(db, refresh_token)

    is_prod = settings.ENVIRONMENT == "production" or not settings.DEBUG
    response.delete_cookie(
        "refresh_token",
        path="/api/v1/auth",
        secure=is_prod,
        samesite="none" if is_prod else "lax",
    )
    return APIResponse(
        success=True,
        message="Logged out successfully.",
        data={},
    )


# ── GET /auth/session ───────────────────────────────────────────────────────

@auth_router.get(
    "/session",
    response_model=APIResponse,
    summary="Hydrate and check active authentication state",
)
async def get_session(
    request: Request,
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme),
) -> APIResponse:
    # 1. Check Bearer Access Token
    if bearer:
        try:
            payload = decode_token(bearer.credentials)
            user_id = payload.get("sub")
            if user_id and payload.get("type") == "access":
                db = mongo_manager.get_database()
                user_doc = await db["users"].find_one({"_id": ObjectId(user_id), "is_deleted": False})
                if user_doc:
                    user = UserModel(**user_doc)
                    return APIResponse(
                        success=True,
                        message="Session active.",
                        data=SessionResponseData(authenticated=True, user=_to_user_summary(user)).model_dump(),
                    )
        except Exception:
            pass

    # 2. Fallback: Check Refresh Token Cookie or Request Header
    refresh_token = request.cookies.get("refresh_token") or request.headers.get("x-refresh-token")
    if refresh_token:
        try:
            payload = decode_token(refresh_token)
            user_id = payload.get("sub")
            if user_id and payload.get("type") == "refresh":
                db = mongo_manager.get_database()
                user_doc = await db["users"].find_one({"_id": ObjectId(user_id), "is_deleted": False})
                if user_doc:
                    user = UserModel(**user_doc)
                    return APIResponse(
                        success=True,
                        message="Session active via refresh cookie.",
                        data=SessionResponseData(authenticated=True, user=_to_user_summary(user)).model_dump(),
                    )
        except Exception:
            pass

    return APIResponse(
        success=True,
        message="No active session.",
        data=SessionResponseData(authenticated=False).model_dump(),
    )

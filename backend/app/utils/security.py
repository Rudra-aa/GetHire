"""
app/utils/security.py
---------------------
Security utilities: password hashing/verification using native bcrypt
and JWT access/refresh token generation and validation.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

import bcrypt
from jose import jwt, JWTError

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


# ── Password Hashing Helpers ───────────────────────────────────────────────

def hash_password(password: str) -> str:
    """
    Generate a secure bcrypt hash of a plaintext password.
    Bcrypt has a 72-byte limit, so bytes are safely sliced to 72.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against its bcrypt hash in constant time.
    """
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as exc:
        logger.error("Password verification failed", error=str(exc))
        return False


# ── JWT Helpers ─────────────────────────────────────────────────────────────

def create_access_token(
    user_id: str,
    role: str = "candidate",
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str]:
    """
    Generate a signed short-lived JWT Access Token (default 15 minutes).
    Returns (token_string, jti_string).
    """
    now = datetime.now(timezone.utc)
    duration = expires_delta or timedelta(minutes=15)
    expire = now + duration
    jti = str(uuid.uuid4())

    payload = {
        "sub": user_id,
        "role": role,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "jti": jti,
        "type": "access",
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token, jti


def create_refresh_token(
    user_id: str,
    token_family: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str, str]:
    """
    Generate a signed JWT Refresh Token (default 7 days).
    Returns (token_string, jti_string, token_family_string).
    """
    now = datetime.now(timezone.utc)
    duration = expires_delta or timedelta(days=7)
    expire = now + duration
    jti = str(uuid.uuid4())
    family = token_family or jti

    payload = {
        "sub": user_id,
        "token_family": family,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "jti": jti,
        "type": "refresh",
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token, jti, family


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode, verify signature and claim expiration for a JWT token.
    Raises JWTError if invalid or expired.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=["HS256"],
    )

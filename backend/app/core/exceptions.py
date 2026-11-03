"""
app/core/exceptions.py
----------------------
Centralised custom exception classes and FastAPI exception handlers.

Design principles:
- Every custom exception carries a machine-readable `code` string so that
  API clients can programmatically react without parsing message text.
- Exception handlers translate Python exceptions into the standard GetHire
  JSON error envelope (see docs/API_SPEC.md §1.3).
- Responses NEVER expose internal implementation details (stack traces,
  database query details, filesystem paths, or environment variables) to clients.
- Detailed diagnostic information and stack traces are preserved server-side
  with correlation request IDs.

Usage (raising):
    raise ResourceNotFoundError("Session abc123 not found", code="SESSION_NOT_FOUND")

Usage (registering):
    from app.core.exceptions import register_exception_handlers
    register_exception_handlers(app)
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)


# ── Sanitization Patterns for Production Safety ──────────────────────────────

_FS_PATH_PATTERN = re.compile(
    r"(?:/[a-zA-Z0-9_\.\-]+){3,}|(?:[a-zA-Z]:\\[a-zA-Z0-9_\.\-\\]+)",
    re.IGNORECASE,
)
_DB_URI_PATTERN = re.compile(
    r"(?:mongodb(?:\+srv)?|redis|postgres(?:ql)?|mysql)://[^\s\"']+",
    re.IGNORECASE,
)
_INTERNAL_HOST_PATTERN = re.compile(
    r"(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d{4,5}",
    re.IGNORECASE,
)
_TRACEBACK_PATTERN = re.compile(
    r"(?:Traceback \(most recent call last\)|File \".*\", line \d+)",
    re.IGNORECASE,
)
_INTERNAL_KEYWORDS = (
    "pymongo",
    "motor",
    "bson",
    "sqlalchemy",
    "psycopg",
    "redis.exceptions",
    "connection pool",
    "server selection timeout",
    "syntaxerror",
    "attributeerror",
    "typeerror",
)


def _sanitize_text(text: str, is_server_error: bool = False) -> str:
    """Scrub internal filesystem paths, database URIs, and stack traces from client text."""
    if not isinstance(text, str):
        return str(text)

    if is_server_error:
        # Never expose raw exception strings or internals on 5xx errors
        return "An unexpected error occurred. Our team has been notified."

    cleaned = _DB_URI_PATTERN.sub("[database-connection]", text)
    cleaned = _FS_PATH_PATTERN.sub("[path]", cleaned)
    cleaned = _INTERNAL_HOST_PATTERN.sub("[internal-host]", cleaned)

    if _TRACEBACK_PATTERN.search(cleaned) or any(k in cleaned.lower() for k in _INTERNAL_KEYWORDS):
        return "A processing error occurred. Please verify your request."

    return cleaned


def _sanitize_details(details: Any, is_server_error: bool = False) -> Any:
    """Scrub sensitive or internal details recursively."""
    if is_server_error:
        return {}

    if isinstance(details, str):
        return _sanitize_text(details, is_server_error=False)
    elif isinstance(details, dict):
        cleaned: Dict[str, Any] = {}
        for k, v in details.items():
            k_clean = _sanitize_text(str(k), is_server_error=False)
            cleaned[k_clean] = _sanitize_details(v, is_server_error=False)
        return cleaned
    elif isinstance(details, (list, tuple, set)):
        return [_sanitize_details(item, is_server_error=False) for item in details]
    return details


# ---------------------------------------------------------------------------
# Custom exception base
# ---------------------------------------------------------------------------

class GetHireException(Exception):
    """
    Base class for all application-level exceptions.

    Args:
        message: Human-readable description (surfaced safely to API clients).
        code:    Machine-readable error code string (e.g. "SESSION_NOT_FOUND").
        status_code: HTTP status code to return.
        details: Optional dict with additional context.
    """

    def __init__(
        self,
        message: str,
        code: str = "APPLICATION_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


# ---------------------------------------------------------------------------
# Concrete exception subclasses
# ---------------------------------------------------------------------------

class ResourceNotFoundError(GetHireException):
    def __init__(self, message: str = "Resource not found.", code: str = "NOT_FOUND", details: dict | None = None) -> None:
        super().__init__(message, code=code, status_code=status.HTTP_404_NOT_FOUND, details=details)


class ValidationError(GetHireException):
    def __init__(self, message: str = "Validation failed.", code: str = "VALIDATION_ERROR", details: dict | None = None) -> None:
        super().__init__(message, code=code, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)


class UnauthorizedError(GetHireException):
    def __init__(self, message: str = "Authentication required.", code: str = "UNAUTHORIZED") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(GetHireException):
    def __init__(self, message: str = "Insufficient permissions.", code: str = "FORBIDDEN") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_403_FORBIDDEN)


class ConflictError(GetHireException):
    def __init__(self, message: str = "Resource conflict.", code: str = "CONFLICT", details: dict | None = None) -> None:
        super().__init__(message, code=code, status_code=status.HTTP_409_CONFLICT, details=details)


class RateLimitError(GetHireException):
    def __init__(self, message: str = "Too many requests. Please slow down.", code: str = "RATE_LIMITED") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_429_TOO_MANY_REQUESTS)


class ServiceUnavailableError(GetHireException):
    def __init__(self, message: str = "Service temporarily unavailable.", code: str = "SERVICE_UNAVAILABLE") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)


# ---------------------------------------------------------------------------
# Error response builder
# ---------------------------------------------------------------------------

def _build_error_response(
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
    errors: list[dict[str, Any]] | None = None,
) -> JSONResponse:
    """Build the standard, consistent, sanitized GetHire JSON error envelope."""
    request_id = getattr(request.state, "request_id", None) or request.headers.get("X-Request-ID") or str(uuid.uuid4())
    is_server_error = status_code >= 500

    sanitized_message = _sanitize_text(message, is_server_error=is_server_error)
    sanitized_details = _sanitize_details(details, is_server_error=is_server_error) or {}

    errors_list: List[Dict[str, Any]] = []
    if errors:
        for err in errors:
            clean_err = {
                "code": err.get("code", code),
                "message": _sanitize_text(err.get("message", sanitized_message), is_server_error=is_server_error),
            }
            if "field" in err:
                clean_err["field"] = err["field"]
            errors_list.append(clean_err)
    elif details and "fields" in details and isinstance(details["fields"], dict):
        for field_name, msgs in details["fields"].items():
            for m in msgs:
                clean_msg = _sanitize_text(str(m), is_server_error=is_server_error)
                errors_list.append({"code": code, "field": field_name, "message": clean_msg})
    else:
        errors_list.append({"code": code, "message": sanitized_message})

    timestamp = datetime.now(timezone.utc).isoformat()

    return JSONResponse(
        status_code=status_code,
        headers={"X-Request-ID": request_id},
        content={
            "success": False,
            "message": sanitized_message,
            "data": None,
            "errors": errors_list,
            "error": {
                "code": code,
                "message": sanitized_message,
                "details": sanitized_details,
                "request_id": request_id,
                "timestamp": timestamp,
            },
        },
    )


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

async def gethire_exception_handler(request: Request, exc: GetHireException) -> JSONResponse:
    """Handle all GetHireException subclasses."""
    request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
    logger.warning(
        "Application exception",
        code=exc.code,
        status=exc.status_code,
        path=request.url.path,
        method=request.method,
        request_id=request_id,
        message=exc.message,
    )
    return _build_error_response(
        request,
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors from request parsing."""
    request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
    field_errors: dict[str, list[str]] = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        field_errors.setdefault(field, []).append(error.get("msg", "Invalid value"))

    logger.warning(
        "Request validation failed",
        path=request.url.path,
        method=request.method,
        request_id=request_id,
        field_count=len(field_errors),
    )
    return _build_error_response(
        request,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="VALIDATION_ERROR",
        message="Request validation failed. Check the details field for per-field errors.",
        details={"fields": field_errors},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for unhandled exceptions.
    Logs full diagnostic traceback server-side with correlation request_id,
    while returning a completely sanitized generic envelope to the client.
    """
    request_id = getattr(request.state, "request_id", None) or request.headers.get("X-Request-ID") or str(uuid.uuid4())
    logger.exception(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        request_id=request_id,
        exc_type=type(exc).__name__,
        exc=str(exc),
    )
    return _build_error_response(
        request,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="INTERNAL_ERROR",
        message="An unexpected error occurred. Our team has been notified.",
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle standard Starlette / FastAPI HTTPException with consistent response envelope."""
    request_id = getattr(request.state, "request_id", None) or request.headers.get("X-Request-ID") or str(uuid.uuid4())

    if isinstance(exc.detail, dict):
        detail_dict = exc.detail
        msg = detail_dict.get("message", "Request failed.")
        raw_errors = detail_dict.get("errors", [])
        code = (
            raw_errors[0].get("code")
            if raw_errors and isinstance(raw_errors[0], dict)
            else f"HTTP_{exc.status_code}"
        )
        return _build_error_response(
            request,
            status_code=exc.status_code,
            code=code,
            message=msg,
            details=detail_dict.get("details", {}),
            errors=raw_errors if raw_errors else None,
        )

    return _build_error_response(
        request,
        status_code=exc.status_code,
        code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
    )


# ---------------------------------------------------------------------------
# Registration helper
# ---------------------------------------------------------------------------

def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all exception handlers on the FastAPI application.
    Call this once during application creation (in create_application()).
    """
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(GetHireException, gethire_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)  # type: ignore[arg-type]

"""
app/core/exceptions.py
----------------------
Centralised custom exception classes and FastAPI exception handlers.

Design principles:
- Every custom exception carries a machine-readable `code` string so that
  API clients can programmatically react without parsing message text.
- Exception handlers translate Python exceptions into the standard GetHire
  JSON error envelope (see docs/API_SPEC.md §1.3).
- The catch-all handler never exposes internal stack traces to clients.

Usage (raising):
    raise ResourceNotFoundError("Session abc123 not found", code="SESSION_NOT_FOUND")

Usage (registering):
    from app.core.exceptions import register_exception_handlers
    register_exception_handlers(app)
"""

from __future__ import annotations

import traceback
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Custom exception base
# ---------------------------------------------------------------------------

class GetHireException(Exception):
    """
    Base class for all application-level exceptions.

    Args:
        message: Human-readable description (surfaced to API clients).
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
    def __init__(self, message: str, code: str = "NOT_FOUND", details: dict | None = None) -> None:
        super().__init__(message, code=code, status_code=status.HTTP_404_NOT_FOUND, details=details)


class ValidationError(GetHireException):
    def __init__(self, message: str, code: str = "VALIDATION_ERROR", details: dict | None = None) -> None:
        super().__init__(message, code=code, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)


class UnauthorizedError(GetHireException):
    def __init__(self, message: str = "Authentication required.", code: str = "UNAUTHORIZED") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(GetHireException):
    def __init__(self, message: str = "You do not have permission.", code: str = "FORBIDDEN") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_403_FORBIDDEN)


class ConflictError(GetHireException):
    def __init__(self, message: str, code: str = "CONFLICT", details: dict | None = None) -> None:
        super().__init__(message, code=code, status_code=status.HTTP_409_CONFLICT, details=details)


class RateLimitError(GetHireException):
    def __init__(self, message: str = "Too many requests. Please slow down.", code: str = "RATE_LIMITED") -> None:
        super().__init__(message, code=code, status_code=status.HTTP_429_TOO_MANY_REQUESTS)


class ServiceUnavailableError(GetHireException):
    def __init__(self, message: str, code: str = "SERVICE_UNAVAILABLE") -> None:
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
) -> JSONResponse:
    """Build the standard GetHire JSON error envelope."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    errors_list = []
    if details and "fields" in details and isinstance(details["fields"], dict):
        for field_name, msgs in details["fields"].items():
            for m in msgs:
                errors_list.append({"code": code, "field": field_name, "message": m})
    else:
        errors_list.append({"code": code, "message": message})

    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": None,
            "errors": errors_list,
            "error": {
                "code": code,
                "message": message,
                "details": details or {},
                "request_id": request_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        },
    )


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

async def gethire_exception_handler(request: Request, exc: GetHireException) -> JSONResponse:
    """Handle all GetHireException subclasses."""
    logger.warning(
        "Application exception",
        code=exc.code,
        status=exc.status_code,
        path=request.url.path,
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
    # Transform Pydantic errors into a clean details dict
    field_errors: dict[str, list[str]] = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        field_errors.setdefault(field, []).append(error["msg"])

    logger.warning(
        "Request validation failed",
        path=request.url.path,
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

    Logs the full traceback server-side but returns a generic message to the
    client (never expose internal details in production).
    """
    logger.exception(
        "Unhandled exception",
        path=request.url.path,
        exc_type=type(exc).__name__,
        exc=str(exc),
    )
    return _build_error_response(
        request,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="INTERNAL_ERROR",
        message="An unexpected error occurred. Our team has been notified.",
    )


from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle standard HTTPException and unwrap structured dictionaries."""
    if isinstance(exc.detail, dict):
        body = {
            "success": exc.detail.get("success", False),
            "message": exc.detail.get("message", "Request failed."),
            "data": exc.detail.get("data", None),
            "errors": exc.detail.get("errors", []),
        }
        return JSONResponse(status_code=exc.status_code, content=body)

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

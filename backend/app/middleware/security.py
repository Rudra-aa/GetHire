"""
app/middleware/security.py
--------------------------
Security middleware for GetHire.

Adds HTTP security response headers to every outgoing response.
These headers protect against common browser-based attacks (XSS, clickjacking,
MIME sniffing) without requiring any authentication logic.

Registered in app/main.py via:
    application.middleware("http")(add_security_headers)
"""

from __future__ import annotations

import uuid

from fastapi import Request, Response
from starlette.middleware.base import RequestResponseEndpoint


async def add_security_headers(request: Request, call_next: RequestResponseEndpoint) -> Response:
    """
    ASGI middleware that:
    1. Generates a unique X-Request-ID for every request (used in log correlation).
    2. Adds security headers to every response.

    Args:
        request:   Incoming HTTP request.
        call_next: Next handler in the middleware chain.

    Returns:
        HTTP response with security headers added.
    """
    # Inject a request ID into request state so exception handlers can
    # include it in error responses for client-side tracing.
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id

    response: Response = await call_next(request)

    # ── Security Headers ─────────────────────────────────────────────────────

    # Prevent MIME type sniffing (e.g., an uploaded file being executed as JS)
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Prevent clickjacking by disallowing the page from being embedded in a frame
    response.headers["X-Frame-Options"] = "DENY"

    # Recommend browsers use strict referrer policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Disable legacy XSS filter (modern browsers use CSP instead)
    response.headers["X-XSS-Protection"] = "0"

    # Permissions Policy — restrict access to sensitive browser APIs
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=()"
    )

    # HSTS — only set in production (would break HTTP-only dev environments)
    # Uncomment when deploying to HTTPS:
    # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Propagate the request ID back to the client for tracing
    response.headers["X-Request-ID"] = request_id

    return response

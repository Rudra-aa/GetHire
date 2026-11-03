"""
app/middleware/rate_limit.py
----------------------------
Configurable Rate Limiting Middleware for GetHire.

Limits the number of requests clients can make to sensitive, high-frequency,
and resource-intensive endpoints:
  - Login (brute force protection)
  - Registration (account spam prevention)
  - Password reset (token enumeration prevention)
  - OTP / email verification (brute force code protection)
  - File uploads (disk & parser protection)
  - AI/ML processing (GPU/LLM quota & CPU protection)
  - Search (database load protection)
  - Public API endpoints (availability protection)
  - Payment endpoints (double charge & card testing prevention)

Infrastructure:
  - Redis integration via app.db.redis_client.redis_manager when available.
  - In-memory sliding window fallback when Redis is offline, degraded, or in test runners.
  - Configurable limits via app.core.config.settings.
"""

from __future__ import annotations

import asyncio
import re
import time
from datetime import datetime, timezone
from typing import Callable, Dict, List, Optional, Set, Tuple

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.config import settings
from app.core.logging import get_logger
from app.db.redis_client import redis_manager

logger = get_logger(__name__)


# ── In-Memory Sliding Window Store ──────────────────────────────────────────

class InMemoryRateLimitStore:
    """
    Thread-safe / async in-memory sliding window rate limiter.
    Used when Redis is not available or during isolated tests.
    """

    def __init__(self) -> None:
        self._records: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()

    async def hit(self, key: str, limit: int, window: int) -> Tuple[int, int]:
        """
        Record a request hit for key under sliding window.
        Returns: (current_request_count, retry_after_seconds)
        """
        async with self._lock:
            now = time.time()
            window_start = now - window
            timestamps = self._records.get(key, [])

            # Prune timestamps older than current window
            valid_timestamps = [ts for ts in timestamps if ts > window_start]
            valid_timestamps.append(now)
            self._records[key] = valid_timestamps

            current_count = len(valid_timestamps)
            if current_count > limit:
                # Time until the oldest request in the window expires
                oldest = valid_timestamps[0]
                retry_after = max(1, int(oldest + window - now))
            else:
                retry_after = window

            return current_count, retry_after

    async def reset(self, key: Optional[str] = None) -> None:
        """Clear all or a specific rate limit key."""
        async with self._lock:
            if key:
                self._records.pop(key, None)
            else:
                self._records.clear()


in_memory_rate_limiter = InMemoryRateLimitStore()


# ── Rate Limit Rule Definition ──────────────────────────────────────────────

class RateLimitRule:
    """Defines matching criteria and dynamic limit resolution for an API route category."""

    def __init__(
        self,
        category: str,
        path_pattern: re.Pattern,
        get_config: Callable[[], Tuple[int, int]],
        methods: Optional[Set[str]] = None,
        check_request: Optional[Callable[[Request], bool]] = None,
    ) -> None:
        self.category = category
        self.path_pattern = path_pattern
        self.get_config = get_config
        self.methods = methods
        self.check_request = check_request

    def matches(self, request: Request) -> bool:
        if self.methods and request.method not in self.methods:
            return False
        if not self.path_pattern.search(request.url.path):
            return False
        if self.check_request and not self.check_request(request):
            return False
        return True


def _build_default_rules() -> List[RateLimitRule]:
    """Build rules mapped to configurable settings for all prioritized endpoint categories."""
    return [
        # 1. Login
        RateLimitRule(
            category="auth_login",
            path_pattern=re.compile(r"^/api/v1/auth/login/?$"),
            get_config=lambda: (settings.RATE_LIMIT_LOGIN_LIMIT, settings.RATE_LIMIT_LOGIN_WINDOW),
            methods={"POST"},
        ),
        # 2. Registration
        RateLimitRule(
            category="auth_register",
            path_pattern=re.compile(r"^/api/v1/auth/register/?$"),
            get_config=lambda: (settings.RATE_LIMIT_REGISTER_LIMIT, settings.RATE_LIMIT_REGISTER_WINDOW),
            methods={"POST"},
        ),
        # 3. Password reset
        RateLimitRule(
            category="auth_password_reset",
            path_pattern=re.compile(r"^/api/v1/auth/(?:password-reset|forgot-password|reset-password)/?$"),
            get_config=lambda: (settings.RATE_LIMIT_PASSWORD_RESET_LIMIT, settings.RATE_LIMIT_PASSWORD_RESET_WINDOW),
            methods={"POST"},
        ),
        # 4. OTP / Email verification
        RateLimitRule(
            category="auth_verification",
            path_pattern=re.compile(r"^/api/v1/auth/(?:verify-otp|verify-email|resend-verification|resend-otp)/?$"),
            get_config=lambda: (settings.RATE_LIMIT_VERIFICATION_LIMIT, settings.RATE_LIMIT_VERIFICATION_WINDOW),
            methods={"POST", "GET"},
        ),
        # 5. File uploads
        RateLimitRule(
            category="file_upload",
            path_pattern=re.compile(r"^/api/v1/resume/upload/?$|.*(?:\b|/)upload(?:-resume)?/?$"),
            get_config=lambda: (settings.RATE_LIMIT_UPLOAD_LIMIT, settings.RATE_LIMIT_UPLOAD_WINDOW),
            methods={"POST", "PUT"},
        ),
        # 6. AI/ML processing (Interview turns, evaluations and HireScore)
        RateLimitRule(
            category="ai_processing",
            path_pattern=re.compile(
                r"^/api/v1/(?:interview/sessions|evaluations|hirescore|assessment/(?:start|submit|analyze))"
            ),
            get_config=lambda: (settings.RATE_LIMIT_AI_PROCESSING_LIMIT, settings.RATE_LIMIT_AI_PROCESSING_WINDOW),
        ),
        # 7. High-frequency client telemetry must not consume interview-turn quota.
        RateLimitRule(
            category="telemetry",
            path_pattern=re.compile(r"^/api/v1/(?:facesense|integrity)"),
            get_config=lambda: (settings.RATE_LIMIT_TELEMETRY_LIMIT, settings.RATE_LIMIT_TELEMETRY_WINDOW),
        ),
        # 8. Search endpoints
        RateLimitRule(
            category="search",
            path_pattern=re.compile(r"^/api/v1/(?:search|admin/users)/?$"),
            get_config=lambda: (settings.RATE_LIMIT_SEARCH_LIMIT, settings.RATE_LIMIT_SEARCH_WINDOW),
            check_request=lambda req: req.url.path.endswith("/search") or bool(req.query_params.get("search")),
        ),
        # 9. Payment endpoints
        RateLimitRule(
            category="payments",
            path_pattern=re.compile(r"^/api/v1/(?:payments|checkout|billing|subscriptions)(?:/.*)?$"),
            get_config=lambda: (settings.RATE_LIMIT_PAYMENTS_LIMIT, settings.RATE_LIMIT_PAYMENTS_WINDOW),
        ),
        # 10. Public API endpoints
        RateLimitRule(
            category="public",
            path_pattern=re.compile(r"^/(?:api/v1/health|health)/?$"),
            get_config=lambda: (settings.RATE_LIMIT_PUBLIC_LIMIT, settings.RATE_LIMIT_PUBLIC_WINDOW),
            methods={"GET"},
        ),
    ]


# ── Rate Limiting Middleware ────────────────────────────────────────────────

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    HTTP Middleware enforcing configurable request-rate controls.
    """

    def __init__(
        self,
        app: any,
        routes_config: Optional[Dict[str, Tuple[int, int]]] = None,
    ) -> None:
        super().__init__(app)
        self.routes_config = routes_config or {}
        self.rules = _build_default_rules()
        self.memory_store = in_memory_rate_limiter

    @classmethod
    async def reset_limits(cls, key: Optional[str] = None) -> None:
        """Helper for test suites to clear in-memory rate limit records."""
        await in_memory_rate_limiter.reset(key)

    def _resolve_rule(self, request: Request) -> Optional[Tuple[str, int, int]]:
        """
        Resolve (category, limit_requests, window_seconds) for the incoming request.
        Explicit routes_config overrides take precedence if configured.
        """
        path = request.url.path

        # 1. Direct match from routes_config
        if path in self.routes_config:
            limit, window = self.routes_config[path]
            return "custom_route", limit, window

        # 2. Match categorized rules
        for rule in self.rules:
            if rule.matches(request):
                limit, window = rule.get_config()
                return rule.category, limit, window

        return None

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP, taking proxy headers (X-Forwarded-For) into account."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Check master switch
        if not getattr(settings, "RATE_LIMIT_ENABLED", True):
            return await call_next(request)

        rule_match = self._resolve_rule(request)
        if not rule_match:
            # Route is not rate-limited, proceed directly
            return await call_next(request)

        category, limit_requests, window_seconds = rule_match
        ip_address = self._get_client_ip(request)

        # Build rate limit storage key
        redis_key = f"rate_limit:{category}:{ip_address}"

        current_requests = 0
        retry_after_seconds = window_seconds

        # 1. Try Redis
        used_redis = False
        try:
            redis_client = redis_manager.get_client()
            pipe = redis_client.pipeline()
            incr_res = pipe.incr(redis_key)
            if asyncio.iscoroutine(incr_res):
                await incr_res
            exp_res = pipe.expire(redis_key, window_seconds, nx=True)
            if asyncio.iscoroutine(exp_res):
                await exp_res
            results = await pipe.execute()
            current_requests = int(results[0])

            ttl_res = redis_client.ttl(redis_key)
            ttl = await ttl_res if asyncio.iscoroutine(ttl_res) else ttl_res
            retry_after_seconds = max(1, ttl) if ttl > 0 else window_seconds
            used_redis = True
        except (RuntimeError, Exception) as exc:
            # Redis is not connected or threw an error -> transparently use in-memory sliding window
            used_redis = False

        if not used_redis:
            current_requests, retry_after_seconds = await self.memory_store.hit(
                redis_key, limit_requests, window_seconds
            )

        # 2. Check if request exceeded limit
        if current_requests > limit_requests:
            logger.warning(
                "Rate limit exceeded",
                ip=ip_address,
                category=category,
                path=request.url.path,
                limit=limit_requests,
                current=current_requests,
            )

            request_id = (
                getattr(request.state, "request_id", None)
                or request.headers.get("X-Request-ID")
                or "unknown"
            )
            now_iso = datetime.now(timezone.utc).isoformat()

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={
                    "Retry-After": str(retry_after_seconds),
                    "X-RateLimit-Limit": str(limit_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(retry_after_seconds),
                    "X-Request-ID": request_id,
                },
                content={
                    "success": False,
                    "message": "Too many requests. Please try again later.",
                    "data": None,
                    "errors": [
                        {
                            "code": "RATE_LIMITED",
                            "message": f"Rate limit of {limit_requests} requests per {window_seconds}s exceeded for {category.replace('_', ' ')}.",
                        }
                    ],
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": "Too many requests. Please try again later.",
                        "details": {
                            "category": category,
                            "limit": limit_requests,
                            "window_seconds": window_seconds,
                            "retry_after_seconds": retry_after_seconds,
                        },
                        "request_id": request_id,
                        "timestamp": now_iso,
                    },
                },
            )

        # 3. Request permitted: proceed and append standard rate limit headers
        response = await call_next(request)
        remaining = max(0, limit_requests - current_requests)
        response.headers["X-RateLimit-Limit"] = str(limit_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(retry_after_seconds)

        return response

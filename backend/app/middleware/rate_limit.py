"""
app/middleware/rate_limit.py
----------------------------
Redis-based Rate Limiting Middleware for GetHire.

Limits the number of requests clients can make to sensitive endpoints (such as
authentication routes) in a given time window.

Configuration:
  - Default rate limit: 10 requests per 60 seconds per IP for authentication endpoints.
  - Fail-safe: If Redis is unavailable, the rate limiter fails open (logs a
    warning and lets requests proceed) to avoid breaking the application.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Dict, Tuple

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.config import settings
from app.core.logging import get_logger
from app.db.redis_client import redis_manager

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    HTTP Middleware enforcing rate limits on sensitive endpoints using Redis.
    """

    def __init__(
        self,
        app: any,
        # Endpoint prefix path -> (limit_requests, window_seconds)
        routes_config: Dict[str, Tuple[int, int]] | None = None
    ) -> None:
        super().__init__(app)
        if routes_config:
            self.routes_config = routes_config
        elif settings.ENVIRONMENT == "development" or settings.DEBUG:
            # Relaxed rate limits for local development & testing
            self.routes_config = {
                "/api/v1/auth/login": (100, 60),
                "/api/v1/auth/register": (100, 60),
                "/api/v1/auth/refresh": (200, 60),
            }
        else:
            # Production rate limit configuration
            self.routes_config = {
                "/api/v1/auth/login": (10, 60),
                "/api/v1/auth/register": (10, 3600),
                "/api/v1/auth/refresh": (60, 3600),
            }

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        
        # Check if the requested path has a rate limit configuration
        config = self.routes_config.get(path)
        if not config:
            # Route is not rate-limited, proceed directly
            return await call_next(request)

        limit_requests, window_seconds = config
        
        # Determine client IP (handles proxy forwarded headers)
        ip_address = request.client.host if request.client else "127.0.0.1"
        if request.headers.get("X-Forwarded-For"):
            ip_address = request.headers.get("X-Forwarded-For").split(",")[0].strip()

        # Redis key format: rate_limit:{ip}:{path}
        redis_key = f"rate_limit:{ip_address}:{path}"

        try:
            redis_client = redis_manager.get_client()
            
            # Atomic check-and-increment using pipeline
            pipe = redis_client.pipeline()
            await pipe.incr(redis_key)
            await pipe.expire(redis_key, window_seconds, nx=True)
            results = await pipe.execute()
            
            current_requests = int(results[0])

            if current_requests > limit_requests:
                logger.warning(
                    "Rate limit exceeded",
                    ip=ip_address,
                    path=path,
                    limit=limit_requests,
                    current=current_requests,
                )
                
                # Fetch remaining TTL on the rate limit key
                ttl = await redis_client.ttl(redis_key)
                retry_after_seconds = max(0, ttl)

                request_id = getattr(request.state, "request_id", "unknown")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={"Retry-After": str(retry_after_seconds)},
                    content={
                        "success": False,
                        "message": "Too many requests. Please try again later.",
                        "errors": [
                            {
                                "code": "RATE_LIMITED",
                                "message": f"Rate limit of {limit_requests} requests per {window_seconds}s exceeded.",
                                "retry_after_seconds": retry_after_seconds,
                                "request_id": request_id,
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }
                        ]
                    }
                )

        except RuntimeError:
            # Redis manager throws RuntimeError if not connected (e.g. at startup or degraded)
            logger.warning(
                "Redis client not connected, rate limiter failed open",
                path=path,
                ip=ip_address,
            )
        except Exception as exc:
            logger.error(
                "Rate limiter error occurred, failed open",
                path=path,
                ip=ip_address,
                error=str(exc),
            )

        return await call_next(request)

"""
app/db/redis_client.py
----------------------
Redis connection manager for GetHire.

Provides a single shared Redis connection pool using the async redis-py client.
Used for caching, session state, rate limiting, and as the Celery broker.

Usage:
    from app.db.redis_client import redis_manager

    # In a route or service:
    client = await redis_manager.get_client()
    await client.set("key", "value", ex=300)
    value = await client.get("key")
"""

from __future__ import annotations

import re
from typing import Optional

import redis.asyncio as aioredis
from redis.asyncio import Redis
from redis.exceptions import ConnectionError as RedisConnectionError

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def _redact_redis_url(url: str) -> str:
    """Return a URL with credentials stripped for safe logging."""
    if not url:
        return "(none)"
    return re.sub(r"://([^:]*):([^@]+)@", r"://\1:***@", url)


class RedisManager:
    """
    Manages a single shared async Redis connection pool.

    Lifecycle:
        connect()    → called at application startup
        disconnect() → called at application shutdown
        get_client() → returns the shared Redis client
        ping()       → called by the health endpoint
    """

    def __init__(self) -> None:
        self._client: Optional[Redis] = None  # type: ignore[type-arg]

    async def connect(self) -> None:
        """
        Create the async Redis client and verify connectivity.

        Does not raise if Redis is unavailable — the app will
        start in a degraded state and the health endpoint will reflect this.
        """
        url = (settings.REDIS_URL or "").strip()
        if not url:
            logger.info("REDIS_URL is not configured. Skipping Redis initialization; running in degraded mode.")
            self._client = None
            return

        if settings.is_production and any(h in url.lower() for h in ("localhost", "127.0.0.1", "0.0.0.0")):
            logger.info("REDIS_URL points to localhost in production. Skipping Redis initialization; running in degraded mode.")
            self._client = None
            return

        redacted_url = self._redacted_url()
        logger.info("Connecting to Redis", url=redacted_url)
        try:
            self._client = aioredis.from_url(
                url,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # Verify the connection is alive
            await self._client.ping()
            logger.info(
                "Redis connected",
                max_connections=settings.REDIS_MAX_CONNECTIONS,
            )
        except (RedisConnectionError, Exception) as exc:
            if self._client is not None:
                try:
                    await self._client.aclose()
                except Exception:
                    pass
                self._client = None

            logger.warning(
                "Redis connection could not be established. Service is running in degraded mode without Redis cache.",
                error=str(exc),
                url=redacted_url,
            )

    async def disconnect(self) -> None:
        """Close the connection pool gracefully."""
        if self._client is not None:
            try:
                await self._client.aclose()
            except Exception:
                pass
            self._client = None
            logger.info("Redis disconnected")

    def get_client(self) -> Redis:  # type: ignore[type-arg]
        """
        Return the active Redis client.

        Raises:
            RuntimeError: If called when Redis is not connected.
        """
        if self._client is None:
            raise RuntimeError(
                "Redis is not connected or configured. "
                "Service is running in degraded mode without Redis cache."
            )
        return self._client

    async def ping(self) -> bool:
        """
        Check whether Redis is reachable.

        Returns:
            True if the PING command succeeds, False otherwise.
        """
        if self._client is None:
            return False
        try:
            result = await self._client.ping()
            return bool(result)
        except Exception:
            return False

    # ── Helpers ───────────────────────────────────────────────────────────

    def _redacted_url(self) -> str:
        """Return the URL with credentials stripped for safe logging."""
        return _redact_redis_url(settings.REDIS_URL)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

redis_manager = RedisManager()


# ---------------------------------------------------------------------------
# FastAPI dependency helper
# ---------------------------------------------------------------------------

def get_redis() -> Redis:  # type: ignore[type-arg]
    """
    FastAPI dependency that returns the active Redis client.

    Usage in a route:
        async def my_route(cache: Redis = Depends(get_redis)):
            ...
    """
    return redis_manager.get_client()

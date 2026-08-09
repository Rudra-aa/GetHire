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

from typing import Optional

import redis.asyncio as aioredis
from redis.asyncio import Redis
from redis.exceptions import ConnectionError as RedisConnectionError

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


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

        Does not raise in development if Redis is unavailable — the app will
        start in a degraded state and the health endpoint will reflect this.
        """
        logger.info("Connecting to Redis", url=self._redacted_url())
        try:
            self._client = aioredis.from_url(
                settings.REDIS_URL,
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
            logger.error("Redis connection failed", error=str(exc))
            if settings.is_production:
                raise

    async def disconnect(self) -> None:
        """Close the connection pool gracefully."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            logger.info("Redis disconnected")

    def get_client(self) -> Redis:  # type: ignore[type-arg]
        """
        Return the active Redis client.

        Raises:
            RuntimeError: If called before connect().
        """
        if self._client is None:
            raise RuntimeError(
                "Redis is not connected. "
                "Ensure connect() is called during application startup."
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
        url = settings.REDIS_URL
        if "@" in url:
            scheme_end = url.index("//") + 2
            at_pos = url.rindex("@")
            return url[:scheme_end] + "***" + url[at_pos:]
        return url


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

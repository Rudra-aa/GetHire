"""
app/db/mongo.py
---------------
MongoDB connection manager for GetHire.

Provides a single Motor AsyncIOMotorClient instance shared across the entire
application.  The connection pool is established during application startup
(via the lifespan handler) and cleanly closed on shutdown.

Usage:
    from app.db.mongo import mongo_manager

    # In a route or service:
    db = mongo_manager.get_database()
    users_collection = db["users"]
    doc = await users_collection.find_one({"email": "alice@example.com"})
"""

from __future__ import annotations

import re
from typing import Optional

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.core.logging import get_logger

logger = get_logger(__name__)


def _redact_mongo_uri(uri: str) -> str:
    """Return a URI with user credentials safely stripped for logging."""
    if not uri:
        return "(empty)"
    # Redact user:password@host
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:***@", uri)


class MongoManager:
    """
    Manages a single shared MongoDB connection pool.

    Lifecycle:
        connect()    → called at application startup
        disconnect() → called at application shutdown
        get_database() → called by repositories and services
        ping()       → called by the health endpoint
    """

    def __init__(self) -> None:
        self._client: Optional[AsyncIOMotorClient] = None  # type: ignore[type-arg]
        self._db: Optional[AsyncIOMotorDatabase] = None  # type: ignore[type-arg]

    async def connect(self) -> None:
        """
        Create the Motor client and verify connectivity.

        Raises:
            ConnectionFailure: If MongoDB is unreachable at startup in production.
        """
        redacted_uri = self._redacted_uri()
        logger.info("Connecting to MongoDB", uri_host=redacted_uri)
        try:
            kwargs: dict = {
                "maxPoolSize": settings.MONGODB_MAX_POOL_SIZE,
                "minPoolSize": settings.MONGODB_MIN_POOL_SIZE,
                "serverSelectionTimeoutMS": 5000,
                "connectTimeoutMS": 5000,
                "socketTimeoutMS": 10000,
            }
            # Enable TLS verification with certifi CA bundle for Atlas SRV or explicit TLS/SSL URIs
            uri_clean = settings.MONGODB_URI.strip()
            uri_lower = uri_clean.lower()
            is_srv = uri_lower.startswith("mongodb+srv://")
            is_tls = is_srv or "tls=true" in uri_lower or "ssl=true" in uri_lower
            if is_tls:
                kwargs["tls"] = True
                kwargs["tlsCAFile"] = certifi.where()

            # Ensure valid write concern without whitespace or newline artifacts
            if "w=majority" in uri_lower or is_srv:
                kwargs["w"] = "majority"

            self._client = AsyncIOMotorClient(uri_clean, **kwargs)
            # Verify connection is actually alive
            await self._client.admin.command("ping")
            db_name = settings.MONGODB_DB_NAME.lower()
            self._db = self._client[db_name]
            logger.info(
                "MongoDB connected",
                database=db_name,
                max_pool=settings.MONGODB_MAX_POOL_SIZE,
            )
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as exc:
            # Clean up client reference so state accurately reflects failure
            if self._client is not None:
                self._client.close()
                self._client = None
            self._db = None

            err_msg = str(exc)
            hint = ""
            if "TLSV1_ALERT_INTERNAL_ERROR" in err_msg or "SSL handshake failed" in err_msg:
                hint = (
                    " [DIAGNOSTIC HINT: MongoDB Atlas rejected the TLS handshake (TLSV1_ALERT_INTERNAL_ERROR). "
                    "This error occurs when the client's outbound IP address is not whitelisted in MongoDB Atlas Network Access. "
                    "In MongoDB Atlas: go to Security -> Network Access -> Add IP Address -> select 'Allow Access From Anywhere' (0.0.0.0/0).]"
                )

            logger.error("MongoDB connection failed", error=err_msg + hint, uri_host=redacted_uri)

            if settings.is_production:
                logger.error(
                    "CRITICAL: MongoDB connection could not be established at startup. "
                    "In production, a database connection is strictly required.",
                    error=err_msg,
                )
                raise ConnectionFailure(f"Production database connection failed: {err_msg}{hint}") from exc

    async def disconnect(self) -> None:
        """Close the connection pool gracefully."""
        if self._client is not None:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("MongoDB disconnected")

    def get_database(self) -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
        """
        Return the active database handle.

        Raises:
            ServiceUnavailableError: If called before connect() or MongoDB is unreachable.
        """
        if self._db is None:
            raise ServiceUnavailableError(
                "Database is currently not connected. Please ensure MongoDB is running.",
                code="DATABASE_NOT_CONNECTED",
            )
        return self._db

    async def ping(self) -> bool:
        """
        Check whether MongoDB is reachable.

        Returns:
            True if the ping command succeeds, False otherwise.
        """
        if self._client is None:
            return False
        try:
            await self._client.admin.command("ping")
            return True
        except Exception:
            return False

    # ── Helpers ───────────────────────────────────────────────────────────

    def _redacted_uri(self) -> str:
        """Return a URI with credentials stripped for safe logging."""
        return _redact_mongo_uri(settings.MONGODB_URI)


# ---------------------------------------------------------------------------
# Module-level singleton — import this everywhere
# ---------------------------------------------------------------------------

mongo_manager = MongoManager()


# ---------------------------------------------------------------------------
# FastAPI dependency helper
# ---------------------------------------------------------------------------

def get_database() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    """
    FastAPI dependency that returns the active MongoDB database.

    Usage in a route:
        async def my_route(db: AsyncIOMotorDatabase = Depends(get_database)):
            ...
    """
    return mongo_manager.get_database()

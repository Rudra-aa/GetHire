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

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.core.logging import get_logger

logger = get_logger(__name__)


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
            ConnectionFailure: If MongoDB is unreachable at startup.
        """
        logger.info("Connecting to MongoDB", uri_host=self._redacted_uri())
        try:
            kwargs: dict = {
                "maxPoolSize": settings.MONGODB_MAX_POOL_SIZE,
                "minPoolSize": settings.MONGODB_MIN_POOL_SIZE,
                "serverSelectionTimeoutMS": 5000,
            }
            if "mongodb+srv://" in settings.MONGODB_URI:
                kwargs["tls"] = True
                kwargs["tlsInsecure"] = True

            self._client = AsyncIOMotorClient(settings.MONGODB_URI, **kwargs)
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
            logger.error("Primary MongoDB connection failed", error=str(exc))
            # Try fallback to local MongoDB in development mode
            if not settings.is_production:
                try:
                    logger.info("Attempting local MongoDB fallback at mongodb://localhost:27017")
                    self._client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
                    await self._client.admin.command("ping")
                    db_name = settings.MONGODB_DB_NAME.lower()
                    self._db = self._client[db_name]
                    logger.info("MongoDB connected successfully via local fallback", database=db_name)
                    return
                except Exception as fallback_err:
                    logger.error("Local MongoDB fallback also failed", error=str(fallback_err))

            if settings.is_production:
                logger.warning(
                    "MongoDB connection could not be established at startup. Service is running in degraded mode.",
                    error=str(exc),
                )

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
        uri = settings.MONGODB_URI
        if "@" in uri:
            # mongodb+srv://user:pass@host → mongodb+srv://***@host
            scheme_end = uri.index("//") + 2
            at_pos = uri.rindex("@")
            return uri[:scheme_end] + "***" + uri[at_pos:]
        return uri


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

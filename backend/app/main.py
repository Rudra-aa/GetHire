"""
GetHire Backend
===============
Application entry point.

Start (development):
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Start (production):
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
"""

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.db.mongo import mongo_manager
from app.db.redis_client import redis_manager
from app.middleware.security import add_security_headers
from app.middleware.rate_limit import RateLimitMiddleware

# ---------------------------------------------------------------------------
# Module-level logger — initialised after setup_logging() in lifespan
# ---------------------------------------------------------------------------
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown hooks
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan context manager.

    Executed once at startup (before the first request) and once at shutdown
    (after the last response).  Use this for expensive resource initialisation
    such as database connection pools.
    """
    # ── Startup ──────────────────────────────────────────────────────────────
    startup_start = time.perf_counter()

    # Initialise structured logging first so that all subsequent log messages
    # are formatted correctly.
    setup_logging(level=settings.LOG_LEVEL)

    logger.info(
        "Starting GetHire backend",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        port=8000,
    )

    # Connect to MongoDB
    await mongo_manager.connect()
    try:
        db = mongo_manager.get_database()
        from app.utils.db_indexes import init_db_indexes
        await init_db_indexes(db)
    except Exception as exc:
        logger.warning("Could not initialize DB indexes at startup", error=str(exc))

    # Connect to Redis
    await redis_manager.connect()

    startup_duration_ms = (time.perf_counter() - startup_start) * 1000
    logger.info(
        "GetHire backend started successfully",
        startup_duration_ms=round(startup_duration_ms, 2),
    )

    yield  # ← application serves requests here

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("GetHire backend shutting down")
    await mongo_manager.disconnect()
    await redis_manager.disconnect()
    logger.info("GetHire backend stopped")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Separating creation into a factory function makes the app easily testable
    (tests can call create_application() without side-effects).
    """
    application = FastAPI(
        title=settings.APP_NAME,
        description=(
            "**GetHire — AI-Powered Interview Readiness Platform**\n\n"
            "This API powers the GetHire backend. "
            "All endpoints are versioned under `/api/v1/`. "
            "Use `/docs` for interactive Swagger UI or `/redoc` for ReDoc."
        ),
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        # Do not expose the server header in production
        openapi_tags=[
            {"name": "System", "description": "Health checks and system information."},
        ],
    )

    # ── Middleware (order matters — outer middleware runs first) ──────────────

    # Trusted hosts — only accept requests from configured hosts in production
    if settings.ENVIRONMENT == "production":
        application.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS,
        )

    # CORS — must be registered before any route handlers
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=600,  # pre-flight cache: 10 minutes
    )

    # Security headers middleware (custom)
    application.middleware("http")(add_security_headers)

    # Rate limiting middleware (custom)
    application.add_middleware(RateLimitMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────────
    register_exception_handlers(application)

    # ── Routers ───────────────────────────────────────────────────────────────
    application.include_router(api_router, prefix="/api/v1")

    return application


# ---------------------------------------------------------------------------
# Application instance — imported by Uvicorn
# ---------------------------------------------------------------------------

app = create_application()


# ---------------------------------------------------------------------------
# Root and Healthz endpoints (for platform health checks and redirects)
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def root(request: Request) -> JSONResponse:
    """Redirect clients to the API documentation."""
    return JSONResponse(
        content={
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/api/v1/health",
        }
    )


@app.get("/healthz", include_in_schema=False)
async def healthz() -> dict:
    """Instant health probe for Render and cloud load balancers."""
    return {"status": "ok", "service": settings.APP_NAME}

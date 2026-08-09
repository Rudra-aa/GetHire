"""
app/api/v1/health/router.py
---------------------------
Health check endpoint for GetHire.

GET /api/v1/health

Returns service status, version, and individual dependency health.
Used by:
  - Docker Compose health checks
  - Load balancers / orchestrators
  - The frontend status dashboard
  - Uptime monitoring tools
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.mongo import mongo_manager
from app.db.redis_client import redis_manager
from app.schemas.health import HealthResponse, ServiceStatus

health_router = APIRouter()

# Record the time the application process started
_START_TIME = time.time()


@health_router.get(
    "",
    response_model=HealthResponse,
    summary="Health check",
    description=(
        "Returns the operational status of the GetHire backend and its "
        "downstream dependencies (MongoDB, Redis).\n\n"
        "- **healthy**: All dependencies reachable.\n"
        "- **degraded**: Application is running but one or more optional "
        "  dependencies are unreachable.\n"
        "- **unhealthy**: Critical dependency (e.g. database) is unreachable."
    ),
    responses={
        200: {"description": "Service is healthy or degraded (check status field)."},
        503: {"description": "Service is unhealthy (critical dependency down)."},
    },
)
async def health_check() -> JSONResponse:
    """
    Perform dependency health checks and return a status summary.

    The response is always JSON even for 503 responses, so clients can parse
    it programmatically.
    """
    # ── Check dependencies in parallel (gather would be cleaner but sequential
    #    is fine here — pings are sub-millisecond on localhost)
    mongo_ok = await mongo_manager.ping()
    redis_ok = await redis_manager.ping()

    # ── Determine overall status ──────────────────────────────────────────────
    if mongo_ok:
        # MongoDB is critical; Redis is optional (app degrades without it)
        overall_status: str = "healthy" if redis_ok else "degraded"
        http_status: int = 200
    else:
        overall_status = "unhealthy"
        http_status = 503

    uptime_seconds = round(time.time() - _START_TIME, 2)

    payload = HealthResponse(
        status=overall_status,
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        uptime_seconds=uptime_seconds,
        timestamp=datetime.now(timezone.utc).isoformat(),
        services=ServiceStatus(
            database="connected" if mongo_ok else "unreachable",
            redis="connected" if redis_ok else "unreachable",
        ),
    )

    return JSONResponse(
        status_code=http_status,
        content=payload.model_dump(),
    )

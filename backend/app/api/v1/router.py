"""
app/api/v1/router.py
--------------------
Aggregates all v1 API module routers into a single router.

This is the single place where modules are mounted.  Adding a new module
requires only importing its router and calling include_router() here.

Mounted by app/main.py:
    app.include_router(api_router, prefix="/api/v1")
"""

from fastapi import APIRouter

from app.api.v1.health.router import health_router

# ---------------------------------------------------------------------------
# Root v1 router
# ---------------------------------------------------------------------------

api_router = APIRouter()

# ── Module routers ─────────────────────────────────────────────────────────
# Mount each module router under its own prefix.
# Future modules (auth, resume, interview, ...) will be added here.

api_router.include_router(health_router, prefix="/health", tags=["System"])

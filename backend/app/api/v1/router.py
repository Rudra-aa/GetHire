"""
app/api/v1/router.py
--------------------
Aggregates all v1 API module routers into a single router.

This is the single place where modules are mounted. Adding a new module
requires only importing its router and calling include_router() here.

Mounted by app/main.py:
    app.include_router(api_router, prefix="/api/v1")
"""

from fastapi import APIRouter

from app.api.v1.health.router import health_router
from app.api.v1.auth.router import auth_router
from app.api.v1.users.router import users_router
from app.api.v1.resume.router import resume_router
from app.api.v1.interview.router import interview_router
from app.api.v1.evaluations.router import evaluations_router
from app.api.v1.hirescore.router import hirescore_router
from app.api.v1.facesense.router import facesense_router
from app.api.v1.integrity.router import integrity_router
from app.api.v1.assessment.router import assessment_router
from app.api.v1.career.router import career_router
from app.domains.candidate_graph.router import graph_router

# ---------------------------------------------------------------------------
# Root v1 router
# ---------------------------------------------------------------------------

api_router = APIRouter()

# ── Module routers ─────────────────────────────────────────────────────────
# Mount each module router under its own prefix.

api_router.include_router(health_router, prefix="/health", tags=["System"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(resume_router, prefix="/resume", tags=["Resume Intelligence"])
api_router.include_router(assessment_router, prefix="/assessment", tags=["Assessment Engine"])
api_router.include_router(interview_router, prefix="/interview", tags=["AI Interview Engine"])
api_router.include_router(evaluations_router, prefix="/evaluations", tags=["Evaluation Engine"])
api_router.include_router(hirescore_router, prefix="/hirescore", tags=["HireScore Engine"])
api_router.include_router(facesense_router, prefix="/facesense", tags=["FaceSense Intelligence Engine"])
api_router.include_router(integrity_router, prefix="/integrity", tags=["Interview Intelligence Engine"])
api_router.include_router(career_router, prefix="/career", tags=["Career Intelligence & Growth Loop"])
api_router.include_router(graph_router, prefix="/graph", tags=["Candidate Intelligence Graph Core"])





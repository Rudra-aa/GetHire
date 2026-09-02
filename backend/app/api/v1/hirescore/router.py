"""
app/api/v1/hirescore/router.py
-------------------------------
REST API endpoints for Phase 5: HireScore Engine & Career Intelligence Platform.
Provides candidate HireScore summaries, recalculations, history trends, industry benchmarks,
skill gap breakdowns, actionable recommendations, and adaptive career roadmaps.
"""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.hirescore import HireScoreModel
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.hirescore import (
    BenchmarkDetailsOut,
    HireScoreComponentsOut,
    HireScoreHistoryItemOut,
    HireScoreSummaryOut,
    ReadinessDetailsOut,
    RecommendationDetailsOut,
    RecomputeHireScoreRequest,
    RoadmapMilestoneOut,
    SkillGapItemOut,
)
from app.services.hire_score_engine import (
    get_or_compute_user_hirescore,
    get_user_hirescore_history,
)

hirescore_router = APIRouter()


def _format_hirescore_summary_out(m: HireScoreModel) -> HireScoreSummaryOut:
    return HireScoreSummaryOut(
        id=str(m.id) if m.id else "",
        user_id=m.user_id,
        session_id=m.session_id,
        resume_id=m.resume_id,
        overall_score=m.overall_score,
        components=HireScoreComponentsOut(**m.components.model_dump()),
        readiness=ReadinessDetailsOut(**m.readiness.model_dump()),
        benchmark=BenchmarkDetailsOut(**m.benchmark.model_dump()),
        gaps=[SkillGapItemOut(**g.model_dump()) for g in m.gaps],
        recommendations=RecommendationDetailsOut(**m.recommendations.model_dump()),
        career_roadmap=[RoadmapMilestoneOut(**rm.model_dump()) for rm in m.career_roadmap],
        created_at=m.created_at.isoformat(),
        updated_at=m.updated_at.isoformat(),
    )


# ── 1. GET /latest ──────────────────────────────────────────────────────────

@hirescore_router.get(
    "/latest",
    response_model=APIResponse,
    summary="Get latest candidate HireScore summary",
)
async def get_latest_hirescore(
    session_id: Optional[str] = Query(None, description="Optional session ID"),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    model = await get_or_compute_user_hirescore(
        db=db,
        user_id=str(current_user.id),
        session_id=session_id,
        force_recompute=False,
    )
    return APIResponse(
        success=True,
        message="Latest HireScore summary retrieved successfully.",
        data=_format_hirescore_summary_out(model).model_dump(),
    )


# ── 2. POST /recompute ──────────────────────────────────────────────────────

@hirescore_router.post(
    "/recompute",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Force recompute candidate HireScore intelligence",
)
async def recompute_hirescore(
    payload: Optional[RecomputeHireScoreRequest] = None,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    session_id = payload.session_id if payload else None
    model = await get_or_compute_user_hirescore(
        db=db,
        user_id=str(current_user.id),
        session_id=session_id,
        force_recompute=True,
    )
    return APIResponse(
        success=True,
        message="HireScore intelligence recomputed successfully.",
        data=_format_hirescore_summary_out(model).model_dump(),
    )


# ── 3. GET /history ─────────────────────────────────────────────────────────

@hirescore_router.get(
    "/history",
    response_model=APIResponse,
    summary="Get historical candidate HireScore snapshots",
)
async def get_hirescore_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    history = await get_user_hirescore_history(
        db=db,
        user_id=str(current_user.id),
        limit=limit,
    )
    formatted = [
        HireScoreHistoryItemOut(
            id=str(h.id) if h.id else "",
            overall_score=h.overall_score,
            readiness_percentage=h.readiness.readiness_percentage,
            verdict=h.readiness.verdict,
            target_level=h.benchmark.target_level,
            created_at=h.created_at.isoformat(),
        ).model_dump()
        for h in history
    ]
    return APIResponse(
        success=True,
        message="HireScore history retrieved successfully.",
        data=formatted,
    )


# ── 4. GET /benchmark ───────────────────────────────────────────────────────

@hirescore_router.get(
    "/benchmark",
    response_model=APIResponse,
    summary="Get candidate industry benchmark calibration",
)
async def get_benchmark(
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    model = await get_or_compute_user_hirescore(
        db=db,
        user_id=str(current_user.id),
        force_recompute=False,
    )
    return APIResponse(
        success=True,
        message="Industry benchmark retrieved successfully.",
        data=BenchmarkDetailsOut(**model.benchmark.model_dump()).model_dump(),
    )


# ── 5. GET /gap-analysis ────────────────────────────────────────────────────

@hirescore_router.get(
    "/gap-analysis",
    response_model=APIResponse,
    summary="Get candidate skill gap remediation analysis",
)
async def get_gap_analysis(
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    model = await get_or_compute_user_hirescore(
        db=db,
        user_id=str(current_user.id),
        force_recompute=False,
    )
    gaps_out = [SkillGapItemOut(**g.model_dump()).model_dump() for g in model.gaps]
    return APIResponse(
        success=True,
        message="Skill gap analysis retrieved successfully.",
        data=gaps_out,
    )


# ── 6. GET /recommendations ─────────────────────────────────────────────────

@hirescore_router.get(
    "/recommendations",
    response_model=APIResponse,
    summary="Get personalized career recommendations",
)
async def get_recommendations(
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    model = await get_or_compute_user_hirescore(
        db=db,
        user_id=str(current_user.id),
        force_recompute=False,
    )
    return APIResponse(
        success=True,
        message="Recommendations retrieved successfully.",
        data=RecommendationDetailsOut(**model.recommendations.model_dump()).model_dump(),
    )


# ── 7. GET /career-roadmap ──────────────────────────────────────────────────

@hirescore_router.get(
    "/career-roadmap",
    response_model=APIResponse,
    summary="Get adaptive 6-week career roadmap",
)
async def get_career_roadmap(
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    model = await get_or_compute_user_hirescore(
        db=db,
        user_id=str(current_user.id),
        force_recompute=False,
    )
    roadmap_out = [RoadmapMilestoneOut(**rm.model_dump()).model_dump() for rm in model.career_roadmap]
    return APIResponse(
        success=True,
        message="Career roadmap retrieved successfully.",
        data=roadmap_out,
    )

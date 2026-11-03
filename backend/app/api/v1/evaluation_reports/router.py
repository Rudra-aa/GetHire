"""
app/api/v1/evaluation_reports/router.py
---------------------------------------
REST API endpoints for Immutable Evaluation History.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.evaluation_report import EvaluationReportOut
from app.schemas.hirescore import ReadinessDetailsOut
from app.services.evaluation_report_service import (
    generate_evaluation_report,
    get_evaluation_history,
    get_evaluation_report
)

evaluation_reports_router = APIRouter()

def _format_out(m) -> EvaluationReportOut:
    readiness_data = m.readiness.model_dump() if hasattr(m.readiness, "model_dump") else m.readiness
    return EvaluationReportOut(
        id=str(m.id),
        candidate_id=m.candidate_id,
        evaluation_number=m.evaluation_number,
        assessment_session_id=m.assessment_session_id,
        interview_session_id=m.interview_session_id,
        assessment_score=m.assessment_score,
        interview_score=m.interview_score,
        technical_accuracy=m.technical_accuracy,
        concept_coverage=m.concept_coverage,
        problem_solving=m.problem_solving,
        communication=m.communication,
        completeness=m.completeness,
        facesense_score=m.facesense_score,
        voicesense_score=m.voicesense_score,
        hirescore=m.hirescore,
        readiness=ReadinessDetailsOut(**readiness_data),
        strengths=m.strengths,
        weaknesses=m.weaknesses,
        recommendations=m.recommendations,
        created_at=m.created_at,
        updated_at=m.updated_at
    )

@evaluation_reports_router.post("/generate", response_model=APIResponse, summary="Generate Evaluation Report")
async def generate_report(current_user: UserModel = Depends(get_current_active_user)):
    db = mongo_manager.get_database()
    report = await generate_evaluation_report(db, str(current_user.id))
    if not report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Cannot generate report. Ensure you have completed both an Assessment and an Interview."}
        )
    return APIResponse(
        success=True,
        message="Evaluation Report generated successfully.",
        data=_format_out(report).model_dump()
    )

@evaluation_reports_router.get("/history", response_model=APIResponse, summary="Get Evaluation History")
async def get_history(
    limit: int = Query(default=50, ge=1, le=100, description="Max history items"),
    current_user: UserModel = Depends(get_current_active_user),
):
    db = mongo_manager.get_database()
    history = await get_evaluation_history(db, str(current_user.id), limit=limit)
    return APIResponse(
        success=True,
        message="Evaluation history retrieved successfully.",
        data=[_format_out(h).model_dump() for h in history]
    )

@evaluation_reports_router.get("/session/{session_id}", response_model=APIResponse, summary="Get Evaluation Report by Interview Session ID")
async def get_report_by_session_id(
    session_id: str = Path(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID"),
    current_user: UserModel = Depends(get_current_active_user),
):
    db = mongo_manager.get_database()
    is_admin = current_user.role == "admin"
    report = await get_evaluation_report(db, str(current_user.id), session_id, is_admin=is_admin)
    if not report:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Evaluation Report not found for session."})
    return APIResponse(
        success=True,
        message="Report retrieved successfully.",
        data=_format_out(report).model_dump()
    )

@evaluation_reports_router.get("/{report_id}", response_model=APIResponse, summary="Get exact Evaluation Report")
async def get_report_by_id(
    report_id: str = Path(..., pattern=r"^[0-9a-fA-F]{24}$", description="Evaluation Report 24-hex ObjectId"),
    current_user: UserModel = Depends(get_current_active_user),
):
    db = mongo_manager.get_database()
    is_admin = current_user.role == "admin"
    report = await get_evaluation_report(db, str(current_user.id), report_id, is_admin=is_admin)
    if not report:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Evaluation Report not found."})
    return APIResponse(
        success=True,
        message="Report retrieved successfully.",
        data=_format_out(report).model_dump()
    )

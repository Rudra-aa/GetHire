"""
app/api/v1/evaluations/router.py
--------------------------------
REST API endpoints for Phase 4: Evaluation Engine.
Provides single-question evaluation, session batch evaluation, and rubric metrics retrieval.
"""

from __future__ import annotations

from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.evaluation import EvaluationModel
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.evaluation import (
    BatchEvaluateSessionRequest,
    BatchEvaluationResponseData,
    DimensionScoreOut,
    EvaluateAnswerRequest,
    EvaluationOut,
    EvaluationScoresOut,
    FollowUpRecommendationOut,
)
from app.services.evaluation_service import (
    evaluate_and_store_answer,
    evaluate_session_all_answers,
    get_session_evaluations,
)

evaluations_router = APIRouter()


def _format_evaluation_out(ev: EvaluationModel) -> EvaluationOut:
    scores = ev.scores
    return EvaluationOut(
        id=str(ev.id),
        session_id=ev.session_id,
        question_id=ev.question_id,
        answer_id=ev.answer_id,
        user_id=ev.user_id,
        overall_score=ev.overall_score,
        scores=EvaluationScoresOut(
            overall=scores.overall,
            technical_accuracy=DimensionScoreOut(**scores.technical_accuracy.model_dump()),
            concept_coverage=DimensionScoreOut(**scores.concept_coverage.model_dump()),
            problem_solving=DimensionScoreOut(**scores.problem_solving.model_dump()),
            communication=DimensionScoreOut(**scores.communication.model_dump()),
            completeness=DimensionScoreOut(**scores.completeness.model_dump()),
            confidence=DimensionScoreOut(**scores.confidence.model_dump()) if scores.confidence else None,
            presence=DimensionScoreOut(**scores.presence.model_dump()) if scores.presence else None,
        ),
        strengths=ev.strengths,
        weaknesses=ev.weaknesses,
        recommended_improvements=ev.recommended_improvements,
        follow_up=FollowUpRecommendationOut(**ev.follow_up.model_dump()),
        rubric_snapshot=ev.rubric_snapshot,
        created_at=ev.created_at.isoformat(),
        updated_at=ev.updated_at.isoformat(),
    )


# ── POST /api/v1/evaluations ────────────────────────────────────────────────

@evaluations_router.post(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate an interview answer",
)
async def evaluate_answer(
    payload: EvaluateAnswerRequest,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    eval_result = await evaluate_and_store_answer(
        db=db,
        session_id=payload.session_id,
        question_id=payload.question_id,
        user_id=user_id,
        answer_text_override=payload.answer_text,
    )

    data = _format_evaluation_out(eval_result)
    return APIResponse(
        success=True,
        message="Answer evaluated successfully.",
        data=data.model_dump(),
    )


# ── POST /api/v1/evaluations/session/{session_id}/evaluate-all ──────────────

@evaluations_router.post(
    "/session/{session_id}/evaluate-all",
    response_model=APIResponse,
    summary="Batch evaluate all answers in an interview session",
)
async def evaluate_session_all(
    session_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    evals, avg_overall, avg_dims = await evaluate_session_all_answers(
        db=db,
        session_id=session_id,
        user_id=user_id,
    )

    formatted_evals = [_format_evaluation_out(e) for e in evals]
    data = BatchEvaluationResponseData(
        session_id=session_id,
        overall_interview_score=avg_overall,
        total_evaluated=len(formatted_evals),
        average_dimensions=avg_dims,
        evaluations=formatted_evals,
    )

    return APIResponse(
        success=True,
        message="Session batch evaluation completed.",
        data=data.model_dump(),
    )


# ── GET /api/v1/evaluations/session/{session_id} ────────────────────────────

@evaluations_router.get(
    "/session/{session_id}",
    response_model=APIResponse,
    summary="Retrieve all evaluations for an interview session",
)
async def get_session_evaluations_endpoint(
    session_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    evals = await get_session_evaluations(db, session_id, user_id)
    formatted_evals = [_format_evaluation_out(e) for e in evals]

    avg_overall = int(round(sum(e.overall_score for e in evals) / len(evals))) if evals else 0
    avg_dims = {
        "technical_accuracy": int(round(sum(e.scores.technical_accuracy.score for e in evals) / len(evals))) if evals else 0,
        "concept_coverage": int(round(sum(e.scores.concept_coverage.score for e in evals) / len(evals))) if evals else 0,
        "problem_solving": int(round(sum(e.scores.problem_solving.score for e in evals) / len(evals))) if evals else 0,
        "communication": int(round(sum(e.scores.communication.score for e in evals) / len(evals))) if evals else 0,
        "completeness": int(round(sum(e.scores.completeness.score for e in evals) / len(evals))) if evals else 0,
    }

    data = BatchEvaluationResponseData(
        session_id=session_id,
        overall_interview_score=avg_overall,
        total_evaluated=len(formatted_evals),
        average_dimensions=avg_dims,
        evaluations=formatted_evals,
    )

    return APIResponse(
        success=True,
        message="Session evaluations retrieved.",
        data=data.model_dump(),
    )


# ── GET /api/v1/evaluations/{id} ────────────────────────────────────────────

@evaluations_router.get(
    "/{evaluation_id}",
    response_model=APIResponse,
    summary="Retrieve an evaluation by ID",
)
async def get_evaluation_by_id(
    evaluation_id: str,
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    if not ObjectId.is_valid(evaluation_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid evaluation ID format.", "errors": [{"code": "INVALID_ID"}]},
        )

    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    doc = await db["evaluations"].find_one({"_id": ObjectId(evaluation_id), "user_id": user_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Evaluation record not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    eval_model = EvaluationModel(**doc)
    return APIResponse(
        success=True,
        message="Evaluation retrieved.",
        data=_format_evaluation_out(eval_model).model_dump(),
    )

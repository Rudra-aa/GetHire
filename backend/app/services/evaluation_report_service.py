"""
app/services/evaluation_report_service.py
-----------------------------------------
Service for Immutable Evaluation History.
Combines an Assessment Attempt and an Interview Session into a finalized Evaluation Report.
"""

from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.core.logging import get_logger
from app.models.evaluation_report import EvaluationReportModel
from app.models.hirescore import ReadinessDetails
from app.services.hire_score_engine import calculate_hirescore_components, compute_composite_hirescore
from app.services.readiness_engine import evaluate_candidate_readiness
from app.services.evaluation_service import get_session_evaluations
from app.models.resume import ResumeModel

logger = get_logger(__name__)

async def generate_evaluation_report(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> Optional[EvaluationReportModel]:
    """
    Finds the latest completed Assessment and latest completed Interview.
    If both exist, generates an immutable EvaluationReport (or returns existing one for idempotency).
    """
    user_filter = {"$in": [str(user_id), ObjectId(user_id)]} if ObjectId.is_valid(user_id) else str(user_id)

    # 1. Fetch latest completed Assessment
    assessment = await db["assessment_sessions"].find_one(
        {"user_id": user_filter, "status": "completed"},
        sort=[("completed_at", -1), ("_id", -1)]
    )
    if not assessment:
        assessment = await db["assessment_sessions"].find_one(
            {"user_id": user_filter, "score": {"$exists": True, "$gt": 0}},
            sort=[("completed_at", -1), ("_id", -1)]
        )
    
    # 2. Fetch latest completed Interview
    interview = await db["interview_sessions"].find_one(
        {"user_id": user_filter, "status": "completed"},
        sort=[("completed_at", -1), ("_id", -1)]
    )

    if not assessment or not interview:
        return None  # Both components are required to form a full report

    assessment_session_id = str(assessment["_id"])
    interview_session_id = str(interview["_id"]) if "_id" in interview else interview.get("session_id", "")

    # 3. Idempotency Check
    existing_report_doc = await db["evaluation_reports"].find_one({
        "candidate_id": str(user_id),
        "assessment_session_id": assessment_session_id,
        "interview_session_id": interview_session_id
    })
    
    if existing_report_doc:
        return EvaluationReportModel(**existing_report_doc)

    # 4. Generate New Report - Calculate aggregated snapshot scores
    
    # Fetch interview evaluations to aggregate dimensions
    evaluations = await get_session_evaluations(db, interview_session_id, str(user_id))
    
    # Check if we have evaluations, otherwise we cannot build the report correctly
    if not evaluations:
        logger.warning(f"No answer-level evaluations found for interview {interview_session_id}. Please ensure interview is evaluated first.")
        # Attempt auto-evaluate here could be done, but keeping it decoupled for safety
        return None

    # Fetch resume for hirescore pipeline
    resume_doc = await db["resumes"].find_one({"user_id": user_filter}, sort=[("created_at", -1)])
    resume = ResumeModel(**resume_doc) if resume_doc else None

    # Use HireScore Engine functions for consistent snapshot calculation
    components = calculate_hirescore_components(
        evaluations=evaluations,
        resume=resume,
        facesense_doc=None, # Optionally attach if needed
        assessment_doc=assessment
    )
    overall_hirescore = compute_composite_hirescore(components)
    readiness = evaluate_candidate_readiness(overall_hirescore, components, evaluations)

    # Gather Strengths & Weaknesses up to a limit
    strengths_set = set()
    weaknesses_set = set()
    for e in evaluations:
        for s in e.strengths: strengths_set.add(s)
        for w in e.weaknesses: weaknesses_set.add(w)
    
    # Determine evaluation_number
    history_count = await db["evaluation_reports"].count_documents({"candidate_id": str(user_id)})
    evaluation_number = history_count + 1

    # Extract single snapshot metrics
    avg_interview = int(round(sum(e.overall_score for e in evaluations) / len(evaluations))) if evaluations else 0
    assessment_score = int(round(assessment.get("score", 0)))

    report_obj = EvaluationReportModel(
        candidate_id=str(user_id),
        evaluation_number=evaluation_number,
        assessment_session_id=assessment_session_id,
        interview_session_id=interview_session_id,
        assessment_score=assessment_score,
        interview_score=avg_interview,
        technical_accuracy=components.technical_accuracy,
        concept_coverage=components.concept_coverage,
        problem_solving=components.problem_solving,
        communication=components.communication,
        completeness=components.star_structure,
        hirescore=overall_hirescore,
        readiness=readiness,
        strengths=list(strengths_set)[:5],
        weaknesses=list(weaknesses_set)[:5],
        recommendations=[], # Can be populated from gap analyzer if needed
    )

    doc_to_insert = report_obj.model_dump(by_alias=True, exclude={"id"})
    result = await db["evaluation_reports"].insert_one(doc_to_insert)
    report_obj.id = result.inserted_id

    logger.info(f"[EVALUATION_REPORT_GENERATED] Candidate {user_id} - Report #{evaluation_number}")
    
    return report_obj

async def get_evaluation_history(
    db: AsyncIOMotorDatabase,
    user_id: str,
    limit: int = 50
) -> List[EvaluationReportModel]:
    """Retrieve immutable evaluation history sorted newest first."""
    cursor = db["evaluation_reports"].find({"candidate_id": str(user_id)}).sort("evaluation_number", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [EvaluationReportModel(**d) for d in docs]

async def get_evaluation_report(
    db: AsyncIOMotorDatabase,
    user_id: str,
    report_id: str
) -> Optional[EvaluationReportModel]:
    """Retrieve exact immutable evaluation snapshot."""
    doc = await db["evaluation_reports"].find_one({"_id": ObjectId(report_id), "candidate_id": str(user_id)})
    return EvaluationReportModel(**doc) if doc else None

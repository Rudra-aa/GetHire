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
    interview_session_id: Optional[str] = None,
) -> Optional[EvaluationReportModel]:
    """
    Generates an immutable EvaluationReport for the specified or latest completed interview session.
    A combined report requires BOTH a completed Technical Assessment and a completed Interview Session.
    If interview_session_id is provided without an assessment, generates an explicitly labeled interview-only report.
    """
    user_filter = {"$in": [str(user_id), ObjectId(user_id)]} if ObjectId.is_valid(user_id) else str(user_id)

    # 1. Fetch latest completed Assessment
    assessment = await db["assessment_sessions"].find_one(
        {"user_id": user_filter, "status": "completed"},
        sort=[("completed_at", -1), ("_id", -1)]
    )

    # 2. Fetch target or latest completed Interview
    interview = None
    if interview_session_id:
        queries = []
        if ObjectId.is_valid(interview_session_id):
            queries.append({"_id": ObjectId(interview_session_id)})
        queries.append({"session_id": interview_session_id})
        queries.append({"id": interview_session_id})
        interview = await db["interview_sessions"].find_one({
            "user_id": user_filter,
            "status": "completed",
            "$or": queries
        })
    else:
        interview = await db["interview_sessions"].find_one(
            {"user_id": user_filter, "status": "completed"},
            sort=[("completed_at", -1), ("updated_at", -1), ("_id", -1)]
        )

    if not interview:
        return None  # An interview session must be completed

    is_interview_only = assessment is None
    if not interview_session_id and is_interview_only:
        # A combined report generation requires BOTH completed components
        return None

    assessment_session_id = str(assessment["_id"]) if assessment else "none"
    interview_session_id = str(interview["_id"]) if "_id" in interview else interview.get("session_id", "")

    # 3. Idempotency Check
    existing_report_doc = await db["evaluation_reports"].find_one({
        "candidate_id": str(user_id),
        "assessment_session_id": assessment_session_id,
        "interview_session_id": interview_session_id,
    })
    
    if existing_report_doc:
        return EvaluationReportModel(**existing_report_doc)

    # 4. Generate New Report - Calculate aggregated snapshot scores
    evaluations = await get_session_evaluations(db, interview_session_id, str(user_id))
    
    # Auto-evaluate session if not evaluated yet
    if not evaluations:
        try:
            from app.services.evaluation_service import evaluate_session_all_answers
            evals, _, _ = await evaluate_session_all_answers(db, interview_session_id, str(user_id))
            evaluations = evals
        except Exception as e:
            logger.warning("Auto evaluation failed in generate_evaluation_report", error=str(e))

    if not evaluations:
        logger.warning(f"No answer-level evaluations could be found or generated for interview {interview_session_id}.")
        return None

    # Fetch resume for hirescore pipeline
    resume_doc = await db["resumes"].find_one({"user_id": user_filter}, sort=[("created_at", -1)])
    resume = ResumeModel(**resume_doc) if resume_doc else None

    # Use HireScore Engine functions for consistent snapshot calculation
    components = calculate_hirescore_components(
        evaluations=evaluations,
        resume=resume,
        facesense_doc=None,
        assessment_doc=assessment
    )

    avg_interview = int(round(sum(e.overall_score for e in evaluations) / len(evaluations))) if evaluations else 0
    assessment_score = int(round(assessment.get("score", 0))) if assessment else 0

    if is_interview_only:
        overall_hirescore = avg_interview
        readiness = evaluate_candidate_readiness(overall_hirescore, components, evaluations)
    else:
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

    # Fetch facesense / visual presentation data if available (coaching section only - does not affect hirescore)
    facesense_doc = await db["facesense_sessions"].find_one({"session_id": interview_session_id})
    if facesense_doc:
        facesense_doc["id"] = str(facesense_doc.get("_id"))
        facesense_doc.pop("_id", None)
    facesense_score = None
    if facesense_doc:
        facesense_score = facesense_doc.get("visual_presentation_score") or facesense_doc.get("overall_facescore")

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
        facesense_score=facesense_score,
        visual_presentation=facesense_doc,
        hirescore=overall_hirescore,
        readiness=readiness,
        strengths=list(strengths_set)[:5],
        weaknesses=list(weaknesses_set)[:5],
        recommendations=[],
    )

    doc_to_insert = report_obj.model_dump(by_alias=True, exclude={"id"})
    result = await db["evaluation_reports"].insert_one(doc_to_insert)
    report_obj.id = result.inserted_id

    logger.info(f"[EVALUATION_REPORT_GENERATED] Candidate {user_id} - Report #{evaluation_number} (InterviewOnly={is_interview_only})")
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
    report_id: str,
    is_admin: bool = False,
) -> Optional[EvaluationReportModel]:
    """Retrieve exact immutable evaluation snapshot ensuring candidate ownership or admin access."""
    user_filter = {"$in": [str(user_id), ObjectId(user_id)]} if ObjectId.is_valid(user_id) else str(user_id)

    queries = []
    if ObjectId.is_valid(report_id):
        queries.append({"_id": ObjectId(report_id)})
    queries.append({"interview_session_id": report_id})
    queries.append({"id": report_id})

    query: Dict[str, Any] = {"$or": queries}
    if not is_admin:
        query["candidate_id"] = str(user_id)

    doc = await db["evaluation_reports"].find_one(query)
    if doc:
        if not doc.get("visual_presentation") and doc.get("interview_session_id"):
            fs_doc = await db["facesense_sessions"].find_one({"session_id": doc["interview_session_id"]})
            if fs_doc:
                fs_doc["id"] = str(fs_doc.get("_id"))
                fs_doc.pop("_id", None)
                doc["visual_presentation"] = fs_doc
                if not doc.get("facesense_score"):
                    doc["facesense_score"] = fs_doc.get("visual_presentation_score") or fs_doc.get("overall_facescore")
        return EvaluationReportModel(**doc)

    # If not found directly, check if report_id matches a completed interview session for this user
    sess_queries = []
    if ObjectId.is_valid(report_id):
        sess_queries.append({"_id": ObjectId(report_id)})
    sess_queries.append({"session_id": report_id})
    sess_queries.append({"id": report_id})

    sess_query: Dict[str, Any] = {
        "status": "completed",
        "$or": sess_queries
    }
    if not is_admin:
        sess_query["user_id"] = user_filter

    sess_doc = await db["interview_sessions"].find_one(sess_query)
    if not sess_doc:
        # Not a valid completed interview session for this user -> Return None (404)
        return None

    # Target session belongs to user and is completed -> attempt to generate evaluation report
    target_sid = str(sess_doc.get("_id") or sess_doc.get("session_id") or report_id)
    report = await generate_evaluation_report(db, str(sess_doc["user_id"]), interview_session_id=target_sid)
    if report:
        alt_ids = {report_id, target_sid, str(sess_doc.get("_id")), sess_doc.get("session_id")}
        if str(report.id) in alt_ids or report.interview_session_id in alt_ids:
            return report
    return None

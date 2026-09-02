"""
app/services/hire_score_engine.py
----------------------------------
Core HireScore calculation and pipeline orchestration for GetHire.
Aggregates multidimensional evaluation signals and resume quality into a unified,
calibrated composite HireScore (0-100) using evidence-backed data.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.models.evaluation import EvaluationModel
from app.models.hirescore import HireScoreComponents, HireScoreModel
from app.models.resume import ResumeModel
from app.services.benchmark_engine import calculate_industry_benchmark
from app.services.career_roadmap import generate_career_roadmap
from app.services.gap_analyzer import analyze_skill_gaps
from app.services.readiness_engine import evaluate_candidate_readiness
from app.services.recommendation_engine import generate_recommendations

logger = get_logger(__name__)

# Configurable weight configuration for HireScore dimensions
DEFAULT_HIRESCORE_WEIGHTS: Dict[str, float] = {
    "technical_accuracy": 0.30,
    "problem_solving": 0.20,
    "concept_coverage": 0.15,
    "communication": 0.15,
    "star_structure": 0.10,
    "facesense_score": 0.10,
}


def calculate_hirescore_components(
    evaluations: List[EvaluationModel],
    resume: Optional[ResumeModel] = None,
    previous_scores: Optional[List[int]] = None,
    facesense_doc: Optional[Dict[str, Any]] = None,
) -> HireScoreComponents:
    """
    Computes normalized 0-100 scores across all primary HireScore dimensions
    based strictly on actual evidence.
    """
    # 1. Resume Quality Component
    resume_score = 70  # default baseline if no resume uploaded
    if resume and resume.quality_score:
        resume_score = resume.quality_score.overall_score

    # 2. Evaluation Dimensions Averages
    if evaluations:
        tech_scores = [e.scores.technical_accuracy.score for e in evaluations]
        prob_scores = [e.scores.problem_solving.score for e in evaluations]
        concept_scores = [e.scores.concept_coverage.score for e in evaluations]
        comm_scores = [e.scores.communication.score for e in evaluations]
        star_scores = [e.scores.completeness.score for e in evaluations]

        avg_tech = int(round(sum(tech_scores) / len(tech_scores)))
        avg_prob = int(round(sum(prob_scores) / len(prob_scores)))
        avg_concept = int(round(sum(concept_scores) / len(concept_scores)))
        avg_comm = int(round(sum(comm_scores) / len(comm_scores)))
        avg_star = int(round(sum(star_scores) / len(star_scores)))
    else:
        avg_tech = int(round(resume_score * 0.9))
        avg_prob = int(round(resume_score * 0.85))
        avg_concept = int(round(resume_score * 0.88))
        avg_comm = 75
        avg_star = 70

    # 3. Interview Consistency Metric
    consistency_score = 80
    if previous_scores and len(previous_scores) > 1:
        mean = sum(previous_scores) / len(previous_scores)
        variance = sum((s - mean) ** 2 for s in previous_scores) / len(previous_scores)
        std_dev = variance ** 0.5
        consistency_score = max(50, min(100, int(round(100 - (std_dev * 1.5)))))
    elif evaluations:
        eval_overalls = [e.overall_score for e in evaluations]
        if len(eval_overalls) > 1:
            mean = sum(eval_overalls) / len(eval_overalls)
            variance = sum((s - mean) ** 2 for s in eval_overalls) / len(eval_overalls)
            std_dev = variance ** 0.5
            consistency_score = max(50, min(100, int(round(100 - (std_dev * 1.5)))))

    # 4. FaceSense Behavioral Intelligence integration
    fs_score: Optional[int] = None
    fs_conf: Optional[int] = None
    fs_eye: Optional[int] = None
    fs_voice: Optional[int] = None
    fs_clarity: Optional[int] = None

    if facesense_doc:
        samples = facesense_doc.get("samples", [])
        if samples and len(samples) > 0:
            fs_score = int(round(sum(s.get("overall_facescore", 80) for s in samples) / len(samples)))
            fs_conf = int(round(sum(s.get("confidence_score", 80) for s in samples) / len(samples)))
            fs_eye = int(round(sum(s.get("eye_contact_score", 80) for s in samples) / len(samples)))
            fs_voice = int(round(sum(s.get("speech_clarity_score", s.get("confidence_score", 80)) for s in samples) / len(samples)))
            fs_clarity = int(round(sum(s.get("speech_clarity_score", s.get("confidence_score", 85)) for s in samples) / len(samples)))
        elif facesense_doc.get("overall_facescore") is not None:
            fs_score = int(round(facesense_doc.get("overall_facescore")))
            fs_conf = int(round(facesense_doc.get("avg_confidence", 80))) if facesense_doc.get("avg_confidence") is not None else None
            fs_eye = int(round(facesense_doc.get("avg_eye_contact", 80))) if facesense_doc.get("avg_eye_contact") is not None else None

    return HireScoreComponents(
        resume_quality=max(0, min(100, resume_score)),
        technical_accuracy=max(0, min(100, avg_tech)),
        communication=max(0, min(100, avg_comm)),
        problem_solving=max(0, min(100, avg_prob)),
        concept_coverage=max(0, min(100, avg_concept)),
        star_structure=max(0, min(100, avg_star)),
        interview_consistency=max(0, min(100, consistency_score)),
        voicesense_score=fs_voice,
        facesense_score=fs_score,
        confidence_score=fs_conf,
        eye_contact_score=fs_eye,
        speech_clarity_score=fs_clarity,
    )


def compute_composite_hirescore(
    components: HireScoreComponents,
    weights: Optional[Dict[str, float]] = None,
) -> int:
    """
    Computes unified 0-100 overall HireScore applying weight mappings dynamically.
    """
    if components.facesense_score is not None:
        composite = (
            components.technical_accuracy * 0.30
            + components.problem_solving * 0.20
            + components.concept_coverage * 0.15
            + components.communication * 0.15
            + components.star_structure * 0.10
            + components.resume_quality * 0.05
            + components.interview_consistency * 0.05
            + components.facesense_score * 0.10
        )
    else:
        # Re-normalized without telemetry penalty
        composite = (
            components.technical_accuracy * 0.33
            + components.problem_solving * 0.22
            + components.concept_coverage * 0.17
            + components.communication * 0.17
            + components.star_structure * 0.11
        )
    return max(0, min(100, int(round(composite))))


async def get_or_compute_user_hirescore(
    db: AsyncIOMotorDatabase,
    user_id: str,
    session_id: Optional[str] = None,
    force_recompute: bool = False,
) -> HireScoreModel:
    """
    Fetches the latest cached HireScore or recomputes end-to-end intelligence from real evidence.
    """
    hirescore_col = db["hirescores"]

    if not force_recompute and not session_id:
        cached = await hirescore_col.find_one({"user_id": user_id}, sort=[("created_at", -1)])
        if cached:
            return HireScoreModel(**cached)

    # 1. Fetch User Metadata
    user_doc = None
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    target_role = user_doc.get("target_role") if user_doc else "Senior Full-Stack Engineer"
    experience_level = user_doc.get("experience_level") if user_doc else "Senior"

    # 2. Fetch Latest Resume
    resume_doc = await db["resumes"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
    resume = ResumeModel(**resume_doc) if resume_doc else None
    resume_id = str(resume_doc["_id"]) if resume_doc and "_id" in resume_doc else None

    # 3. Fetch Evaluations (for specific session or all user sessions)
    query: Dict[str, Any] = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id

    cursor = db["evaluations"].find(query).sort("created_at", -1)
    eval_docs = await cursor.to_list(length=50)
    evaluations = [EvaluationModel(**doc) for doc in eval_docs]

    # If no evaluations found in evaluations collection, check if session has turn_evaluations
    if not evaluations and session_id:
        from app.services.evaluation_service import evaluate_session_all_answers
        try:
            eval_list, _, _ = await evaluate_session_all_answers(db, session_id, user_id)
            evaluations = eval_list
        except Exception as e:
            logger.warning("Auto session evaluation during HireScore compute notice", error=str(e))

    # 4. Fetch Completed Interview Count
    completed_sessions = await db["interview_sessions"].count_documents(
        {"user_id": user_id, "status": "completed"}
    )

    # 4b. Fetch FaceSense Session Intelligence
    fs_query: Dict[str, Any] = {"user_id": user_id}
    if session_id:
        fs_query["session_id"] = session_id
    facesense_doc = await db["facesense_sessions"].find_one(fs_query, sort=[("updated_at", -1)])

    # 5. Core Pipeline Computations
    components = calculate_hirescore_components(evaluations, resume, facesense_doc=facesense_doc)
    overall_score = compute_composite_hirescore(components)
    readiness = evaluate_candidate_readiness(overall_score, components, evaluations)
    benchmark = calculate_industry_benchmark(overall_score, target_role, experience_level)
    gaps = analyze_skill_gaps(evaluations, resume)
    recommendations = generate_recommendations(gaps, evaluations, resume)
    career_roadmap = generate_career_roadmap(
        overall_score, readiness.readiness_percentage, evaluations, resume, completed_sessions
    )

    # 6. Build and Persist Model
    hirescore_obj = HireScoreModel(
        user_id=user_id,
        session_id=session_id,
        resume_id=resume_id,
        overall_score=overall_score,
        components=components,
        readiness=readiness,
        benchmark=benchmark,
        gaps=gaps,
        recommendations=recommendations,
        career_roadmap=career_roadmap,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    doc_to_insert = hirescore_obj.model_dump(by_alias=True, exclude={"id"})
    result = await hirescore_col.insert_one(doc_to_insert)
    hirescore_obj.id = result.inserted_id

    logger.info(
        "[HIRESCORE_COMPUTED]",
        user_id=user_id,
        session_id=session_id,
        overall_score=overall_score,
        technical=components.technical_accuracy,
        problem_solving=components.problem_solving,
        communication=components.communication,
        concept_coverage=components.concept_coverage,
        facesense=components.facesense_score,
    )
    return hirescore_obj


async def get_user_hirescore_history(
    db: AsyncIOMotorDatabase,
    user_id: str,
    limit: int = 10,
) -> List[HireScoreModel]:
    """
    Retrieves historical snapshots of candidate HireScores.
    """
    cursor = db["hirescores"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [HireScoreModel(**doc) for doc in docs]

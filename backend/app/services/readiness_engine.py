"""
app/services/readiness_engine.py
---------------------------------
Readiness evaluation and hiring verdict engine for GetHire.
Synthesizes dimensional composite scores and evaluation volume into calibrated
candidate readiness percentiles and definitive hiring recommendations.
"""

from __future__ import annotations

from typing import List
from app.models.evaluation import EvaluationModel
from app.models.hirescore import HireScoreComponents, ReadinessDetails


def evaluate_candidate_readiness(
    overall_hirescore: int,
    components: HireScoreComponents,
    evaluations: List[EvaluationModel],
) -> ReadinessDetails:
    """
    Evaluates interview readiness percentage and assigns hiring verdict.
    """
    # 1. Readiness Percentage Calculation
    # Weighted by HireScore, technical accuracy, and concept coverage
    readiness_raw = (
        overall_hirescore * 0.50
        + components.technical_accuracy * 0.30
        + components.concept_coverage * 0.20
    )
    readiness_percentage = max(0, min(100, int(round(readiness_raw))))

    # 2. Hiring Verdict Determination
    if readiness_percentage >= 88 and components.technical_accuracy >= 85:
        verdict = "Offer Ready"
        summary = "Consistently exceeds standard engineering hiring bars across technical and communication dimensions."
    elif readiness_percentage >= 75 and components.technical_accuracy >= 70:
        verdict = "Hire"
        summary = "Demonstrates solid engineering competency with clear problem decomposition and STAR structure."
    elif readiness_percentage >= 60:
        verdict = "Borderline"
        summary = "Demonstrates good foundational knowledge but needs polish in edge case handling and architectural depth."
    elif readiness_percentage >= 45:
        verdict = "Needs Improvement"
        summary = "Identified gaps in core technical concepts and STAR response structure requiring structured practice."
    else:
        verdict = "Early Stage"
        summary = "Initial evaluation baseline established. Follow the adaptive career roadmap to build core competencies."

    # 3. Calibration Confidence Level
    # Scales with number of evaluated questions and resume depth
    eval_count = len(evaluations)
    if eval_count >= 8:
        confidence = "High"
    elif eval_count >= 3:
        confidence = "Medium"
    else:
        confidence = "Low"

    return ReadinessDetails(
        readiness_percentage=readiness_percentage,
        verdict=verdict,
        confidence_level=confidence,
        summary=summary,
    )

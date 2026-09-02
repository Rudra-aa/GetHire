"""
app/services/resume_scorer.py
-----------------------------
Deterministic Resume Quality Scoring Engine.
Evaluates completeness, technical depth, impact metrics, and structure.
"""

from __future__ import annotations

import re
from typing import List

from app.models.resume import ParsedResumeData, QualityScoreBreakdown

ACTION_VERBS = {
    "architected", "developed", "spearheaded", "engineered", "implemented",
    "optimized", "scaled", "designed", "built", "accelerated", "reduced",
    "increased", "mentored", "orchestrated", "deployed", "refactored"
}


def calculate_resume_quality_score(
    raw_text: str,
    parsed: ParsedResumeData,
    page_count: int = 1,
) -> QualityScoreBreakdown:
    """
    Calculate holistic quality score (0–100) and actionable feedback.
    """
    strengths: List[str] = []
    improvements: List[str] = []

    # 1. Completeness Score (0–100, weight 25%)
    comp_points = 0
    if parsed.personal_info.name and parsed.personal_info.name != "Candidate":
        comp_points += 20
    if parsed.personal_info.email:
        comp_points += 20
    if parsed.personal_info.linkedin or parsed.personal_info.github:
        comp_points += 20
        strengths.append("Professional profile links detected (LinkedIn/GitHub)")
    else:
        improvements.append("Add a LinkedIn or GitHub profile link for recruiter visibility")

    if parsed.experience:
        comp_points += 20
    if parsed.education:
        comp_points += 10
    if parsed.projects:
        comp_points += 10

    completeness_score = min(100, comp_points)

    # 2. Skills Score (0–100, weight 30%)
    skill_count = len(parsed.skills)
    if skill_count >= 12:
        skills_score = 95
        strengths.append(f"Strong technical skill variety ({skill_count} detected skills)")
    elif skill_count >= 8:
        skills_score = 85
        strengths.append(f"Solid core technical skills ({skill_count} skills)")
    elif skill_count >= 4:
        skills_score = 70
        improvements.append("Highlight more technical frameworks and database skills")
    else:
        skills_score = 50
        improvements.append("List specific programming languages, libraries, and cloud platforms")

    # 3. Impact & Quantifiable Metrics Score (0–100, weight 25%)
    # Search for numbers, percentages, dollar signs, performance metrics
    metric_matches = re.findall(
        r"(\b\d+(?:\.\d+)?%\b|\$\d+(?:\.\d+)?[\d,]*|\b\d+x\b|\b\d+(?:\.\d+)?\s*(?:k|m|ms|sec|users|clients|requests(?:/sec)?|rps|uptime)\b)",
        raw_text,
        re.IGNORECASE,
    )
    metric_count = len(metric_matches)

    if metric_count >= 4:
        impact_score = 95
        strengths.append("Exceptional use of quantifiable outcomes and performance metrics")
    elif metric_count >= 2:
        impact_score = 80
        strengths.append("Good inclusion of measurable results in work experience")
    elif metric_count >= 1:
        impact_score = 70
        improvements.append("Quantify achievements (e.g. 'reduced latency by 35%', 'managed 10k users')")
    else:
        impact_score = 50
        improvements.append("Add measurable metrics to demonstrate the direct impact of your work")

    # 4. Structure & Action Verbs (0–100, weight 20%)
    words_lower = set(re.findall(r"\b[a-z]+\b", raw_text.lower()))
    found_action_verbs = words_lower.intersection(ACTION_VERBS)

    struct_points = 50
    if len(found_action_verbs) >= 6:
        struct_points += 30
        strengths.append("Active, outcome-driven action verbs across role descriptions")
    elif len(found_action_verbs) >= 3:
        struct_points += 20
    else:
        improvements.append("Start bullet points with strong action verbs (e.g., 'Spearheaded', 'Architected')")

    if page_count in (1, 2):
        struct_points += 20
    else:
        improvements.append("Keep resume concise within 1-2 pages")

    structure_score = min(100, struct_points)

    # Calculate weighted overall score
    overall = int(
        (completeness_score * 0.25) +
        (skills_score * 0.30) +
        (impact_score * 0.25) +
        (structure_score * 0.20)
    )
    overall_score = max(30, min(98, overall))

    return QualityScoreBreakdown(
        overall_score=overall_score,
        completeness_score=completeness_score,
        skills_score=skills_score,
        impact_score=impact_score,
        structure_score=structure_score,
        strengths=strengths[:4],
        improvements=improvements[:4],
    )

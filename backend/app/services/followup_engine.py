"""
app/services/followup_engine.py
-------------------------------
Adaptive Follow-up Recommendation Engine for GetHire.
Determines whether a candidate requires probing follow-up questions
based on concept coverage gaps and technical ambiguity.
"""

from __future__ import annotations

from typing import List, Optional

from app.models.evaluation import FollowUpRecommendation
from app.models.interview import InterviewQuestion
from app.services.keyword_engine import KeywordMatchResult
from app.services.rubric_engine import RubricEvaluationResult


def determine_followup_recommendation(
    question: InterviewQuestion,
    keyword_res: KeywordMatchResult,
    rubric_res: RubricEvaluationResult,
    word_count: int,
) -> FollowUpRecommendation:
    """
    Generate targeted follow-up recommendation if concepts were missing or weak.
    """
    missing = keyword_res.missing_concepts
    tech_score = rubric_res.technical_accuracy_score
    cat = question.category

    # Case 1: Multiple Missing Core Concepts
    if len(missing) >= 2 and tech_score < 75:
        primary_miss = missing[0]
        reason = f"Candidate did not address core criteria: {', '.join(missing[:2])}."
        if cat == "Technical":
            prompt = f"Can you elaborate on how {primary_miss} functions in production and its impact on performance?"
        elif cat == "Projects":
            prompt = f"In that project, how specifically did you handle {primary_miss} under peak concurrency?"
        else:
            prompt = f"Can you dive deeper into how you approached {primary_miss} during that initiative?"

        return FollowUpRecommendation(
            follow_up_required=True,
            follow_up_reason=reason,
            suggested_follow_up=prompt,
        )

    # Case 2: Short Answer with 1 Missing Concept
    if len(missing) == 1 and (word_count < 45 or tech_score < 70):
        miss = missing[0]
        reason = f"Brief explanation missed addressing '{miss}'."
        prompt = f"Could you walk through how you would optimize or implement {miss} in that scenario?"
        return FollowUpRecommendation(
            follow_up_required=True,
            follow_up_reason=reason,
            suggested_follow_up=prompt,
        )

    # Case 3: High Technical Rigor / Answer is Complete
    if tech_score >= 80 and len(missing) == 0:
        # Advanced probe for staff-level candidates
        prompt = "That covers the fundamentals well. How would your architecture change if you had to support 100x traffic across multi-region deployments?"
        return FollowUpRecommendation(
            follow_up_required=False,
            follow_up_reason="Candidate provided comprehensive coverage of expected criteria.",
            suggested_follow_up=prompt,
        )

    # Case 4: Marginal / Borderline Answer
    if tech_score < 65:
        return FollowUpRecommendation(
            follow_up_required=True,
            follow_up_reason="Answer lacked architectural detail and trade-off considerations.",
            suggested_follow_up="Can you explain the main technical tradeoffs you considered and why you selected that specific approach?",
        )

    return FollowUpRecommendation(
        follow_up_required=False,
        follow_up_reason="Concept coverage meets baseline expectations.",
        suggested_follow_up=None,
    )

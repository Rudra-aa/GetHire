"""
app/services/recommendation_engine.py
--------------------------------------
Actionable career recommendation engine for GetHire.
Generates tailored daily tasks, weekly goals, practice prompts, resume improvements,
and architecture project suggestions derived directly from evaluated weaknesses.
"""

from __future__ import annotations

from typing import List, Optional
from app.models.evaluation import EvaluationModel
from app.models.hirescore import RecommendationDetails, SkillGapItem
from app.models.resume import ResumeModel


def generate_recommendations(
    gaps: List[SkillGapItem],
    evaluations: List[EvaluationModel],
    resume: Optional[ResumeModel] = None,
) -> RecommendationDetails:
    """
    Synthesizes detected skill gaps and evaluation metrics into actionable items.
    """
    daily_tasks: List[str] = []
    weekly_goals: List[str] = []
    practice_questions: List[str] = []
    resume_improvements: List[str] = []
    project_suggestions: List[str] = []

    # 1. Daily Tasks from Top Gaps
    top_gaps = gaps[:3]
    for gap in top_gaps:
        if "System Design" in gap.skill:
            daily_tasks.append("Complete 1 architecture breakdown: Rate Limiter using Token Bucket algorithm.")
            practice_questions.append("Design a distributed rate limiter supporting 100k requests/sec with Redis.")
        elif "Redis" in gap.skill or "Caching" in gap.skill:
            daily_tasks.append("Review Cache-Aside vs Write-Through strategies and TTL invalidation.")
            practice_questions.append("How would you handle cache stampede and thundering herd problem in high concurrency?")
        elif "Docker" in gap.skill:
            daily_tasks.append("Refactor a multi-stage Dockerfile to minimize image layer sizes below 100MB.")
        elif "Testing" in gap.skill:
            daily_tasks.append("Write unit & integration test suites testing failure boundaries for payment checkout.")
            practice_questions.append("Explain how you mock third-party asynchronous webhooks reliably in test pipelines.")
        elif "Concurrency" in gap.skill:
            daily_tasks.append("Implement a worker pool pattern handling backpressure without memory leaks.")
            practice_questions.append("How do you detect and resolve race conditions in asynchronous event processing?")

    if not daily_tasks:
        daily_tasks.append("Conduct one 15-minute simulated mock interview on System Architecture.")
        daily_tasks.append("Review STAR format responses for previous project milestone successes.")

    # 2. Weekly Goals
    weekly_goals.append("Complete 3 adaptive AI mock interview sessions targeting core engineering competencies.")
    weekly_goals.append("Achieve a technical accuracy score of >= 80% on follow-up architectural questions.")
    weekly_goals.append("Refine top 3 resume bullet points using quantitative Action-Impact metrics.")

    # 3. Resume Improvements from Resume Scorer
    if resume and resume.quality_score:
        if resume.quality_score.impact_score < 75:
            resume_improvements.append("Quantify project bullet points with explicit metrics (e.g., 'reduced p99 latency by 34%').")
        if resume.quality_score.skills_score < 75:
            resume_improvements.append("Group technical skills into clear categories: Languages, Distributed Systems, Cloud & Tooling.")
        if resume.quality_score.structure_score < 75:
            resume_improvements.append("Refine visual hierarchy and section headers for clean ATS scanning.")
    if not resume_improvements:
        resume_improvements.append("Ensure target role technologies (Redis, Docker, Distributed Caching) are highlighted in recent experience.")

    # 4. Project Suggestions
    project_suggestions.append("Build a high-throughput event processing pipeline using Redis Streams and asynchronous workers.")
    project_suggestions.append("Design an end-to-end telemetry observability service with Prometheus and distributed tracing.")

    return RecommendationDetails(
        daily_tasks=daily_tasks[:4],
        weekly_goals=weekly_goals[:3],
        practice_questions=practice_questions[:3],
        resume_improvements=resume_improvements[:3],
        project_suggestions=project_suggestions[:2],
    )

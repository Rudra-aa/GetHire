"""
app/services/career_roadmap.py
-------------------------------
Adaptive 6-Week Career Roadmap engine for GetHire.
Constructs a dynamic milestone curriculum that automatically recalibrates
after every resume update and completed interview simulation.
"""

from __future__ import annotations

from typing import List, Optional
from app.models.evaluation import EvaluationModel
from app.models.hirescore import RoadmapMilestone
from app.models.resume import ResumeModel


def generate_career_roadmap(
    hirescore: int,
    readiness_percentage: int,
    evaluations: List[EvaluationModel],
    resume: Optional[ResumeModel] = None,
    total_sessions_completed: int = 0,
) -> List[RoadmapMilestone]:
    """
    Constructs an adaptive 6-week roadmap with dynamic milestone progression statuses.
    """
    has_resume = resume is not None and resume.quality_score is not None
    eval_count = len(evaluations) + total_sessions_completed

    # Determine dynamic active milestone level (1-6)
    if not has_resume:
        current_week = 1
    elif eval_count < 1:
        current_week = 2
    elif eval_count < 3 and hirescore < 70:
        current_week = 3
    elif eval_count < 5 and hirescore < 80:
        current_week = 4
    elif readiness_percentage < 85:
        current_week = 5
    else:
        current_week = 6

    def get_status(week: int) -> str:
        if week < current_week:
            return "completed"
        if week == current_week:
            return "active"
        return "upcoming"

    milestones = [
        RoadmapMilestone(
            week=1,
            title="Resume Intelligence & Baseline Calibration",
            focus_area="Resume & Skills Alignment",
            status=get_status(1),
            deliverables=[
                "Parse and calibrate resume against target engineering role ontology.",
                "Achieve ATS and impact score >= 80/100.",
                "Establish baseline HireScore telemetry.",
            ],
        ),
        RoadmapMilestone(
            week=2,
            title="Core Problem Solving & Concurrency",
            focus_area="Data Structures & Algorithms",
            status=get_status(2),
            deliverables=[
                "Complete 5 algorithmic problem decomposition simulations.",
                "Reinforce time/space complexity analysis under timed conditions.",
                "Zero out communication filler ratio during code walkthroughs.",
            ],
        ),
        RoadmapMilestone(
            week=3,
            title="Production Systems & Hands-on Architecture",
            focus_area="Microservices & Caching",
            status=get_status(3),
            deliverables=[
                "Implement Redis caching and concurrency synchronization patterns.",
                "Structure end-to-end Dockerized services with automated unit test suites.",
                "Complete 2 practice rounds on technical tradeoff justification.",
            ],
        ),
        RoadmapMilestone(
            week=4,
            title="Scalable Distributed System Design",
            focus_area="System Design & Scalability",
            status=get_status(4),
            deliverables=[
                "Design high-throughput distributed systems (Rate Limiters, Message Queues).",
                "Demonstrate mastery of CAP theorem, sharding, and database replication.",
                "Score >= 80% on System Design rubric evaluation.",
            ],
        ),
        RoadmapMilestone(
            week=5,
            title="STAR Behavioral & Leadership Calibration",
            focus_area="STAR Structure & Culture Alignment",
            status=get_status(5),
            deliverables=[
                "Structure 5 leadership stories using Situation-Task-Action-Result methodology.",
                "Refine conflict resolution and project turnaround narratives.",
                "Achieve high composure and clarity in multi-signal assessment.",
            ],
        ),
        RoadmapMilestone(
            week=6,
            title="Full Multimodal Mock Gauntlet & Offer Bar",
            focus_area="Final Comprehensive Assessment",
            status=get_status(6),
            deliverables=[
                "Complete comprehensive 45-minute multi-round technical gauntlet.",
                "Verify HireScore >= 85 and Top Tier industry benchmark.",
                "Receive finalized candidate readiness PDF intelligence report.",
            ],
        ),
    ]

    return milestones

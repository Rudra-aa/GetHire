"""
app/services/gap_analyzer.py
-----------------------------
Skill gap identification and remediation analysis engine for GetHire.
Identifies weak concepts and missing production proficiencies from interview
evaluations and resume technical ontologies, ranking them by severity.
"""

from __future__ import annotations

from typing import Dict, List, Optional
from app.models.evaluation import EvaluationModel
from app.models.hirescore import SkillGapItem
from app.models.resume import ResumeModel

# Core engineering competency ontology catalog
CORE_SKILL_CATALOG: Dict[str, Dict[str, any]] = {
    "System Design": {
        "severity": "Critical",
        "impact_score": 9,
        "learning_hours": 18,
        "reason": "Scalability, data partitioning, and load balancing concepts were omitted during technical answers.",
        "resources": ["Designing Data-Intensive Applications", "System Design Primer", "High Scalability Case Studies"],
    },
    "Distributed Caching (Redis)": {
        "severity": "High",
        "impact_score": 8,
        "learning_hours": 8,
        "reason": "Eviction policies, write-through caching, and cache invalidation strategies require reinforcement.",
        "resources": ["Redis University RU101", "Caching Patterns in Modern Microservices"],
    },
    "Docker & Containerization": {
        "severity": "High",
        "impact_score": 7,
        "learning_hours": 6,
        "reason": "Multi-stage builds, container isolation, and resource constraint orchestration were absent in resume & answers.",
        "resources": ["Docker Deep Dive", "Dockerfile Best Practices for Production"],
    },
    "Kubernetes & Orchestration": {
        "severity": "Medium",
        "impact_score": 6,
        "learning_hours": 14,
        "reason": "Pod lifecycle, Service Meshes, and Ingress routing were not verified in previous sessions.",
        "resources": ["Kubernetes in Action", "CKAD Hands-on Labs"],
    },
    "Automated Testing & TDD": {
        "severity": "High",
        "impact_score": 8,
        "learning_hours": 6,
        "reason": "Unit test coverage, integration mocking, and boundary test validation were not explicitly highlighted.",
        "resources": ["Test-Driven Development by Example", "Pytest & Jest Production Testing Guides"],
    },
    "CI/CD & Deployment Pipelines": {
        "severity": "Medium",
        "impact_score": 6,
        "learning_hours": 5,
        "reason": "Continuous delivery stages, blue-green deployments, and canary rollback mechanisms need review.",
        "resources": ["GitHub Actions Production Workflows", "GitOps Fundamentals"],
    },
    "Concurrency & Asynchronous Patterns": {
        "severity": "Critical",
        "impact_score": 9,
        "learning_hours": 10,
        "reason": "Race condition prevention, thread pools, and event-loop optimization were identified as weak areas.",
        "resources": ["Concurrency in Modern Backends", "AsyncIO and Promise Architecture"],
    },
}


def analyze_skill_gaps(
    evaluations: List[EvaluationModel],
    resume: Optional[ResumeModel] = None,
) -> List[SkillGapItem]:
    """
    Identifies and ranks skill gaps by examining evaluated weaknesses, dimensional scores,
    and missing resume competencies.
    """
    gaps: List[SkillGapItem] = []
    resume_skills = set()
    if resume and resume.parsed_data and resume.parsed_data.skills:
        for skill in resume.parsed_data.skills:
            resume_skills.add(skill.lower())

    # Aggregate evaluation weaknesses, text feedback, and low-scoring dimensions
    weak_dimensions = set()
    eval_text_corpus = ""

    for ev in evaluations:
        if ev.scores.technical_accuracy.score < 80:
            weak_dimensions.add("System Design")
            weak_dimensions.add("Concurrency & Asynchronous Patterns")
        if ev.scores.concept_coverage.score < 80:
            weak_dimensions.add("Distributed Caching (Redis)")
        if ev.scores.completeness.score < 80:
            weak_dimensions.add("Automated Testing & TDD")

        # Combine text feedback
        eval_text_corpus += " ".join(ev.weaknesses + ev.recommended_improvements).lower()

    if "redis" in eval_text_corpus or "cache" in eval_text_corpus or "caching" in eval_text_corpus:
        weak_dimensions.add("Distributed Caching (Redis)")
    if "docker" in eval_text_corpus or "container" in eval_text_corpus:
        weak_dimensions.add("Docker & Containerization")
    if "concurrency" in eval_text_corpus or "lock" in eval_text_corpus or "thread" in eval_text_corpus:
        weak_dimensions.add("Concurrency & Asynchronous Patterns")

    # If no evaluations yet, identify based on missing resume skills
    if not evaluations:
        if not any("redis" in s for s in resume_skills):
            weak_dimensions.add("Distributed Caching (Redis)")
        if not any("docker" in s or "container" in s for s in resume_skills):
            weak_dimensions.add("Docker & Containerization")
        if not any("test" in s or "jest" in s or "pytest" in s for s in resume_skills):
            weak_dimensions.add("Automated Testing & TDD")
        weak_dimensions.add("System Design")

    # Build structured gap items
    for skill_name, catalog in CORE_SKILL_CATALOG.items():
        if skill_name in weak_dimensions:
            gaps.append(
                SkillGapItem(
                    skill=skill_name,
                    severity=catalog["severity"],
                    reason=catalog["reason"],
                    impact_score=catalog["impact_score"],
                    learning_hours=catalog["learning_hours"],
                    recommended_resources=list(catalog["resources"]),
                )
            )

    # Fallback default gap if none triggered
    if not gaps:
        catalog = CORE_SKILL_CATALOG["System Design"]
        gaps.append(
            SkillGapItem(
                skill="System Design",
                severity="Medium",
                reason="Continue polishing multi-region data replication and high throughput messaging.",
                impact_score=6,
                learning_hours=6,
                recommended_resources=list(catalog["resources"]),
            )
        )

    # Sort gaps by impact_score descending
    gaps.sort(key=lambda g: g.impact_score, reverse=True)
    return gaps

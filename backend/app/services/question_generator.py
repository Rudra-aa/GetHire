"""
app/services/question_generator.py
----------------------------------
Deterministic Question Execution Engine for GetHire.
Executes an InterviewPlan blueprint against datasets and structured resume context.
"""

from __future__ import annotations

import random
from typing import List, Optional

from app.models.interview import InterviewQuestion
from app.models.resume import ResumeModel
from app.services.dataset_loader import get_dataset_loader
from app.services.interview_planner import InterviewPlan, QuestionSlot


def _generate_resume_question(slot: QuestionSlot, resume: Optional[ResumeModel]) -> InterviewQuestion:
    """Formulate a resume-contextualized career question."""
    context = slot.context_hint or f"Career history for {slot.target_value}"
    prompt = (
        f"In your work as {slot.target_value}, what was the most significant technical "
        "or architectural challenge you tackled, and what key metrics or tradeoffs guided your decisions?"
    )
    return InterviewQuestion(
        id=f"q_{slot.position}",
        position=slot.position,
        category="Resume-based",
        difficulty=slot.difficulty,
        question_text=prompt,
        context_snippet=context,
        skill_targeted="Architecture & Delivery",
        expected_concepts=["Problem Statement", "Technical Solution", "Impact Metrics", "Key Tradeoffs"],
        source="resume.experience",
    )


def _generate_project_question(slot: QuestionSlot, resume: Optional[ResumeModel]) -> InterviewQuestion:
    """Formulate a deep-dive question for a specific project."""
    context = slot.context_hint or f"Project: {slot.target_value}"
    prompt = (
        f"Regarding your project '{slot.target_value}', can you walk us through the system architecture, "
        "how you handled data flow and state management, and what you would optimize in production today?"
    )
    return InterviewQuestion(
        id=f"q_{slot.position}",
        position=slot.position,
        category="Projects",
        difficulty=slot.difficulty,
        question_text=prompt,
        context_snippet=context,
        skill_targeted="System Architecture",
        expected_concepts=["Component Breakdown", "Data Flow", "Scalability Bottlenecks", "Reliability"],
        source="resume.projects",
    )


def _generate_problem_solving_question(slot: QuestionSlot, target_role: str) -> InterviewQuestion:
    """Formulate an architecture or algorithmic challenge tailored to the target role."""
    ps_bank = [
        (
            f"How would you design a distributed rate limiter for a {target_role} API handling 50,000 requests per second?",
            ["Sliding Window / Token Bucket algorithm", "Redis atomic operations", "Failure fallback", "Latency overhead"],
        ),
        (
            f"Imagine an end-to-end service in {target_role} experiences a sudden 10x latency spike at the 99th percentile. Walk through your debugging strategy.",
            ["APM & Distributed Tracing", "Database slow queries & connection pool", "CPU / Memory profiling", "Network / Cache hits"],
        ),
        (
            f"Design a reliable caching and cache invalidation strategy for a high-traffic {target_role} platform with frequent updates.",
            ["Cache-Aside / Write-Through pattern", "TTL & Stampede prevention", "Event-driven invalidation", "Eventual consistency"],
        ),
    ]
    chosen_prompt, concepts = ps_bank[(slot.position - 1) % len(ps_bank)]

    return InterviewQuestion(
        id=f"q_{slot.position}",
        position=slot.position,
        category="Problem Solving",
        difficulty=slot.difficulty,
        question_text=chosen_prompt,
        context_snippet=f"System Architecture & Problem Solving for {target_role}",
        skill_targeted="System Design",
        expected_concepts=concepts,
        source="system_design",
    )


def _generate_behavioral_question(slot: QuestionSlot) -> InterviewQuestion:
    """Formulate a STAR-method behavioral question."""
    behavioral_bank = [
        (
            "Describe a situation where you had a strong technical disagreement with a team member or lead. How did you resolve it?",
            ["Constructive dialogue", "Data-driven benchmark / POC", "Alignment with project goals", "Team cohesion"],
        ),
        (
            "Tell us about a time when a critical production bug or outage occurred under your watch. How did you respond and prevent recurrence?",
            ["Incident containment", "Root cause analysis (RCA)", "Blameless post-mortem", "Automated regression tests"],
        ),
        (
            "How do you prioritize technical debt versus shipping urgent product features when deadlines are tight?",
            ["Business value prioritization", "Refactoring in increments", "Communicating risks to stakeholders", "Quality standards"],
        ),
    ]
    chosen_prompt, concepts = behavioral_bank[(slot.position - 1) % len(behavioral_bank)]

    return InterviewQuestion(
        id=f"q_{slot.position}",
        position=slot.position,
        category="Behavioral",
        difficulty=slot.difficulty,
        question_text=chosen_prompt,
        context_snippet="Collaboration, delivery, and engineering leadership",
        skill_targeted="Communication & Culture",
        expected_concepts=concepts,
        source="behavioral",
    )


def _generate_technical_question(slot: QuestionSlot) -> InterviewQuestion:
    """Formulate a technical question using DatasetLoader or domain taxonomy."""
    loader = get_dataset_loader()
    skill_name = slot.target_value
    dataset_questions = loader.get_questions_for_skill(skill_name, slot.difficulty)

    if dataset_questions:
        dq = dataset_questions[(slot.position - 1) % len(dataset_questions)]
        return InterviewQuestion(
            id=f"q_{slot.position}",
            position=slot.position,
            category="Technical",
            difficulty=slot.difficulty,
            question_text=dq.question,
            context_snippet=f"Technical assessment: {skill_name} ({slot.difficulty})",
            skill_targeted=skill_name,
            expected_concepts=dq.expected_concepts or dq.keywords or [f"Core {skill_name} principles"],
            source=f"dataset.{skill_name.lower()}",
        )

    # Fallback contextual technical prompt
    fallback_prompt = (
        f"In {skill_name}, can you explain the core execution model, how memory/concurrency is managed, "
        "and what common pitfalls engineers encounter when scaling it?"
    )
    return InterviewQuestion(
        id=f"q_{slot.position}",
        position=slot.position,
        category="Technical",
        difficulty=slot.difficulty,
        question_text=fallback_prompt,
        context_snippet=f"Technical proficiency in {skill_name}",
        skill_targeted=skill_name,
        expected_concepts=[f"{skill_name} fundamentals", "Performance optimization", "Error handling", "Concurrency/Async"],
        source="dataset.fallback",
    )


def generate_questions_from_plan(
    plan: InterviewPlan,
    resume: Optional[ResumeModel] = None,
) -> List[InterviewQuestion]:
    """
    Execute the InterviewPlan blueprint to generate the final list of questions.
    """
    questions: List[InterviewQuestion] = []

    for slot in plan.slots:
        if slot.category == "Resume-based":
            q = _generate_resume_question(slot, resume)
        elif slot.category == "Projects":
            q = _generate_project_question(slot, resume)
        elif slot.category == "Problem Solving":
            q = _generate_problem_solving_question(slot, plan.target_role)
        elif slot.category == "Behavioral":
            q = _generate_behavioral_question(slot)
        else:  # Technical
            q = _generate_technical_question(slot)

        questions.append(q)

    return questions

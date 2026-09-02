"""
app/services/interview_planner.py
---------------------------------
Interview Planning Engine for GetHire.
Computes an immutable, balanced InterviewPlan blueprint from structured resume JSON.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

from app.models.resume import ResumeModel


@dataclass(frozen=True)
class QuestionSlot:
    """Blueprint specification for a single question to be generated."""
    position: int
    category: str  # Technical | Behavioral | Projects | Resume-based | Problem Solving
    difficulty: str  # Easy | Medium | Hard
    target_type: str  # "skill" | "project" | "experience" | "system_design" | "behavioral"
    target_value: str  # e.g. "React", "Project: GetHire", "Company: Stripe"
    context_hint: Optional[str] = None


@dataclass
class InterviewPlan:
    """Complete blueprint returned by InterviewPlanner."""
    target_role: str
    experience_level: str
    interview_type: str
    total_questions: int
    slots: List[QuestionSlot] = field(default_factory=list)
    skills_covered: List[str] = field(default_factory=list)
    projects_covered: List[str] = field(default_factory=list)
    experience_covered: List[str] = field(default_factory=list)


def create_interview_plan(
    resume: Optional[ResumeModel],
    target_role: str = "Fullstack Developer",
    experience_level: str = "mid",
    interview_type: str = "mixed",
    total_questions: int = 10,
) -> InterviewPlan:
    """
    Generate an immutable interview blueprint matching the candidate's career level & resume.
    Never generates random questions.
    """
    total = max(5, min(20, total_questions))
    skills = resume.parsed_data.skills if resume else ["JavaScript", "Python", "SQL"]
    projects = resume.parsed_data.projects if resume else []
    experience = resume.parsed_data.experience if resume else []

    # Difficulty ramp based on experience level
    if experience_level.lower() == "senior":
        diff_ramp = ["Medium", "Medium", "Hard", "Medium", "Hard", "Hard", "Medium", "Hard", "Hard", "Hard"]
    elif experience_level.lower() == "entry":
        diff_ramp = ["Easy", "Easy", "Medium", "Easy", "Medium", "Medium", "Easy", "Medium", "Medium", "Hard"]
    else:  # mid
        diff_ramp = ["Easy", "Medium", "Medium", "Medium", "Hard", "Medium", "Hard", "Medium", "Hard", "Hard"]

    # Fill difficulty ramp up to total_questions
    while len(diff_ramp) < total:
        diff_ramp.append("Medium")
    diff_ramp = diff_ramp[:total]

    slots: List[QuestionSlot] = []
    skills_covered: List[str] = []
    projects_covered: List[str] = []
    experience_covered: List[str] = []

    # Category distribution strategy
    if interview_type.lower() == "technical":
        cat_sequence = ["Resume-based", "Technical", "Technical", "Projects", "Technical", "Problem Solving", "Projects", "Technical", "Problem Solving", "Technical"]
    elif interview_type.lower() == "behavioral":
        cat_sequence = ["Resume-based", "Behavioral", "Projects", "Behavioral", "Resume-based", "Behavioral", "Projects", "Behavioral", "Behavioral", "Behavioral"]
    else:  # mixed (default)
        cat_sequence = ["Resume-based", "Technical", "Technical", "Projects", "Problem Solving", "Technical", "Projects", "Behavioral", "Problem Solving", "Behavioral"]

    # Fill sequence to match requested total
    while len(cat_sequence) < total:
        cat_sequence.append("Technical" if len(cat_sequence) % 2 == 0 else "Behavioral")
    cat_sequence = cat_sequence[:total]

    skill_idx = 0
    proj_idx = 0
    exp_idx = 0

    for i, category in enumerate(cat_sequence):
        pos = i + 1
        diff = diff_ramp[i]

        if category == "Resume-based":
            if experience and exp_idx < len(experience):
                exp_item = experience[exp_idx]
                target_val = f"{exp_item.role} at {exp_item.company}"
                context = f"Work experience as {exp_item.role} at {exp_item.company} ({exp_item.duration or 'recent'})"
                experience_covered.append(exp_item.company)
                exp_idx += 1
            else:
                target_val = f"Career background in {target_role}"
                context = f"Target Role: {target_role}"
            slots.append(QuestionSlot(position=pos, category="Resume-based", difficulty=diff, target_type="experience", target_value=target_val, context_hint=context))

        elif category == "Projects":
            if projects and proj_idx < len(projects):
                p_item = projects[proj_idx]
                target_val = p_item.title
                tech_str = ", ".join(p_item.technologies[:3]) if p_item.technologies else target_role
                context = f"Project '{p_item.title}' built using {tech_str}"
                projects_covered.append(p_item.title)
                proj_idx += 1
            else:
                target_val = f"Production {target_role} Architecture"
                context = f"Hands-on project work in {target_role}"
            slots.append(QuestionSlot(position=pos, category="Projects", difficulty=diff, target_type="project", target_value=target_val, context_hint=context))

        elif category == "Problem Solving":
            target_val = f"Scalability & Algorithm Challenge for {target_role}"
            context = f"System Design & algorithmic problem solving in {target_role}"
            slots.append(QuestionSlot(position=pos, category="Problem Solving", difficulty=diff, target_type="system_design", target_value=target_val, context_hint=context))

        elif category == "Behavioral":
            target_val = "Engineering Collaboration & Incident Response"
            context = "STAR-method scenario on conflict resolution, deadlines, or production outages"
            slots.append(QuestionSlot(position=pos, category="Behavioral", difficulty=diff, target_type="behavioral", target_value=target_val, context_hint=context))

        else:  # Technical
            if skills and skill_idx < len(skills):
                s_name = skills[skill_idx]
                skill_idx += 1
            else:
                s_name = "System Architecture"
            skills_covered.append(s_name)
            target_val = s_name
            context = f"Technical proficiency in {s_name}"
            slots.append(QuestionSlot(position=pos, category="Technical", difficulty=diff, target_type="skill", target_value=target_val, context_hint=context))

    return InterviewPlan(
        target_role=target_role,
        experience_level=experience_level,
        interview_type=interview_type,
        total_questions=total,
        slots=slots,
        skills_covered=list(dict.fromkeys(skills_covered)),
        projects_covered=list(dict.fromkeys(projects_covered)),
        experience_covered=list(dict.fromkeys(experience_covered)),
    )

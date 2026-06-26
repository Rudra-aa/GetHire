"""
question_generator.py
---------------------
Question Selection & Balancing Engine for GetHire.

Re-architected to use DatasetLoader for open/closed dataset-driven architecture.
"""

import random
from dataclasses import dataclass, field
from typing import Optional

from backend.services.dataset_loader import get_loader, DatasetQuestion


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class DifficultyDistribution:
    """
    How many questions to select per difficulty level, per skill.
    """
    easy: int = 2
    medium: int = 2
    hard: int = 1


# ---------------------------------------------------------------------------
# Result models
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class GeneratedQuestion:
    """
    A single question selected for the interview.
    This is the serialization-friendly view of a question.
    """
    id: str
    skill: str
    difficulty: str  # "easy" / "medium" / "hard"
    question: str
    topic: str


@dataclass
class GenerationResult:
    """
    The complete result of a question generation request.
    """
    questions: list[GeneratedQuestion] = field(default_factory=list)
    total: int = 0
    skills_used: list[str] = field(default_factory=list)
    skills_skipped: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Generator
# ---------------------------------------------------------------------------

class QuestionGenerator:
    """
    Stateless question selection engine.
    Queries the file-driven DatasetLoader singleton.
    """

    def __init__(
        self,
        distribution: Optional[DifficultyDistribution] = None,
    ) -> None:
        """
        Initialize with an optional custom difficulty distribution.
        """
        self._distribution = distribution or DifficultyDistribution()
        self.loader = get_loader()

    def generate(
        self,
        skills: list[str],
        *,
        seed: Optional[int] = None,
    ) -> GenerationResult:
        """
        Generate a balanced set of interview questions for the given skills.
        """
        rng = random.Random(seed)  # isolated RNG — thread-safe

        result = GenerationResult()
        seen_questions: set[str] = set()  # lowercase question text for dedup

        for skill in skills:
            skill_questions = self._select_for_skill(skill, rng, seen_questions)

            if skill_questions:
                result.questions.extend(skill_questions)
                result.skills_used.append(skill)
            else:
                result.skills_skipped.append(skill)

        # Final shuffle so questions aren't grouped by skill
        rng.shuffle(result.questions)
        result.total = len(result.questions)

        return result

    def _select_for_skill(
        self,
        skill: str,
        rng: random.Random,
        seen: set[str],
    ) -> list[GeneratedQuestion]:
        """
        Select a balanced set of questions for a single skill.
        """
        selected: list[GeneratedQuestion] = []

        # (difficulty_level, how_many_to_pick)
        tiers: list[tuple[str, int]] = [
            ("easy", self._distribution.easy),
            ("medium", self._distribution.medium),
            ("hard", self._distribution.hard),
        ]

        for difficulty, count in tiers:
            pool: list[DatasetQuestion] = self.loader.get_questions_for_skill(skill, difficulty)

            if not pool:
                continue

            # Filter out already-seen questions before sampling
            available = [q for q in pool if q.question.lower().strip() not in seen]

            # Take min(requested, available) questions
            sample_size = min(count, len(available))
            if sample_size == 0:
                continue

            sampled: list[DatasetQuestion] = rng.sample(available, sample_size)

            for item in sampled:
                seen.add(item.question.lower().strip())
                selected.append(
                    GeneratedQuestion(
                        id=item.id,
                        skill=item.domain,
                        difficulty=item.difficulty,
                        question=item.question,
                        topic=item.topic,
                    )
                )

        return selected

    def validate_skills(self, skills: list[str]) -> tuple[list[str], list[str]]:
        """
        Split a skill list into known and unknown skills.
        """
        available = set(self.loader.get_available_skills())
        valid: list[str] = []
        unknown: list[str] = []

        for skill in skills:
            # Case-insensitive validation check
            match_found = False
            for av in available:
                if av.lower() == skill.lower():
                    valid.append(av)
                    match_found = True
                    break
            if not match_found:
                unknown.append(skill)

        return valid, unknown

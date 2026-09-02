"""
app/services/assessment_engine/mcq_engine.py
---------------------------------------------
Adaptive Technical MCQ Engine for Assessment Engine (Module 2).
Generates skill-targeted MCQs across System Design, Data Structures, Web Frameworks, SQL, and Aptitude.

LOC Constraint: < 300 LOC
Single Responsibility: Adaptive Technical MCQ Question Generation & Scoring
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
import random


SAMPLE_MCQ_BANK: List[Dict[str, Any]] = [
    {
        "id": "mcq_1",
        "category": "System Design",
        "skill": "Distributed Systems",
        "question": "Which strategy best handles read-heavy workloads with strict eventual consistency requirements?",
        "options": [
            "Write-through caching with read replicas",
            "Synchronous multi-region replication",
            "Pessimistic database locking",
            "Single primary instance with no cache",
        ],
        "correct_answer": 0,
        "explanation": "Read replicas with write-through caching allow scaling reads horizontally with eventual consistency.",
    },
    {
        "id": "mcq_2",
        "category": "Data Structures",
        "skill": "Algorithms",
        "question": "What is the average time complexity of searching in a balanced Hash Table?",
        "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        "correct_answer": 0,
        "explanation": "Hash tables provide O(1) average time complexity for key lookups.",
    },
    {
        "id": "mcq_3",
        "category": "Web Engineering",
        "skill": "Backend APIs",
        "question": "What HTTP status code should be returned when a client presents invalid JWT authentication claims?",
        "options": ["401 Unauthorized", "403 Forbidden", "400 Bad Request", "404 Not Found"],
        "correct_answer": 0,
        "explanation": "HTTP 401 Unauthorized indicates missing or invalid authentication credentials.",
    },
    {
        "id": "mcq_4",
        "category": "Database & SQL",
        "skill": "PostgreSQL / MongoDB",
        "question": "Which database index structure is optimal for B-tree range queries on numerical columns?",
        "options": ["B-Tree Index", "Hash Index", "GIN Index", "Full-Text Index"],
        "correct_answer": 0,
        "explanation": "B-Tree indexes support efficient equality and range queries (>, <, BETWEEN).",
    },
]


class MCQEngine:
    """Generates adaptive technical assessment MCQs and evaluates responses."""

    def generate_assessment_quiz(self, target_role: str, experience_level: str) -> List[Dict[str, Any]]:
        """Generates a curated set of technical MCQs for candidate assessment."""
        questions = []
        for q in SAMPLE_MCQ_BANK:
            item = dict(q)
            # Remove correct_answer index from client-facing payload for security
            item.pop("correct_answer", None)
            questions.append(item)
        return questions

    def evaluate_quiz_answers(
        self, candidate_answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluates candidate MCQ submissions against the question bank.
        Returns score percentage, strong concepts, and weak concepts.
        """
        correct_count = 0
        total_questions = len(SAMPLE_MCQ_BANK)
        strong_concepts: List[str] = []
        weak_concepts: List[str] = []

        bank_map = {q["id"]: q for q in SAMPLE_MCQ_BANK}

        for ans in candidate_answers:
            qid = ans.get("question_id")
            chosen_idx = ans.get("selected_option")
            q_obj = bank_map.get(qid)

            if q_obj:
                skill = q_obj.get("skill", "General Tech")
                if chosen_idx == q_obj.get("correct_answer"):
                    correct_count += 1
                    if skill not in strong_concepts:
                        strong_concepts.append(skill)
                else:
                    if skill not in weak_concepts:
                        weak_concepts.append(skill)

        score_pct = round((correct_count / max(1, total_questions)) * 100)

        return {
            "score": score_pct,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "strong_concepts": strong_concepts,
            "weak_concepts": weak_concepts,
        }


# Singleton instance
mcq_engine = MCQEngine()

"""
app/services/dataset_loader.py
------------------------------
High-performance in-memory question dataset query singleton for GetHire.
Loads curated domain datasets from backend/data/processed/ at startup.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, model_validator

from app.core.logging import get_logger

logger = get_logger(__name__)


class DatasetQuestion(BaseModel):
    """Normalized dataset question."""
    question_id: str
    subject: str
    category: str = ""
    difficulty: str = "medium"  # easy | medium | hard
    question: str
    ideal_answer: str = ""
    keywords: List[str] = Field(default_factory=list)
    expected_concepts: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def map_legacy_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "id" in data and "question_id" not in data:
                data["question_id"] = str(data["id"])
            if "domain" in data and "subject" not in data:
                data["subject"] = str(data["domain"])
            if "topic" in data and "category" not in data:
                data["category"] = str(data["topic"])
            if "explanation" in data and "ideal_answer" not in data:
                data["ideal_answer"] = str(data["explanation"])
            if "difficulty" in data and isinstance(data["difficulty"], str):
                data["difficulty"] = data["difficulty"].lower().capitalize()
        return data


class DatasetLoader:
    """Singleton dataset query service."""
    _instance: Optional[DatasetLoader] = None

    def __new__(cls) -> DatasetLoader:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, "_initialized", False):
            return

        self.data_dir = Path(__file__).resolve().parents[2] / "data" / "processed"
        self._questions_by_subject: Dict[str, Dict[str, List[DatasetQuestion]]] = {}
        self._all_questions: List[DatasetQuestion] = []
        self._load_datasets()
        self._initialized = True

    def _load_datasets(self) -> None:
        if not self.data_dir.exists():
            logger.warning("Dataset directory not found", path=str(self.data_dir))
            return

        json_files = list(self.data_dir.glob("*.json"))
        total_loaded = 0

        for file_path in json_files:
            subject_name = file_path.stem.replace("_", " ").lower()
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                items = data if isinstance(data, list) else data.get("questions", [])
                for item in items:
                    if not isinstance(item, dict) or "question" not in item:
                        continue
                    if "subject" not in item:
                        item["subject"] = subject_name
                    if "question_id" not in item and "id" not in item:
                        item["question_id"] = f"{subject_name}_{len(self._all_questions)}"

                    dq = DatasetQuestion(**item)
                    diff = dq.difficulty.lower()
                    self._questions_by_subject.setdefault(subject_name, {}).setdefault(diff, []).append(dq)
                    self._all_questions.append(dq)
                    total_loaded += 1
            except Exception as exc:
                logger.warning("Failed loading dataset file", file=file_path.name, error=str(exc))

        logger.info("Loaded dataset questions", total=total_loaded, subjects=len(self._questions_by_subject))

    def get_questions_for_skill(self, skill_name: str, difficulty: str = "medium") -> List[DatasetQuestion]:
        """Query questions for a skill and difficulty."""
        skill_key = skill_name.strip().lower()
        diff_key = difficulty.strip().lower()

        # Direct match
        if skill_key in self._questions_by_subject:
            return self._questions_by_subject[skill_key].get(diff_key, [])

        # Substring / alias match
        for key, diff_map in self._questions_by_subject.items():
            if key in skill_key or skill_key in key:
                if diff_key in diff_map:
                    return diff_map[diff_key]

        return []

    def get_all_available_skills(self) -> List[str]:
        return list(self._questions_by_subject.keys())


def get_dataset_loader() -> DatasetLoader:
    return DatasetLoader()

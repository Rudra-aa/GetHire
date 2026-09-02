import json
import logging
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, ValidationError, model_validator

logger = logging.getLogger(__name__)

class DatasetQuestion(BaseModel):
    """
    Standard data model representing a single interview question.
    Extensible and serialized to/from JSON.
    """
    question_id: str
    subject: str
    category: str = ""
    subcategory: str = ""
    difficulty: str  # Easy, Medium, Hard
    question: str
    ideal_answer: str
    keywords: list[str] = []
    follow_up_questions: list[str] = []
    related_concepts: list[str] = []
    estimated_answer_time_minutes: int = 5
    score_weight: int = 5
    options: Optional[dict[str, str]] = None
    correct_answer: str = ""
    expected_concepts: list[str] = []
    source: str = ""

    @model_validator(mode='before')
    @classmethod
    def map_legacy_fields(cls, data):
        if isinstance(data, dict):
            if "id" in data and "question_id" not in data:
                data["question_id"] = data["id"]
            if "domain" in data and "subject" not in data:
                data["subject"] = data["domain"]
            if "topic" in data and "category" not in data:
                data["category"] = data["topic"]
            if "explanation" in data and "ideal_answer" not in data:
                data["ideal_answer"] = data["explanation"]
        return data

    # For backwards compatibility with older code accessing id/domain/topic/explanation
    @property
    def id(self) -> str:
        return self.question_id

    @property
    def domain(self) -> str:
        return self.subject

    @property
    def topic(self) -> str:
        return self.category

    @property
    def explanation(self) -> str:
        return self.ideal_answer


class DatasetLoader:
    """
    Singleton class responsible for loading, caching, and querying the standard datasets.
    """
    _instance: Optional["DatasetLoader"] = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, data_dir: Optional[Path] = None):
        if self._initialized:
            return
        
        self.data_dir = data_dir or Path(__file__).parent.parent / "data" / "processed"
        self._questions_by_id: dict[str, DatasetQuestion] = {}
        self._questions_by_text: dict[str, DatasetQuestion] = {}
        self._questions_by_skill: dict[str, dict[str, list[DatasetQuestion]]] = {}
        
        self.load_datasets()
        self._initialized = True

    def load_datasets(self):
        """Loads and parses all JSON dataset files in data/processed/."""
        logger.info(f"Loading processed datasets from {self.data_dir}")
        self._questions_by_id.clear()
        self._questions_by_text.clear()
        self._questions_by_skill.clear()

        # Handle directory not existing gracefully
        if not self.data_dir.exists():
            logger.warning(f"Data directory {self.data_dir} does not exist.")
            return

        json_files = list(self.data_dir.glob("*.json"))

        for filepath in json_files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                questions_list = []
                if isinstance(data, list):
                    questions_list = data
                elif isinstance(data, dict):
                    if "questions" in data:
                        questions_list = data["questions"]
                    else:
                        questions_list = [data]
                
                for idx, q_dict in enumerate(questions_list):
                    try:
                        if "source" not in q_dict or not q_dict["source"]:
                            q_dict["source"] = filepath.name
                        
                        question = DatasetQuestion(**q_dict)
                        
                        # Store by ID
                        self._questions_by_id[question.id] = question
                        
                        # Store by Text (normalized for matching)
                        self._questions_by_text[question.question.lower().strip()] = question
                        
                        # Store by Skill / Difficulty
                        skill = question.domain
                        if skill not in self._questions_by_skill:
                            self._questions_by_skill[skill] = {
                                "easy": [],
                                "medium": [],
                                "hard": []
                            }
                        
                        diff = question.difficulty.lower().strip()
                        if diff not in self._questions_by_skill[skill]:
                            self._questions_by_skill[skill][diff] = []
                        self._questions_by_skill[skill][diff].append(question)
                        
                    except ValidationError as ve:
                        logger.warning(f"Validation error in file {filepath.name} at question index {idx}: {ve}")
                    except Exception as e:
                        logger.warning(f"Error parsing question in file {filepath.name} at index {idx}: {e}")
            except Exception as e:
                logger.error(f"Failed to load dataset file {filepath}: {e}")

        logger.info(f"Loaded {len(self._questions_by_id)} total questions across {len(self._questions_by_skill)} skills.")

    def get_questions_for_skill(self, skill: str, difficulty: Optional[str] = None) -> list[DatasetQuestion]:
        """Query questions for a specific skill, optionally filtering by difficulty."""
        skill_dict = self._questions_by_skill.get(skill)
        if not skill_dict:
            # Case insensitive match fallback
            for s, d in self._questions_by_skill.items():
                if s.lower() == skill.lower():
                    skill_dict = d
                    break
            if not skill_dict:
                return []
        
        if difficulty:
            diff_lower = difficulty.lower().strip()
            return skill_dict.get(diff_lower, [])
        
        all_q = []
        for q_list in skill_dict.values():
            all_q.extend(q_list)
        return all_q

    def get_available_skills(self) -> list[str]:
        """Get list of all skill/domain names available."""
        return sorted(list(self._questions_by_skill.keys()))

    def get_question_by_id(self, q_id: str) -> Optional[DatasetQuestion]:
        """Find a question by its unique ID."""
        return self._questions_by_id.get(q_id)

    def get_question_by_text(self, text: str) -> Optional[DatasetQuestion]:
        """Find a question by its text (exact matches, case/whitespace insensitive)."""
        return self._questions_by_text.get(text.lower().strip())

    def stats(self) -> dict:
        """Get database stats: count per skill per difficulty."""
        stats_dict = {}
        for skill, diffs in self._questions_by_skill.items():
            stats_dict[skill] = {
                "easy": len(diffs.get("easy", [])),
                "medium": len(diffs.get("medium", [])),
                "hard": len(diffs.get("hard", [])),
                "total": sum(len(q) for q in diffs.values())
            }
        stats_dict["_total_all"] = len(self._questions_by_id)
        return stats_dict


_loader = None

def get_loader(data_dir: Optional[Path] = None) -> DatasetLoader:
    global _loader
    if _loader is None:
        _loader = DatasetLoader(data_dir)
    return _loader

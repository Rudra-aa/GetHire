"""
session_store.py
----------------
In-memory interview session store for GetHire.

WHY IN-MEMORY:
    - Zero configuration required for development
    - All interview sessions are ephemeral (30–60 min max)
    - Swap path: replace this module with MongoDB/Redis when ready

SWAP PATH TO MONGODB:
    1. Install motor: pip install motor
    2. Replace _SESSIONS dict with MongoDB collection
    3. Change all dict operations to await collection.find_one() / insert_one()
    4. Keep the same function signatures — no other file changes needed
"""

import uuid
from datetime import datetime, timezone
from typing import Optional


# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------

_SESSIONS: dict[str, dict] = {}
_ANSWERS: dict[str, list[dict]] = {}   # session_id → list of answer records
_REPORTS: dict[str, dict] = {}         # session_id → report metadata


# ---------------------------------------------------------------------------
# Session operations
# ---------------------------------------------------------------------------

def create_session(candidate_name: str, skills: list[str], resume_text: str = "") -> dict:
    """Create a new interview session and return it."""
    session_id = str(uuid.uuid4())
    session = {
        "session_id": session_id,
        "candidate_name": candidate_name,
        "skills": skills,
        "resume_text": resume_text,
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "questions": [],
        "final_score": None,
        "recommendation": None,
    }
    _SESSIONS[session_id] = session
    _ANSWERS[session_id] = []
    return session


def get_session(session_id: str) -> Optional[dict]:
    """Retrieve a session by ID. Returns None if not found."""
    return _SESSIONS.get(session_id)


def update_session(session_id: str, **kwargs) -> Optional[dict]:
    """Update session fields. Returns updated session or None."""
    session = _SESSIONS.get(session_id)
    if session is None:
        return None
    session.update(kwargs)
    return session


def set_session_questions(session_id: str, questions: list[dict]) -> None:
    """Attach generated questions to a session."""
    session = _SESSIONS.get(session_id)
    if session:
        session["questions"] = questions
        session["status"] = "in_progress"


def get_session_questions(session_id: str) -> list[dict]:
    """Return the questions attached to a session."""
    session = _SESSIONS.get(session_id)
    return session.get("questions", []) if session else []


# ---------------------------------------------------------------------------
# Answer operations
# ---------------------------------------------------------------------------

def store_answer(session_id: str, answer_record: dict) -> None:
    """Persist one evaluated answer for a session."""
    if session_id not in _ANSWERS:
        _ANSWERS[session_id] = []
    _ANSWERS[session_id].append(answer_record)


def get_answers(session_id: str) -> list[dict]:
    """Return all stored answers for a session."""
    return _ANSWERS.get(session_id, [])


# ---------------------------------------------------------------------------
# Score / Report operations
# ---------------------------------------------------------------------------

def store_score(session_id: str, score_data: dict) -> None:
    """Persist the final score and recommendation for a session."""
    session = _SESSIONS.get(session_id)
    if session:
        session["final_score"] = score_data
        session["status"] = "completed"


def store_report_meta(session_id: str, report_path: str) -> None:
    """Store the path of the generated report PDF."""
    _REPORTS[session_id] = {
        "path": report_path,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_report_meta(session_id: str) -> Optional[dict]:
    """Retrieve report metadata for a session."""
    return _REPORTS.get(session_id)


# ---------------------------------------------------------------------------
# Stats (for admin/debug)
# ---------------------------------------------------------------------------

def get_all_session_ids() -> list[str]:
    return list(_SESSIONS.keys())


def session_count() -> int:
    return len(_SESSIONS)

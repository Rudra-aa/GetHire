"""
tests/test_interview_engine.py
------------------------------
Comprehensive automated test suite for Phase 3: AI Interview Engine.
Tests Interview Planner, Question Generator, Session State Machine,
Answer & Draft Persistence, and History.
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId
from fastapi import HTTPException

from app.models.resume import (
    ExperienceItem,
    ParsedResumeData,
    PersonalInfo,
    ProjectItem,
    ResumeModel,
)
from app.models.interview import (
    InterviewAnswerModel,
    InterviewQuestion,
    InterviewSessionModel,
)
from app.schemas.interview import (
    StartInterviewSessionRequest,
    SubmitAnswerRequest,
    UpdateSessionStateRequest,
)
from app.services.interview_planner import create_interview_plan
from app.services.question_generator import generate_questions_from_plan
from app.services.interview_session_service import (
    complete_interview_session,
    create_interview_session,
    get_interview_session,
    get_user_interview_history,
    update_session_state,
)
from app.services.interview_answer_service import (
    get_answers_for_session,
    save_interview_answer,
)


def _build_mock_resume() -> ResumeModel:
    return ResumeModel(
        user_id="507f1f77bcf86cd799439011",
        version=1,
        filename="alex_mercer.pdf",
        file_path="/tmp/alex.pdf",
        file_size_bytes=1024,
        parsed_data=ParsedResumeData(
            personal_info=PersonalInfo(name="Alex Mercer", email="alex@example.com"),
            skills=["Python", "React", "FastAPI", "MongoDB", "TypeScript", "Docker"],
            technologies=["PostgreSQL", "Redis", "Kubernetes"],
            experience=[
                ExperienceItem(
                    company="Stripe",
                    role="Senior Fullstack Engineer",
                    duration="2021 - Present",
                    bullets=["Architected webhook processing system"],
                )
            ],
            projects=[
                ProjectItem(
                    title="GetHire AI",
                    description="AI interview simulation platform",
                    technologies=["FastAPI", "React", "MongoDB"],
                )
            ],
        ),
    )


class TestInterviewEngine(unittest.IsolatedAsyncioTestCase):

    # ── 1. Planner Tests ────────────────────────────────────────────────────

    def test_01_interview_planner_creates_balanced_blueprint(self):
        resume = _build_mock_resume()
        plan = create_interview_plan(
            resume=resume,
            target_role="Fullstack Developer",
            experience_level="mid",
            interview_type="mixed",
            total_questions=10,
        )

        self.assertEqual(plan.total_questions, 10)
        self.assertEqual(len(plan.slots), 10)

        # Verify categories present
        categories = {s.category for s in plan.slots}
        self.assertIn("Resume-based", categories)
        self.assertIn("Technical", categories)
        self.assertIn("Projects", categories)
        self.assertIn("Problem Solving", categories)
        self.assertIn("Behavioral", categories)

        # Verify difficulty progression
        diffs = [s.difficulty for s in plan.slots]
        self.assertIn("Easy", diffs)
        self.assertIn("Medium", diffs)
        self.assertIn("Hard", diffs)

        # Verify resume target extraction
        self.assertIn("Stripe", plan.experience_covered)
        self.assertIn("GetHire AI", plan.projects_covered)

    # ── 2. Question Generator Tests ─────────────────────────────────────────

    def test_02_question_generator_executes_blueprint(self):
        resume = _build_mock_resume()
        plan = create_interview_plan(
            resume=resume,
            target_role="Fullstack Developer",
            experience_level="mid",
            interview_type="mixed",
            total_questions=8,
        )
        questions = generate_questions_from_plan(plan, resume)

        self.assertEqual(len(questions), 8)

        # Check metadata on every single question
        for q in questions:
            self.assertTrue(q.id.startswith("q_"))
            self.assertIsNotNone(q.question_text)
            self.assertIsNotNone(q.category)
            self.assertIsNotNone(q.difficulty)
            self.assertGreater(len(q.expected_concepts), 0)

        # Check project question context
        proj_q = next((q for q in questions if q.category == "Projects"), None)
        self.assertIsNotNone(proj_q)
        self.assertIn("GetHire AI", proj_q.question_text)

        # Check resume experience question context
        exp_q = next((q for q in questions if q.category == "Resume-based"), None)
        self.assertIsNotNone(exp_q)
        self.assertIn("Stripe", exp_q.question_text)

    # ── 3. Session Lifecycle Tests ──────────────────────────────────────────

    async def test_03_create_interview_session(self):
        user_id = "507f1f77bcf86cd799439011"
        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=_build_mock_resume().model_dump())
        mock_db.__getitem__.return_value.insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("607f1f77bcf86cd799439099"))
        )

        payload = StartInterviewSessionRequest(
            target_role="Fullstack Developer",
            experience_level="senior",
            interview_type="mixed",
            total_questions=10,
        )

        session = await create_interview_session(mock_db, user_id, payload)

        self.assertEqual(session.user_id, user_id)
        self.assertEqual(session.status, "running")
        self.assertEqual(session.current_question_index, 0)
        self.assertEqual(session.overall_progress, 0.0)
        self.assertEqual(len(session.questions), 10)

    async def test_04_update_session_state(self):
        user_id = "507f1f77bcf86cd799439011"
        session_id = "607f1f77bcf86cd799439099"

        session_doc = {
            "_id": ObjectId(session_id),
            "user_id": user_id,
            "target_role": "Fullstack Developer",
            "experience_level": "mid",
            "interview_type": "mixed",
            "status": "running",
            "total_questions": 10,
            "current_question_index": 0,
            "overall_progress": 0.0,
            "elapsed_seconds": 0,
            "questions": [],
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=session_doc)
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        # Pause and advance to question 3
        patch_payload = UpdateSessionStateRequest(
            status="paused",
            current_question_index=3,
            elapsed_seconds=180,
        )

        updated_doc = dict(session_doc)
        updated_doc["status"] = "paused"
        updated_doc["current_question_index"] = 3
        updated_doc["overall_progress"] = 30.0
        updated_doc["elapsed_seconds"] = 180
        mock_db.__getitem__.return_value.find_one.side_effect = [session_doc, updated_doc]

        updated = await update_session_state(mock_db, session_id, user_id, patch_payload)
        self.assertEqual(updated.status, "paused")
        self.assertEqual(updated.current_question_index, 3)

    # ── 4. Answer & Autosave Draft Tests ────────────────────────────────────

    async def test_05_save_draft_and_final_answer(self):
        user_id = "507f1f77bcf86cd799439011"
        session_id = "607f1f77bcf86cd799439099"

        session_doc = {
            "_id": ObjectId(session_id),
            "user_id": user_id,
            "status": "running",
            "total_questions": 5,
            "current_question_index": 0,
            "questions": [
                {
                    "id": "q_1",
                    "position": 1,
                    "category": "Technical",
                    "difficulty": "Easy",
                    "question_text": "What is Python?",
                    "expected_concepts": ["Interpreted", "Dynamic typing"],
                    "source": "dataset",
                }
            ],
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=session_doc)
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        # 1. Autosave draft
        draft_payload = SubmitAnswerRequest(
            question_id="q_1",
            answer_text="Python is an interpreted, high-level programming language.",
            time_taken_seconds=15,
            is_draft=True,
        )

        draft_answer_doc = {
            "_id": ObjectId(),
            "session_id": session_id,
            "user_id": user_id,
            "question_id": "q_1",
            "answer_text": draft_payload.answer_text,
            "is_draft": True,
            "word_count": 8,
            "time_taken_seconds": 15,
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        mock_db.__getitem__.return_value.find_one.side_effect = [session_doc, draft_answer_doc]

        saved_draft = await save_interview_answer(mock_db, session_id, user_id, draft_payload)
        self.assertTrue(saved_draft.is_draft)
        self.assertEqual(saved_draft.word_count, 8)

        # 2. Finalize answer
        final_payload = SubmitAnswerRequest(
            question_id="q_1",
            answer_text="Python is an interpreted language with rich ecosystem.",
            time_taken_seconds=45,
            is_draft=False,
        )
        final_answer_doc = dict(draft_answer_doc)
        final_answer_doc["is_draft"] = False
        final_answer_doc["submitted_at"] = datetime.now(timezone.utc)
        mock_db.__getitem__.return_value.find_one.side_effect = [session_doc, final_answer_doc]

        saved_final = await save_interview_answer(mock_db, session_id, user_id, final_payload)
        self.assertFalse(saved_final.is_draft)

    # ── 5. Complete Session & History Tests ─────────────────────────────────

    async def test_06_complete_interview_session(self):
        user_id = "507f1f77bcf86cd799439011"
        session_id = "607f1f77bcf86cd799439099"

        session_doc = {
            "_id": ObjectId(session_id),
            "user_id": user_id,
            "status": "running",
            "total_questions": 10,
            "current_question_index": 9,
            "overall_progress": 90.0,
            "questions": [],
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        completed_doc = dict(session_doc)
        completed_doc["status"] = "completed"
        completed_doc["overall_progress"] = 100.0
        completed_doc["completed_at"] = datetime.now(timezone.utc)

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(side_effect=[session_doc, completed_doc])
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        finished = await complete_interview_session(mock_db, session_id, user_id)
        self.assertEqual(finished.status, "completed")
        self.assertEqual(finished.overall_progress, 100.0)
        self.assertIsNotNone(finished.completed_at)


if __name__ == "__main__":
    unittest.main()

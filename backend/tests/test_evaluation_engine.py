"""
tests/test_evaluation_engine.py
-------------------------------
Automated test suite for Phase 4: Evaluation Engine.
Tests KeywordEngine, RubricEngine, CommunicationEngine, FollowUpEngine,
and EvaluationService orchestration & persistence.
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId

from app.models.interview import InterviewQuestion, InterviewSessionModel
from app.services.communication_engine import analyze_communication
from app.services.evaluation_service import (
    evaluate_and_store_answer,
    evaluate_session_all_answers,
    evaluate_single_answer_payload,
)
from app.services.followup_engine import determine_followup_recommendation
from app.services.keyword_engine import evaluate_keywords_and_concepts
from app.services.rubric_engine import build_rubric_for_question, evaluate_rubric


def _build_mock_question() -> InterviewQuestion:
    return InterviewQuestion(
        id="q_1",
        position=1,
        category="Technical",
        difficulty="Medium",
        question_text="How do you ensure idempotency in distributed webhook processing?",
        context_snippet="Webhook processing architecture",
        skill_targeted="System Design",
        expected_concepts=["Idempotency", "Retry queues", "Throughput scaling", "Dead-letter queues"],
        source="system_design",
    )


class TestEvaluationEngine(unittest.IsolatedAsyncioTestCase):

    # ── 1. Keyword Engine Tests ─────────────────────────────────────────────

    def test_01_keyword_exact_and_synonym_matching(self):
        answer = (
            "We enforce idempotent message handling by hashing webhook IDs in Redis. "
            "If a duplicate event arrives, we deduplicate and safely retry via background queues. "
            "Failed messages are routed to a dlq (dead-letter queue)."
        )
        expected = ["Idempotency", "Retry queues", "Dead-letter queues", "Throughput scaling"]

        res = evaluate_keywords_and_concepts(answer, expected)

        # "idempotency" should match directly
        self.assertIn("Idempotency", res.matched_concepts)
        # "dlq" or "dead-letter queue" should match "Dead-letter queues"
        self.assertIn("Dead-letter queues", res.matched_concepts)
        # "Throughput scaling" is missing
        self.assertIn("Throughput scaling", res.missing_concepts)
        self.assertGreaterEqual(res.match_ratio, 0.5)

    # ── 2. Rubric Engine Tests ──────────────────────────────────────────────

    def test_02_rubric_scoring_by_category_and_depth(self):
        question = _build_mock_question()
        rubric = build_rubric_for_question(question)

        self.assertEqual(rubric.category, "Technical")
        self.assertIn("technical_accuracy", rubric.scoring_weights)

        # Evaluate comprehensive answer
        full_answer = (
            "We ensure idempotency by storing transaction keys in Redis with TTL. "
            "Our retry queues use exponential backoff, and unprocessable payloads go to dead-letter queues. "
            "For throughput scaling, we shard workers using Kafka partitions."
        )
        kw_res = evaluate_keywords_and_concepts(full_answer, question.expected_concepts)
        rubric_res = evaluate_rubric(rubric, kw_res, word_count=len(full_answer.split()))

        self.assertGreaterEqual(rubric_res.technical_accuracy_score, 80)
        self.assertGreaterEqual(rubric_res.concept_coverage_score, 75)

    # ── 3. Communication Engine Tests ───────────────────────────────────────

    def test_03_communication_analysis_and_filler_detection(self):
        articulate_ans = (
            "Firstly, our team chose FastAPI because of async event loop performance. "
            "Secondly, we implemented Redis rate limiting; therefore, latency dropped by 40%. "
            "In production, the result was seamless horizontal scalability."
        )
        res_good = analyze_communication(articulate_ans)
        self.assertGreaterEqual(res_good.score, 80)
        self.assertEqual(res_good.filler_count, 0)
        self.assertIn("Exemplary", res_good.structure_rating)

        # Flawed answer with fillers and brevity
        flawed_ans = "Um, basically we kind of used Redis, you know, stuff like that."
        res_flawed = analyze_communication(flawed_ans)
        self.assertLess(res_flawed.score, 65)
        self.assertGreaterEqual(res_flawed.filler_count, 3)

    # ── 4. Follow-up Engine Tests ───────────────────────────────────────────

    def test_04_followup_trigger_on_missing_concepts(self):
        question = _build_mock_question()
        rubric = build_rubric_for_question(question)

        # Weak answer missing most concepts
        weak_ans = "We used Redis for webhooks."
        kw_res = evaluate_keywords_and_concepts(weak_ans, question.expected_concepts)
        rubric_res = evaluate_rubric(rubric, kw_res, word_count=5)

        followup = determine_followup_recommendation(question, kw_res, rubric_res, word_count=5)
        self.assertTrue(followup.follow_up_required)
        self.assertIsNotNone(followup.suggested_follow_up)
        self.assertIsNotNone(followup.follow_up_reason)

    # ── 5. Evaluation Service End-to-End Test ────────────────────────────────

    async def test_05_evaluate_and_store_single_answer(self):
        user_id = "507f1f77bcf86cd799439011"
        session_id = "607f1f77bcf86cd799439099"
        question = _build_mock_question()

        session_doc = {
            "_id": ObjectId(session_id),
            "user_id": user_id,
            "target_role": "Fullstack Developer",
            "experience_level": "mid",
            "interview_type": "mixed",
            "status": "running",
            "total_questions": 1,
            "current_question_index": 0,
            "overall_progress": 100.0,
            "elapsed_seconds": 90,
            "questions": [question.model_dump()],
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        answer_doc = {
            "_id": ObjectId("607f1f77bcf86cd799439088"),
            "session_id": session_id,
            "user_id": user_id,
            "question_id": "q_1",
            "answer_text": "We implemented idempotent workers with retry queues and dead-letter queues.",
            "is_draft": False,
            "word_count": 10,
            "time_taken_seconds": 30,
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        eval_saved_doc = {
            "_id": ObjectId("607f1f77bcf86cd799439077"),
            "session_id": session_id,
            "question_id": "q_1",
            "user_id": user_id,
            "overall_score": 82,
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(
            side_effect=[session_doc, answer_doc, eval_saved_doc]
        )
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        eval_res = await evaluate_and_store_answer(
            db=mock_db,
            session_id=session_id,
            question_id="q_1",
            user_id=user_id,
        )

        self.assertEqual(eval_res.session_id, session_id)
        self.assertEqual(eval_res.question_id, "q_1")
        self.assertGreater(eval_res.overall_score, 0)
        self.assertIsNotNone(eval_res.scores.technical_accuracy)
        self.assertIsNotNone(eval_res.scores.communication)


if __name__ == "__main__":
    unittest.main()

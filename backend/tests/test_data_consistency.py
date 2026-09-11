"""
backend/tests/test_data_consistency.py
---------------------------------------
End-to-End Data Consistency & Multi-Engine Integration Tests for GetHire.
Validates:
1. Technical assessment submission, persistence, and /latest retrieval.
2. Interview completion triggering evaluation and HireScore recomputation.
3. Synthesis of technical assessment score into composite HireScore.
4. Stale HireScore cache invalidation upon newly completed sessions.
5. Canonical data consistency between Assessment, Interview, Evaluation, and Dashboard.
"""

from __future__ import annotations

import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock
from bson import ObjectId

from app.models.evaluation import EvaluationModel
from app.models.hirescore import HireScoreModel
from app.models.user import UserModel
from app.services.assessment_engine.assessment_service import assessment_service
from app.services.evaluation_service import evaluate_session_all_answers, get_session_evaluations
from app.services.hire_score_engine import (
    calculate_hirescore_components,
    compute_composite_hirescore,
    get_or_compute_user_hirescore,
)
from app.services.interview_session_service import complete_interview_session


class AsyncIterator:
    def __init__(self, items):
        self.items = items

    def __aiter__(self):
        self._iter = iter(self.items)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class TestDataConsistency(unittest.IsolatedAsyncioTestCase):
    """Verifies end-to-end data consistency across all GetHire engines."""

    def setUp(self):
        self.user_id = "507f1f77bcf86cd799439011"
        self.user_obj_id = ObjectId(self.user_id)
        self.test_user = UserModel(
            id=self.user_id,
            full_name="Alex River",
            email="alex.river@example.com",
            password_hash="mock_hash",
            target_role="Senior Full-Stack Engineer",
            experience_level="Senior",
        )

    def _build_in_memory_mock_db(self):
        """Creates an in-memory storage dictionary that mirrors MongoDB behavior."""
        storage = {
            "users": {},
            "resumes": {},
            "assessment_sessions": {},
            "interview_sessions": {},
            "interview_answers": {},
            "turn_evaluations": {},
            "evaluations": {},
            "hirescores": {},
            "facesense_sessions": {},
            "candidate_intelligence_graphs": {},
        }

        # Seed user
        storage["users"][self.user_obj_id] = {
            "_id": self.user_obj_id,
            "full_name": "Alex River",
            "email": "alex.river@example.com",
            "password_hash": "mock_hash",
            "target_role": "Senior Full-Stack Engineer",
            "experience_level": "Senior",
            "status": "active",
            "is_deleted": False,
        }

        mock_db = MagicMock()

        def get_collection(col_name):
            col_mock = MagicMock()

            async def insert_one(doc):
                doc_copy = dict(doc)
                if "_id" not in doc_copy:
                    new_id = ObjectId()
                    doc_copy["_id"] = new_id
                else:
                    new_id = doc_copy["_id"]
                storage[col_name][new_id] = doc_copy
                res = MagicMock()
                res.inserted_id = new_id
                return res

            async def find_one(filter_dict=None, sort=None):
                filter_dict = filter_dict or {}
                docs = list(storage[col_name].values())
                matched = []
                for d in docs:
                    match = True
                    for k, v in filter_dict.items():
                        if k == "$or":
                            sub_match = False
                            for cond in v:
                                if cond is None:
                                    continue
                                if all(d.get(sk) == sv or str(d.get(sk)) == str(sv) for sk, sv in cond.items()):
                                    sub_match = True
                                    break
                            if not sub_match:
                                match = False
                                break
                        elif isinstance(v, dict) and "$in" in v:
                            val = d.get(k)
                            allowed = [str(x) for x in v["$in"]]
                            if str(val) not in allowed:
                                match = False
                                break
                        elif isinstance(v, dict) and "$gt" in v:
                            val = d.get(k)
                            if val is None or not (val > v["$gt"]):
                                match = False
                                break
                        elif isinstance(v, dict) and "$exists" in v:
                            if (k in d) != v["$exists"]:
                                match = False
                                break
                        else:
                            if str(d.get(k)) != str(v) and d.get(k) != v:
                                match = False
                                break
                    if match:
                        matched.append(d)

                if sort and matched:
                    for sort_k, sort_dir in reversed(sort):
                        matched.sort(key=lambda x: x.get(sort_k) or datetime.min.replace(tzinfo=timezone.utc), reverse=(sort_dir == -1))

                return dict(matched[0]) if matched else None

            async def update_one(filter_dict, update_dict, upsert=False, sort=None):
                matched_doc = await find_one(filter_dict, sort=sort)
                res = MagicMock()
                if matched_doc:
                    target_id = matched_doc["_id"]
                    if "$set" in update_dict:
                        storage[col_name][target_id].update(update_dict["$set"])
                    res.matched_count = 1
                    res.modified_count = 1
                elif upsert:
                    new_doc = dict(filter_dict)
                    if "$set" in update_dict:
                        new_doc.update(update_dict["$set"])
                    new_id = ObjectId()
                    new_doc["_id"] = new_id
                    storage[col_name][new_id] = new_doc
                    res.matched_count = 0
                    res.modified_count = 0
                    res.upserted_id = new_id
                else:
                    res.matched_count = 0
                    res.modified_count = 0
                return res

            async def count_documents(filter_dict=None):
                filter_dict = filter_dict or {}
                docs = list(storage[col_name].values())
                count = 0
                for d in docs:
                    match = True
                    for k, v in filter_dict.items():
                        if isinstance(v, dict) and "$in" in v:
                            val = d.get(k)
                            allowed = [str(x) for x in v["$in"]]
                            if str(val) not in allowed:
                                match = False
                                break
                        else:
                            if str(d.get(k)) != str(v) and d.get(k) != v:
                                match = False
                                break
                    if match:
                        count += 1
                return count

            def find(filter_dict=None):
                filter_dict = filter_dict or {}
                docs = list(storage[col_name].values())
                matched = []
                for d in docs:
                    match = True
                    for k, v in filter_dict.items():
                        if isinstance(v, dict) and "$in" in v:
                            val = d.get(k)
                            allowed = [str(x) for x in v["$in"]]
                            if str(val) not in allowed:
                                match = False
                                break
                        else:
                            if str(d.get(k)) != str(v) and d.get(k) != v:
                                match = False
                                break
                    if match:
                        matched.append(d)

                cursor = MagicMock()
                cursor.sort.return_value = cursor
                cursor.limit.return_value = cursor

                async def to_list(length=None):
                    return [dict(x) for x in matched[:length] if length] if length else [dict(x) for x in matched]

                cursor.to_list = to_list
                cursor.__aiter__ = lambda s: AsyncIterator([dict(x) for x in matched])
                return cursor

            col_mock.insert_one = insert_one
            col_mock.find_one = find_one
            col_mock.update_one = update_one
            col_mock.count_documents = count_documents
            col_mock.find = find
            return col_mock

        mock_db.__getitem__.side_effect = get_collection
        return mock_db, storage

    async def test_01_assessment_submit_and_latest_retrieval(self):
        """Test technical assessment creation, answer submission, and /latest query."""
        mock_db, storage = self._build_in_memory_mock_db()

        # 1. Start assessment session
        session = await assessment_service.create_assessment_session(
            mock_db, user_id=self.user_id, target_role="Senior Full-Stack Engineer", experience_level="Senior"
        )
        self.assertIsNotNone(session.get("id"))
        self.assertEqual(session["status"], "active")
        self.assertEqual(len(session["questions"]), 4)

        # 2. Submit candidate answers (all correct)
        answers = [
            {"question_id": "mcq_1", "selected_option": 0},
            {"question_id": "mcq_2", "selected_option": 0},
            {"question_id": "mcq_3", "selected_option": 0},
            {"question_id": "mcq_4", "selected_option": 0},
        ]
        sub_res = await assessment_service.submit_assessment(
            mock_db, user_id=self.user_id, assessment_id=session["id"], candidate_answers=answers
        )
        self.assertEqual(sub_res["status"], "completed")
        self.assertEqual(sub_res["score"], 100)
        self.assertEqual(sub_res["correct_count"], 4)

        # 3. Retrieve latest assessment
        latest = await assessment_service.get_latest_assessment(mock_db, user_id=self.user_id)
        self.assertIsNotNone(latest)
        self.assertEqual(latest["score"], 100)
        self.assertEqual(latest["status"], "completed")
        self.assertEqual(latest["id"], session["id"])

    async def test_02_assessment_score_synthesizes_into_hirescore(self):
        """Test that Technical Assessment score directly influences candidate HireScore calculation."""
        mock_db, storage = self._build_in_memory_mock_db()

        # Seed completed assessment with 85%
        now = datetime.now(timezone.utc)
        await mock_db["assessment_sessions"].insert_one({
            "_id": ObjectId(),
            "user_id": self.user_id,
            "target_role": "Senior Full-Stack Engineer",
            "experience_level": "Senior",
            "status": "completed",
            "score": 85,
            "correct_count": 3,
            "total_questions": 4,
            "strong_concepts": ["Distributed Systems", "Algorithms", "Backend APIs"],
            "weak_concepts": ["PostgreSQL"],
            "completed_at": now,
            "updated_at": now,
        })

        # Calculate HireScore
        hs = await get_or_compute_user_hirescore(mock_db, user_id=self.user_id, force_recompute=True)
        self.assertIsNotNone(hs)
        self.assertEqual(hs.components.technical_accuracy, 85)
        # Overall score should be robust (>= 75) instead of baseline 19
        self.assertGreaterEqual(hs.overall_score, 75)

    async def test_03_interview_completion_triggers_evaluation_and_hirescore(self):
        """Test that completing an interview session runs evaluations and recomputes HireScore."""
        mock_db, storage = self._build_in_memory_mock_db()

        # 1. Create interview session
        now = datetime.now(timezone.utc)
        sess_id = ObjectId()
        storage["interview_sessions"][sess_id] = {
            "_id": sess_id,
            "user_id": self.user_id,
            "target_role": "Senior Full-Stack Engineer",
            "experience_level": "Senior",
            "status": "running",
            "total_questions": 2,
            "current_question_index": 1,
            "overall_progress": 50.0,
            "elapsed_seconds": 120,
            "started_at": now,
            "created_at": now,
            "updated_at": now,
            "transcripts": [
                {
                    "ai_response": "How do you handle cache stampedes with Redis in high throughput architectures?",
                    "candidate_transcript": "We implement probabilistic early expiration with Redis cache-aside, background warming tasks, and TTL jitter to prevent stampedes and maintain high throughput.",
                }
            ],
        }

        # 2. Complete the interview session
        completed = await complete_interview_session(mock_db, str(sess_id), self.user_id)
        self.assertEqual(completed.status, "completed")
        self.assertEqual(completed.overall_progress, 100.0)

        # 3. Verify evaluations were generated
        evals = await get_session_evaluations(mock_db, str(sess_id), self.user_id)
        self.assertGreater(len(evals), 0)
        self.assertGreater(evals[0].scores.technical_accuracy.score, 60)

        # 4. Verify HireScore was computed and persisted
        latest_hs = await mock_db["hirescores"].find_one({"user_id": self.user_id})
        self.assertIsNotNone(latest_hs)
        self.assertGreater(latest_hs["overall_score"], 60)

    async def test_04_stale_cache_invalidation(self):
        """Test that HireScore engine detects newer completed assessments and invalidates stale cache."""
        mock_db, storage = self._build_in_memory_mock_db()

        # 1. Seed old cached HireScore (19 score)
        past_time = datetime.now(timezone.utc) - timedelta(days=2)
        old_hs_id = ObjectId()
        storage["hirescores"][old_hs_id] = {
            "_id": old_hs_id,
            "user_id": self.user_id,
            "overall_score": 19,
            "components": {
                "resume_quality": 70,
                "technical_accuracy": 20,
                "communication": 20,
                "problem_solving": 20,
                "concept_coverage": 20,
                "star_structure": 20,
                "interview_consistency": 80,
            },
            "readiness": {"readiness_percentage": 20, "tier": "Needs Practice", "verdict": "Preparing", "dimension_readiness": {}},
            "benchmark": {"candidate_hirescore": 19, "industry_level": "Junior", "level_benchmark": 60, "percentile": 20, "delta_from_baseline": -41, "standing_summary": "Junior level baseline"},
            "gaps": [],
            "recommendations": {"priority_actions": [], "suggested_practice_questions": [], "curated_learning_topics": []},
            "career_roadmap": [],
            "created_at": past_time,
            "updated_at": past_time,
        }

        # 2. Add a newly completed assessment after the cache time
        now = datetime.now(timezone.utc)
        await mock_db["assessment_sessions"].insert_one({
            "_id": ObjectId(),
            "user_id": self.user_id,
            "target_role": "Senior Full-Stack Engineer",
            "experience_level": "Senior",
            "status": "completed",
            "score": 90,
            "completed_at": now,
            "updated_at": now,
        })

        # 3. Request latest HireScore without force_recompute -> Must detect new assessment and recompute
        hs = await get_or_compute_user_hirescore(mock_db, user_id=self.user_id, force_recompute=False)
        self.assertNotEqual(hs.overall_score, 19)
        self.assertEqual(hs.components.technical_accuracy, 90)
        self.assertGreater(hs.overall_score, 75)

    async def test_05_complete_end_to_end_user_flow(self):
        """
        Complete End-to-End User Flow:
        1. Complete Technical Assessment & Submit
        2. Verify Dashboard latest assessment retrieves 100% (NOT 'Not Taken')
        3. Conduct Mock Interview & Submit candidate answer
        4. Complete interview session -> verify evaluation generated
        5. Verify Unified Evaluation Report data and calibrated HireScore
        6. Simulate page refresh -> verify consistency across re-fetches
        """
        mock_db, storage = self._build_in_memory_mock_db()

        # Step 1: Start and submit technical assessment
        ass_sess = await assessment_service.create_assessment_session(
            mock_db, user_id=self.user_id, target_role="Senior Full-Stack Engineer", experience_level="Senior"
        )
        answers = [
            {"question_id": "mcq_1", "selected_option": 0},
            {"question_id": "mcq_2", "selected_option": 0},
            {"question_id": "mcq_3", "selected_option": 0},
            {"question_id": "mcq_4", "selected_option": 0},
        ]
        sub_res = await assessment_service.submit_assessment(
            mock_db, user_id=self.user_id, assessment_id=ass_sess["id"], candidate_answers=answers
        )
        self.assertEqual(sub_res["score"], 100)

        # Step 2: Query latest assessment as Dashboard does
        latest_ass = await assessment_service.get_latest_assessment(mock_db, user_id=self.user_id)
        self.assertIsNotNone(latest_ass)
        self.assertEqual(latest_ass["score"], 100)
        self.assertEqual(latest_ass["status"], "completed")

        # Step 3: Conduct Interview session
        now = datetime.now(timezone.utc)
        int_sess_id = ObjectId()
        storage["interview_sessions"][int_sess_id] = {
            "_id": int_sess_id,
            "user_id": self.user_id,
            "target_role": "Senior Full-Stack Engineer",
            "experience_level": "Senior",
            "status": "running",
            "total_questions": 2,
            "current_question_index": 1,
            "overall_progress": 50.0,
            "elapsed_seconds": 150,
            "started_at": now,
            "created_at": now,
            "updated_at": now,
            "transcripts": [
                {
                    "ai_response": "How do you design high-throughput cache invalidation with Redis in microservices?",
                    "candidate_transcript": "We implement probabilistic early expiration with Redis cache-aside and TTL jitter to prevent cache stampedes under high throughput bursts.",
                }
            ],
        }

        # Step 4: Complete interview session
        comp_int = await complete_interview_session(mock_db, str(int_sess_id), self.user_id)
        self.assertEqual(comp_int.status, "completed")

        # Step 5: Verify evaluations generated for Evaluation Report
        evals = await get_session_evaluations(mock_db, str(int_sess_id), self.user_id)
        self.assertEqual(len(evals), 1)
        self.assertGreater(evals[0].overall_score, 50)

        # Step 6: Verify HireScore synthesized from Assessment + Interview
        hs = await get_or_compute_user_hirescore(mock_db, user_id=self.user_id)
        self.assertIsNotNone(hs)
        self.assertGreaterEqual(hs.overall_score, 70)
        # Verify technical accuracy incorporates 100% assessment score
        self.assertGreaterEqual(hs.components.technical_accuracy, 75)

        # Step 7: Simulate Dashboard refresh
        refreshed_ass = await assessment_service.get_latest_assessment(mock_db, user_id=self.user_id)
        refreshed_hs = await get_or_compute_user_hirescore(mock_db, user_id=self.user_id)
        self.assertEqual(refreshed_ass["score"], 100)
        self.assertEqual(refreshed_hs.overall_score, hs.overall_score)


if __name__ == "__main__":
    unittest.main()

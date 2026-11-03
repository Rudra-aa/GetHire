"""
tests/test_evaluation_pipeline_consistency.py
---------------------------------------------
Comprehensive automated test suite verifying evaluation pipeline data consistency:
Scenario A: No completed assessment or interview (Never invent fake scores).
Scenario B: Assessment completed but interview missing (No fabricated combined HireScore).
Scenario C: Interview completed but assessment missing (Labeled as interview-only).
Scenario D: Both completed with valid persisted results (Unified evaluation report).
Scenario E: Existing historical reports and multiple evaluation cycles (Immutability preserved).
Scenario F: API failures, cancelled attempts, and missing evaluation records (No fallbacks to archived/incomplete data).
"""

from __future__ import annotations

import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from bson import ObjectId

from app.models.evaluation import (
    DimensionScore,
    EvaluationModel,
    EvaluationScores,
)
from app.models.resume import (
    ParsedResumeData,
    QualityScoreBreakdown,
    ResumeModel,
)
from app.services.assessment_engine.assessment_service import assessment_service
from app.services.evaluation_report_service import (
    generate_evaluation_report,
    get_evaluation_history,
    get_evaluation_report,
)
from app.services.hire_score_engine import (
    calculate_hirescore_components,
    compute_composite_hirescore,
    get_or_compute_user_hirescore,
)


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


class TestEvaluationPipelineConsistency(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.user_id = str(ObjectId())
        self.user_obj_id = ObjectId(self.user_id)
        self.other_user_id = str(ObjectId())

    def _build_in_memory_db(self):
        storage = {
            "users": {},
            "resumes": {},
            "assessment_sessions": {},
            "interview_sessions": {},
            "evaluations": {},
            "evaluation_reports": {},
            "hirescores": {},
            "facesense_sessions": {},
        }

        mock_db = MagicMock()

        def get_col(col_name):
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
                        elif isinstance(v, dict) and "$exists" in v:
                            if (k in d) != v["$exists"]:
                                match = False
                                break
                        elif isinstance(v, dict) and "$gt" in v:
                            val = d.get(k)
                            if val is None or not (val > v["$gt"]):
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
                        matched.sort(
                            key=lambda x: x.get(sort_k) or datetime.min.replace(tzinfo=timezone.utc),
                            reverse=(sort_dir == -1),
                        )

                return dict(matched[0]) if matched else None

            async def count_documents(filter_dict=None):
                filter_dict = filter_dict or {}
                docs = list(storage[col_name].values())
                cnt = 0
                for d in docs:
                    match = True
                    for k, v in filter_dict.items():
                        if isinstance(v, dict) and "$in" in v:
                            val = d.get(k)
                            if str(val) not in [str(x) for x in v["$in"]]:
                                match = False
                                break
                        else:
                            if str(d.get(k)) != str(v) and d.get(k) != v:
                                match = False
                                break
                    if match:
                        cnt += 1
                return cnt

            def find(filter_dict=None):
                filter_dict = filter_dict or {}
                docs = list(storage[col_name].values())
                matched = []
                for d in docs:
                    match = True
                    for k, v in filter_dict.items():
                        if isinstance(v, dict) and "$in" in v:
                            val = d.get(k)
                            if str(val) not in [str(x) for x in v["$in"]]:
                                match = False
                                break
                        else:
                            if str(d.get(k)) != str(v) and d.get(k) != v:
                                match = False
                                break
                    if match:
                        matched.append(d)

                cursor = MagicMock()
                def mock_sort(key_or_list, direction=1):
                    if isinstance(key_or_list, list):
                        for k, d in reversed(key_or_list):
                            matched.sort(key=lambda x: x.get(k) or 0, reverse=(d == -1))
                    elif isinstance(key_or_list, str):
                        matched.sort(key=lambda x: x.get(key_or_list) or 0, reverse=(direction == -1))
                    return cursor

                cursor.sort.side_effect = mock_sort
                cursor.limit.return_value = cursor
                cursor.to_list = lambda length=None: (
                    matched[:length] if length else matched
                )
                async def async_to_list(length=None):
                    return [dict(x) for x in (matched[:length] if length else matched)]
                cursor.to_list = async_to_list
                cursor.__aiter__ = lambda s: AsyncIterator([dict(x) for x in matched])
                return cursor

            col_mock.insert_one = insert_one
            col_mock.find_one = find_one
            col_mock.count_documents = count_documents
            col_mock.find = find
            return col_mock

        mock_db.__getitem__.side_effect = get_col
        return mock_db, storage

    def _seed_evaluation_model(self, storage, session_id, user_id, score=85):
        eval_id = ObjectId()
        storage["evaluations"][eval_id] = {
            "_id": eval_id,
            "session_id": str(session_id),
            "question_id": "q_1",
            "user_id": str(user_id),
            "overall_score": score,
            "scores": {
                "overall": score,
                "technical_accuracy": {"score": score, "explanation": "Depth verified"},
                "concept_coverage": {"score": score, "explanation": "Broad coverage"},
                "problem_solving": {"score": score, "explanation": "Structured thinking"},
                "communication": {"score": score, "explanation": "Clear cadence"},
                "completeness": {"score": score, "explanation": "Complete STAR"},
            },
            "strengths": ["Clear architectural structure"],
            "weaknesses": ["Minor edge case missing"],
            "recommended_improvements": ["Review idempotency keys"],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

    # ── SCENARIO A: No completed assessment or interview ──────────────────────

    async def test_scenario_a_no_completed_assessment_or_interview(self):
        """Scenario A: Zero activity -> Never invent scores, return None / 0."""
        mock_db, _ = self._build_in_memory_db()

        # 1. Latest assessment must be None (never return fake 25%)
        latest_assessment = await assessment_service.get_latest_assessment(mock_db, self.user_id)
        self.assertIsNone(latest_assessment)

        # 2. Combined evaluation report must NOT be generated
        report = await generate_evaluation_report(mock_db, self.user_id)
        self.assertIsNone(report)

        # 3. HireScore must be 0 and Not Evaluated (never fabricate 58)
        hs = await get_or_compute_user_hirescore(mock_db, self.user_id, force_recompute=True)
        self.assertEqual(hs.overall_score, 0)
        self.assertEqual(hs.readiness.verdict, "Not Evaluated")

    # ── SCENARIO B: Assessment completed but interview missing ─────────────────

    async def test_scenario_b_assessment_completed_interview_missing(self):
        """Scenario B: Only assessment completed -> No fake combined report."""
        mock_db, storage = self._build_in_memory_db()
        now = datetime.now(timezone.utc)

        # Seed completed assessment with score 80
        ass_id = ObjectId()
        storage["assessment_sessions"][ass_id] = {
            "_id": ass_id,
            "user_id": self.user_id,
            "status": "completed",
            "score": 80,
            "completed_at": now,
            "updated_at": now,
        }

        # 1. Latest assessment correctly returns 80%
        latest_assessment = await assessment_service.get_latest_assessment(mock_db, self.user_id)
        self.assertIsNotNone(latest_assessment)
        self.assertEqual(latest_assessment["score"], 80)

        # 2. Combined evaluation report must NOT be generated without completed interview
        report = await generate_evaluation_report(mock_db, self.user_id)
        self.assertIsNone(report)

        # 3. Report history remains empty
        history = await get_evaluation_history(mock_db, self.user_id)
        self.assertEqual(len(history), 0)

    # ── SCENARIO C: Interview completed but assessment missing ─────────────────

    async def test_scenario_c_interview_completed_assessment_missing(self):
        """Scenario C: Only interview completed -> Labeled explicitly as interview-only."""
        mock_db, storage = self._build_in_memory_db()
        now = datetime.now(timezone.utc)

        # Seed completed interview session
        int_id = ObjectId()
        storage["interview_sessions"][int_id] = {
            "_id": int_id,
            "session_id": str(int_id),
            "user_id": self.user_id,
            "status": "completed",
            "completed_at": now,
            "updated_at": now,
        }
        self._seed_evaluation_model(storage, int_id, self.user_id, score=82)

        # 1. Latest assessment must be None
        latest_assessment = await assessment_service.get_latest_assessment(mock_db, self.user_id)
        self.assertIsNone(latest_assessment)

        # 2. Unspecified report generation (combined report) returns None
        combined_report = await generate_evaluation_report(mock_db, self.user_id)
        self.assertIsNone(combined_report)

        # 3. Specific session lookup generates interview-only report
        int_report = await get_evaluation_report(mock_db, self.user_id, str(int_id))
        self.assertIsNotNone(int_report)
        self.assertEqual(int_report.assessment_session_id, "none")
        self.assertEqual(int_report.assessment_score, 0)
        self.assertEqual(int_report.interview_score, 82)
        self.assertEqual(int_report.hirescore, 82)

    # ── SCENARIO D: Both completed with valid persisted results ────────────────

    async def test_scenario_d_both_completed_generates_combined_report(self):
        """Scenario D: Both completed -> Generates official immutable combined report."""
        mock_db, storage = self._build_in_memory_db()
        now = datetime.now(timezone.utc)

        # 1. Seed completed assessment (score 90)
        ass_id = ObjectId()
        storage["assessment_sessions"][ass_id] = {
            "_id": ass_id,
            "user_id": self.user_id,
            "status": "completed",
            "score": 90,
            "completed_at": now,
            "updated_at": now,
        }

        # 2. Seed completed interview (score 84)
        int_id = ObjectId()
        storage["interview_sessions"][int_id] = {
            "_id": int_id,
            "session_id": str(int_id),
            "user_id": self.user_id,
            "status": "completed",
            "completed_at": now,
            "updated_at": now,
        }
        self._seed_evaluation_model(storage, int_id, self.user_id, score=84)

        # 3. Generate combined report
        report = await generate_evaluation_report(mock_db, self.user_id)
        self.assertIsNotNone(report)
        self.assertEqual(report.evaluation_number, 1)
        self.assertEqual(report.assessment_score, 90)
        self.assertEqual(report.interview_score, 84)
        self.assertNotEqual(report.assessment_session_id, "none")
        self.assertGreater(report.hirescore, 80)

    # ── SCENARIO E: Historical reports and multiple evaluation cycles ──────────

    async def test_scenario_e_multiple_evaluation_cycles_preserves_immutability(self):
        """Scenario E: Report #1, #2 must remain immutable across new cycles."""
        mock_db, storage = self._build_in_memory_db()
        now = datetime.now(timezone.utc)

        # Cycle 1
        ass_id_1 = ObjectId()
        storage["assessment_sessions"][ass_id_1] = {
            "_id": ass_id_1,
            "user_id": self.user_id,
            "status": "completed",
            "score": 75,
            "completed_at": now,
        }
        int_id_1 = ObjectId()
        storage["interview_sessions"][int_id_1] = {
            "_id": int_id_1,
            "session_id": str(int_id_1),
            "user_id": self.user_id,
            "status": "completed",
            "completed_at": now,
        }
        self._seed_evaluation_model(storage, int_id_1, self.user_id, score=70)

        report_1 = await generate_evaluation_report(mock_db, self.user_id)
        self.assertEqual(report_1.evaluation_number, 1)
        self.assertEqual(report_1.assessment_score, 75)
        self.assertEqual(report_1.interview_score, 70)

        # Cycle 2 - New assessment and interview
        now_2 = datetime.now(timezone.utc)
        ass_id_2 = ObjectId()
        storage["assessment_sessions"][ass_id_2] = {
            "_id": ass_id_2,
            "user_id": self.user_id,
            "status": "completed",
            "score": 92,
            "completed_at": now_2,
        }
        int_id_2 = ObjectId()
        storage["interview_sessions"][int_id_2] = {
            "_id": int_id_2,
            "session_id": str(int_id_2),
            "user_id": self.user_id,
            "status": "completed",
            "completed_at": now_2,
        }
        self._seed_evaluation_model(storage, int_id_2, self.user_id, score=88)

        report_2 = await generate_evaluation_report(mock_db, self.user_id)
        self.assertEqual(report_2.evaluation_number, 2)
        self.assertEqual(report_2.assessment_score, 92)
        self.assertEqual(report_2.interview_score, 88)

        # Verify Report #1 remains immutable
        saved_report_1 = await get_evaluation_report(mock_db, self.user_id, str(report_1.id))
        self.assertEqual(saved_report_1.evaluation_number, 1)
        self.assertEqual(saved_report_1.assessment_score, 75)
        self.assertEqual(saved_report_1.interview_score, 70)

        # Verify history order (newest first)
        history = await get_evaluation_history(mock_db, self.user_id)
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0].evaluation_number, 2)
        self.assertEqual(history[1].evaluation_number, 1)

    # ── SCENARIO F: Cancelled/archived records and unauthorized access ─────────

    async def test_scenario_f_cancelled_archived_records_ignored(self):
        """Scenario F: Cancelled/archived attempts with score > 0 are NEVER picked."""
        mock_db, storage = self._build_in_memory_db()
        now = datetime.now(timezone.utc)

        # Seed archived assessment where user answered 1 question (score 25)
        archived_ass_id = ObjectId()
        storage["assessment_sessions"][archived_ass_id] = {
            "_id": archived_ass_id,
            "user_id": self.user_id,
            "status": "archived",
            "score": 25,
            "completed_at": now,
            "archived_at": now,
        }

        # Seed cancelled assessment with score 25
        cancelled_ass_id = ObjectId()
        storage["assessment_sessions"][cancelled_ass_id] = {
            "_id": cancelled_ass_id,
            "user_id": self.user_id,
            "status": "cancelled",
            "score": 25,
            "updated_at": now,
        }

        # Seed in-progress interview
        running_int_id = ObjectId()
        storage["interview_sessions"][running_int_id] = {
            "_id": running_int_id,
            "session_id": str(running_int_id),
            "user_id": self.user_id,
            "status": "running",
            "updated_at": now,
        }

        # 1. get_latest_assessment MUST return None (never pick up 25%)
        latest_assessment = await assessment_service.get_latest_assessment(mock_db, self.user_id)
        self.assertIsNone(latest_assessment)

        # 2. generate_evaluation_report MUST return None (never pick up incomplete sessions)
        report = await generate_evaluation_report(mock_db, self.user_id)
        self.assertIsNone(report)

        # 3. Requesting another user's report returns None (404)
        other_user_report_id = ObjectId()
        storage["evaluation_reports"][other_user_report_id] = {
            "_id": other_user_report_id,
            "candidate_id": self.other_user_id,
            "evaluation_number": 1,
            "assessment_session_id": "none",
            "interview_session_id": str(ObjectId()),
            "assessment_score": 0,
            "interview_score": 85,
            "hirescore": 85,
            "readiness": {"readiness_percentage": 85, "verdict": "Hire", "confidence_level": "High", "summary": ""},
            "created_at": now,
            "updated_at": now,
        }
        unauthorized = await get_evaluation_report(mock_db, self.user_id, str(other_user_report_id))
        self.assertIsNone(unauthorized)


if __name__ == "__main__":
    unittest.main()

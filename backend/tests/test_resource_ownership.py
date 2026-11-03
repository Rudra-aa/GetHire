"""
tests/test_resource_ownership.py
---------------------------------
Automated test suite verifying Object-Level Authorization (IDOR Prevention)
across user-owned resources:
  - Resumes & Uploaded Files
  - Interviews (Sessions, Answers, Turns)
  - Evaluations & Evaluation Reports
  - Integrity Sessions & Reports
  - FaceSense Intelligence Sessions & Timelines
  - Assessments

Required Coverage:
  1. User A accessing User A's resource (Allowed)
  2. User B accessing User B's resource (Allowed)
  3. User A requesting User B's resource (Rejected / 404)
  4. User A modifying User B's resource (Rejected / 404)
  5. User A deleting User B's resource (Rejected / 404)
  6. Authorized Administrator accessing resources (Allowed)
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.db.mongo import mongo_manager, get_database
from app.dependencies.auth import get_current_active_user, get_current_user
from app.main import app
from app.models.user import UserModel


# ── Mock MongoDB In-Memory Database ──────────────────────────────────────────

class MockCursor:
    def __init__(self, docs):
        self.docs = docs

    def sort(self, *args, **kwargs):
        return self

    def skip(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    async def to_list(self, length=None):
        if length is not None:
            return [dict(d) for d in self.docs[:length]]
        return [dict(d) for d in self.docs]


class MockCollection:
    def __init__(self, initial_docs=None):
        self.docs = [dict(d) for d in (initial_docs or [])]

    def _matches(self, doc, query):
        if not query:
            return True
        for k, v in query.items():
            if k == "$or":
                if not any(self._matches(doc, sub_q) for sub_q in v if sub_q is not None):
                    return False
                continue
            doc_val = doc.get(k)
            if isinstance(v, dict) and "$in" in v:
                in_list = [str(x) for x in v["$in"]]
                if str(doc_val) not in in_list:
                    return False
            elif isinstance(v, dict) and "$exists" in v:
                if (k in doc) != v["$exists"]:
                    return False
            else:
                if str(doc_val) != str(v):
                    return False
        return True

    async def find_one(self, query=None, *args, **kwargs):
        query = query or {}
        for doc in self.docs:
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query=None, *args, **kwargs):
        query = query or {}
        matched = [d for d in self.docs if self._matches(d, query)]
        return MockCursor(matched)

    async def update_one(self, filter_query, update, upsert=False, *args, **kwargs):
        matched_doc = None
        for doc in self.docs:
            if self._matches(doc, filter_query):
                matched_doc = doc
                break

        res = MagicMock()
        if matched_doc:
            res.matched_count = 1
            res.modified_count = 1
            if "$set" in update:
                matched_doc.update(update["$set"])
        elif upsert:
            new_doc = {}
            for k, v in filter_query.items():
                if not k.startswith("$") and not isinstance(v, dict):
                    new_doc[k] = v
            if "$setOnInsert" in update:
                new_doc.update(update["$setOnInsert"])
            if "$set" in update:
                new_doc.update(update["$set"])
            if "_id" not in new_doc:
                new_doc["_id"] = ObjectId()
            self.docs.append(new_doc)
            res.matched_count = 0
            res.upserted_id = new_doc["_id"]
        else:
            res.matched_count = 0
            res.modified_count = 0
        return res

    async def delete_one(self, filter_query):
        res = MagicMock()
        for idx, doc in enumerate(self.docs):
            if self._matches(doc, filter_query):
                self.docs.pop(idx)
                res.deleted_count = 1
                return res
        res.deleted_count = 0
        return res

    async def count_documents(self, filter_query=None):
        filter_query = filter_query or {}
        return sum(1 for d in self.docs if self._matches(d, filter_query))

    async def insert_one(self, doc):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = ObjectId()
        self.docs.append(doc_copy)
        res = MagicMock()
        res.inserted_id = doc_copy["_id"]
        return res


class MockDatabase:
    def __init__(self, collections=None):
        self.collections = collections or {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]


# ── Test Suite ──────────────────────────────────────────────────────────────

class TestResourceOwnership(unittest.IsolatedAsyncioTestCase):
    """Verifies that all user-owned resources enforce strict object-level authorization."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()

        # Users
        self.user_a_id = "507f1f77bcf86cd799439021"
        self.user_b_id = "507f1f77bcf86cd799439022"
        self.admin_id = "507f1f77bcf86cd799439023"

        self.user_a = UserModel(
            _id=ObjectId(self.user_a_id),
            email="usera@example.com",
            full_name="User Alpha",
            password_hash="secret_a",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        self.user_b = UserModel(
            _id=ObjectId(self.user_b_id),
            email="userb@example.com",
            full_name="User Beta",
            password_hash="secret_b",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        self.admin_user = UserModel(
            _id=ObjectId(self.admin_id),
            email="admin@example.com",
            full_name="Admin Chief",
            password_hash="secret_admin",
            role="admin",
            status="active",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        # Resource IDs
        self.resume_a_id = "607f1f77bcf86cd7994390a1"
        self.resume_b_id = "607f1f77bcf86cd7994390b1"

        self.session_a_id = "607f1f77bcf86cd7994390a2"
        self.session_b_id = "607f1f77bcf86cd7994390b2"

        self.eval_a_id = "607f1f77bcf86cd7994390a4"
        self.eval_b_id = "607f1f77bcf86cd7994390b4"

        self.report_a_id = "607f1f77bcf86cd7994390a5"
        self.report_b_id = "607f1f77bcf86cd7994390b5"

        self.assess_a_id = "607f1f77bcf86cd7994390a8"
        self.assess_b_id = "607f1f77bcf86cd7994390b8"

        # Mock database setup with seeded resources for User A and User B
        now = datetime.now(timezone.utc)
        self.mock_db = MockDatabase({
            "users": MockCollection([
                self.user_a.model_dump(by_alias=True),
                self.user_b.model_dump(by_alias=True),
                self.admin_user.model_dump(by_alias=True),
            ]),
            "resumes": MockCollection([
                {
                    "_id": ObjectId(self.resume_a_id),
                    "user_id": self.user_a_id,
                    "filename": "resume_alpha.pdf",
                    "file_path": "/tmp/resume_alpha.pdf",
                    "file_size_bytes": 1024,
                    "version": 1,
                    "status": "parsed",
                    "page_count": 1,
                    "raw_text": "Alpha resume text",
                    "parsed_data": {
                        "personal_info": {"name": "User Alpha", "email": "usera@example.com"},
                        "skills": ["Python", "FastAPI"],
                        "technologies": ["PostgreSQL"],
                        "experience": [],
                        "projects": [],
                        "education": [],
                        "certifications": [],
                    },
                    "quality_score": {
                        "overall_score": 85,
                        "completeness_score": 85,
                        "skills_score": 85,
                        "impact_score": 85,
                        "structure_score": 85,
                        "strengths": ["Clear format"],
                        "improvements": [],
                    },
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId(self.resume_b_id),
                    "user_id": self.user_b_id,
                    "filename": "resume_beta.pdf",
                    "file_path": "/tmp/resume_beta.pdf",
                    "file_size_bytes": 2048,
                    "version": 1,
                    "status": "parsed",
                    "page_count": 2,
                    "raw_text": "Beta resume text",
                    "parsed_data": {
                        "personal_info": {"name": "User Beta", "email": "userb@example.com"},
                        "skills": ["Go", "Kubernetes"],
                        "technologies": ["Redis"],
                        "experience": [],
                        "projects": [],
                        "education": [],
                        "certifications": [],
                    },
                    "quality_score": {
                        "overall_score": 90,
                        "completeness_score": 90,
                        "skills_score": 90,
                        "impact_score": 90,
                        "structure_score": 90,
                        "strengths": ["Deep skills"],
                        "improvements": [],
                    },
                    "created_at": now,
                    "updated_at": now,
                },
            ]),
            "interview_sessions": MockCollection([
                {
                    "_id": ObjectId(self.session_a_id),
                    "session_id": self.session_a_id,
                    "user_id": self.user_a_id,
                    "resume_id": self.resume_a_id,
                    "target_role": "Backend Engineer",
                    "experience_level": "mid",
                    "interview_type": "technical",
                    "status": "running",
                    "total_questions": 5,
                    "current_question_index": 0,
                    "overall_progress": 0.0,
                    "elapsed_seconds": 10,
                    "questions": [
                        {
                            "id": "q1",
                            "question_text": "Explain indexing.",
                            "category": "Databases",
                            "difficulty": "medium",
                            "expected_concepts": ["B-Tree", "Clustered"],
                            "skill_targeted": "SQL",
                        }
                    ],
                    "started_at": now,
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId(self.session_b_id),
                    "session_id": self.session_b_id,
                    "user_id": self.user_b_id,
                    "resume_id": self.resume_b_id,
                    "target_role": "Fullstack Engineer",
                    "experience_level": "senior",
                    "interview_type": "technical",
                    "status": "running",
                    "total_questions": 5,
                    "current_question_index": 0,
                    "overall_progress": 0.0,
                    "elapsed_seconds": 25,
                    "questions": [
                        {
                            "id": "q1",
                            "question_text": "Explain distributed locks.",
                            "category": "Architecture",
                            "difficulty": "hard",
                            "expected_concepts": ["Redlock", "TTL"],
                            "skill_targeted": "Distributed Systems",
                        }
                    ],
                    "started_at": now,
                    "created_at": now,
                    "updated_at": now,
                },
            ]),
            "interview_answers": MockCollection([
                {
                    "_id": ObjectId("607f1f77bcf86cd7994390a3"),
                    "session_id": self.session_a_id,
                    "user_id": self.user_a_id,
                    "question_id": "q1",
                    "answer_text": "B-Tree indexes speed up lookups.",
                    "is_draft": False,
                    "word_count": 6,
                    "time_taken_seconds": 30,
                    "started_at": now,
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId("607f1f77bcf86cd7994390b3"),
                    "session_id": self.session_b_id,
                    "user_id": self.user_b_id,
                    "question_id": "q1",
                    "answer_text": "Redlock uses multiple Redis nodes.",
                    "is_draft": False,
                    "word_count": 6,
                    "time_taken_seconds": 45,
                    "started_at": now,
                    "created_at": now,
                    "updated_at": now,
                },
            ]),
            "evaluations": MockCollection([
                {
                    "_id": ObjectId(self.eval_a_id),
                    "session_id": self.session_a_id,
                    "question_id": "q1",
                    "user_id": self.user_a_id,
                    "overall_score": 85,
                    "scores": {
                        "overall": 85,
                        "technical_accuracy": {"score": 85, "reasoning": "Accurate"},
                        "concept_coverage": {"score": 80, "reasoning": "Good"},
                        "problem_solving": {"score": 85, "reasoning": "Solid"},
                        "communication": {"score": 90, "reasoning": "Clear"},
                        "completeness": {"score": 85, "reasoning": "Complete"},
                    },
                    "strengths": ["Clear explanation"],
                    "weaknesses": ["Could add examples"],
                    "recommended_improvements": ["Discuss tradeoffs"],
                    "follow_up": {"recommended": False, "suggested_question": ""},
                    "rubric_snapshot": {},
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId(self.eval_b_id),
                    "session_id": self.session_b_id,
                    "question_id": "q1",
                    "user_id": self.user_b_id,
                    "overall_score": 92,
                    "scores": {
                        "overall": 92,
                        "technical_accuracy": {"score": 95, "reasoning": "Expert"},
                        "concept_coverage": {"score": 90, "reasoning": "Thorough"},
                        "problem_solving": {"score": 90, "reasoning": "Strong"},
                        "communication": {"score": 95, "reasoning": "Concise"},
                        "completeness": {"score": 90, "reasoning": "Full"},
                    },
                    "strengths": ["Deep distributed systems knowledge"],
                    "weaknesses": [],
                    "recommended_improvements": [],
                    "follow_up": {"recommended": False, "suggested_question": ""},
                    "rubric_snapshot": {},
                    "created_at": now,
                    "updated_at": now,
                },
            ]),
            "evaluation_reports": MockCollection([
                {
                    "_id": ObjectId(self.report_a_id),
                    "candidate_id": self.user_a_id,
                    "evaluation_number": 1,
                    "assessment_session_id": self.assess_a_id,
                    "interview_session_id": self.session_a_id,
                    "assessment_score": 80,
                    "interview_score": 85,
                    "technical_accuracy": 85,
                    "concept_coverage": 80,
                    "problem_solving": 85,
                    "communication": 90,
                    "completeness": 85,
                    "hirescore": 84,
                    "readiness": {
                        "readiness_percentage": 85,
                        "verdict": "Ready",
                        "confidence_level": "High",
                        "summary": "Solid readiness",
                    },
                    "strengths": ["Clear explanation"],
                    "weaknesses": ["Could add examples"],
                    "recommendations": [],
                    "created_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId(self.report_b_id),
                    "candidate_id": self.user_b_id,
                    "evaluation_number": 1,
                    "assessment_session_id": self.assess_b_id,
                    "interview_session_id": self.session_b_id,
                    "assessment_score": 90,
                    "interview_score": 92,
                    "technical_accuracy": 95,
                    "concept_coverage": 90,
                    "problem_solving": 90,
                    "communication": 95,
                    "completeness": 90,
                    "hirescore": 92,
                    "readiness": {
                        "readiness_percentage": 92,
                        "verdict": "Senior Ready",
                        "confidence_level": "High",
                        "summary": "Excellent readiness",
                    },
                    "strengths": ["Deep systems knowledge"],
                    "weaknesses": [],
                    "recommendations": [],
                    "created_at": now,
                    "updated_at": now,
                },
            ]),
            "interview_intelligence_sessions": MockCollection([
                {
                    "_id": ObjectId("607f1f77bcf86cd7994390a6"),
                    "session_id": self.session_a_id,
                    "user_id": self.user_a_id,
                    "status": "active",
                    "integrity_score": 100,
                    "events_count": 0,
                    "telemetry_samples_count": 0,
                    "started_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId("607f1f77bcf86cd7994390b6"),
                    "session_id": self.session_b_id,
                    "user_id": self.user_b_id,
                    "status": "active",
                    "integrity_score": 95,
                    "events_count": 1,
                    "telemetry_samples_count": 5,
                    "started_at": now,
                    "updated_at": now,
                },
            ]),
            "facesense_sessions": MockCollection([
                {
                    "_id": ObjectId("607f1f77bcf86cd7994390a7"),
                    "session_id": self.session_a_id,
                    "user_id": self.user_a_id,
                    "status": "active",
                    "total_frames_processed": 10,
                    "overall_facescore": 88,
                    "samples": [],
                    "started_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId("607f1f77bcf86cd7994390b7"),
                    "session_id": self.session_b_id,
                    "user_id": self.user_b_id,
                    "status": "active",
                    "total_frames_processed": 20,
                    "overall_facescore": 92,
                    "samples": [],
                    "started_at": now,
                    "updated_at": now,
                },
            ]),
            "assessment_sessions": MockCollection([
                {
                    "_id": ObjectId(self.assess_a_id),
                    "user_id": self.user_a_id,
                    "status": "active",
                    "target_role": "Backend Engineer",
                    "experience_level": "mid",
                    "score": 0,
                    "started_at": now,
                    "updated_at": now,
                },
                {
                    "_id": ObjectId(self.assess_b_id),
                    "user_id": self.user_b_id,
                    "status": "completed",
                    "target_role": "Fullstack Engineer",
                    "experience_level": "senior",
                    "score": 90,
                    "started_at": now,
                    "updated_at": now,
                },
            ]),
        })

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── 1. Resumes: Read, Preview, Status, Delete ─────────────────────────────

    async def test_user_a_accesses_own_resume_success(self):
        """User A accessing User A's resume succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/resume/{self.resume_a_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertTrue(data["success"])
                self.assertEqual(data["data"]["resume"]["id"], self.resume_a_id)
                self.assertEqual(data["data"]["resume"]["user_id"], self.user_a_id)

    async def test_user_b_accesses_own_resume_success(self):
        """User B accessing User B's resume succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_b
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/resume/{self.resume_b_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertTrue(data["success"])
                self.assertEqual(data["data"]["resume"]["id"], self.resume_b_id)
                self.assertEqual(data["data"]["resume"]["user_id"], self.user_b_id)

    async def test_user_a_requesting_user_b_resume_rejected(self):
        """User A requesting User B's resume is rejected with 404 (IDOR prevented)."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # GET resume details
                res = await client.get(f"/api/v1/resume/{self.resume_b_id}")
                self.assertEqual(res.status_code, 404)

                # GET resume status
                res_status = await client.get(f"/api/v1/resume/{self.resume_b_id}/status")
                self.assertEqual(res_status.status_code, 404)

                # GET resume file preview / download
                res_preview = await client.get(f"/api/v1/resume/{self.resume_b_id}/preview")
                self.assertEqual(res_preview.status_code, 404)

    async def test_user_a_deleting_user_b_resume_rejected(self):
        """User A attempting to delete User B's resume is rejected with 404 and resume is preserved."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.delete(f"/api/v1/resume/{self.resume_b_id}")
                self.assertEqual(res.status_code, 404)

                # Verify User B's resume is still present in the database
                b_doc = await self.mock_db["resumes"].find_one({"_id": ObjectId(self.resume_b_id)})
                self.assertIsNotNone(b_doc)
                self.assertEqual(b_doc["user_id"], self.user_b_id)

    async def test_user_a_deleting_own_resume_success(self):
        """User A deleting their own resume succeeds."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.delete(f"/api/v1/resume/{self.resume_a_id}")
                self.assertEqual(res.status_code, 200)

                # Verify User A's resume is removed
                a_doc = await self.mock_db["resumes"].find_one({"_id": ObjectId(self.resume_a_id)})
                self.assertIsNone(a_doc)

    # ── 2. Interviews: Access, Modify, Complete, Answers ───────────────────────

    async def test_user_a_accesses_own_interview_success(self):
        """User A accessing User A's interview session succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/interview/sessions/{self.session_a_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()["data"]
                self.assertEqual(data["id"], self.session_a_id)
                self.assertEqual(data["user_id"], self.user_a_id)

    async def test_user_b_accesses_own_interview_success(self):
        """User B accessing User B's interview session succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_b
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/interview/sessions/{self.session_b_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()["data"]
                self.assertEqual(data["id"], self.session_b_id)
                self.assertEqual(data["user_id"], self.user_b_id)

    async def test_user_a_requesting_user_b_interview_rejected(self):
        """User A requesting User B's interview session or answers is rejected with 404."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # GET session
                res_sess = await client.get(f"/api/v1/interview/sessions/{self.session_b_id}")
                self.assertEqual(res_sess.status_code, 404)

                # GET session answers
                res_ans = await client.get(f"/api/v1/interview/sessions/{self.session_b_id}/answers")
                self.assertEqual(res_ans.status_code, 404)

                # GET recover session
                res_rec = await client.get(f"/api/v1/interview/sessions/{self.session_b_id}/recover")
                self.assertEqual(res_rec.status_code, 404)

    async def test_user_a_modifying_user_b_interview_rejected(self):
        """User A attempting to PATCH, answer, or complete User B's session is rejected with 404."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 1. PATCH session state
                patch_res = await client.patch(
                    f"/api/v1/interview/sessions/{self.session_b_id}",
                    json={"status": "paused", "current_question_index": 2},
                )
                self.assertEqual(patch_res.status_code, 404)

                # 2. POST answers to B's session
                ans_res = await client.post(
                    f"/api/v1/interview/sessions/{self.session_b_id}/answers",
                    json={"question_id": "q1", "answer_text": "Hacked answer", "is_draft": False},
                )
                self.assertEqual(ans_res.status_code, 404)

                # 3. POST complete B's session
                comp_res = await client.post(f"/api/v1/interview/sessions/{self.session_b_id}/complete")
                self.assertEqual(comp_res.status_code, 404)

                # 4. POST turn on B's session
                turn_res = await client.post(
                    f"/api/v1/interview/sessions/{self.session_b_id}/turn?candidate_transcript=Malicious+Turn"
                )
                self.assertEqual(turn_res.status_code, 404)

                # Verify Session B in database was NOT altered
                b_sess = await self.mock_db["interview_sessions"].find_one({"_id": ObjectId(self.session_b_id)})
                self.assertEqual(b_sess["status"], "running")
                self.assertEqual(b_sess["current_question_index"], 0)

    # ── 3. Evaluations: Direct, Batch, ID Lookup ──────────────────────────────

    async def test_user_a_accesses_own_evaluation_success(self):
        """User A accessing User A's evaluation record succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/evaluations/{self.eval_a_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()["data"]
                self.assertEqual(data["id"], self.eval_a_id)
                self.assertEqual(data["user_id"], self.user_a_id)

    async def test_user_b_accesses_own_evaluation_success(self):
        """User B accessing User B's evaluation record succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_b
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/evaluations/{self.eval_b_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()["data"]
                self.assertEqual(data["id"], self.eval_b_id)
                self.assertEqual(data["user_id"], self.user_b_id)

    async def test_user_a_requesting_user_b_evaluation_rejected(self):
        """User A requesting User B's evaluation record by ID or session is rejected with 404."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # GET evaluation by ID
                res_id = await client.get(f"/api/v1/evaluations/{self.eval_b_id}")
                self.assertEqual(res_id.status_code, 404)

                # GET session evaluations
                res_sess = await client.get(f"/api/v1/evaluations/session/{self.session_b_id}")
                self.assertEqual(res_sess.status_code, 404)

    async def test_user_a_triggering_evaluation_on_user_b_session_rejected(self):
        """User A attempting to evaluate User B's session answer or batch evaluate is rejected with 404."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # Single evaluate
                res_eval = await client.post(
                    "/api/v1/evaluations",
                    json={
                        "session_id": self.session_b_id,
                        "question_id": "q1",
                        "answer_text": "Illegitimate evaluation attempt",
                    },
                )
                self.assertEqual(res_eval.status_code, 404)

                # Batch evaluate
                res_batch = await client.post(f"/api/v1/evaluations/session/{self.session_b_id}/evaluate-all")
                self.assertEqual(res_batch.status_code, 404)

    # ── 4. Evaluation Reports ─────────────────────────────────────────────────

    async def test_user_a_accesses_own_evaluation_report_success(self):
        """User A accessing their own report snapshot succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/evaluation-reports/{self.report_a_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()["data"]
                self.assertEqual(data["candidate_id"], self.user_a_id)

    async def test_user_b_accesses_own_evaluation_report_success(self):
        """User B accessing their own report snapshot succeeds with 200."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_b
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/evaluation-reports/{self.report_b_id}")
                self.assertEqual(res.status_code, 200)
                data = res.json()["data"]
                self.assertEqual(data["candidate_id"], self.user_b_id)

    async def test_user_a_requesting_user_b_evaluation_report_rejected(self):
        """User A requesting User B's report snapshot is rejected with 404."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/evaluation-reports/{self.report_b_id}")
                self.assertEqual(res.status_code, 404)

    # ── 5. Integrity Engine & FaceSense ───────────────────────────────────────

    async def test_user_a_accesses_own_integrity_session_success(self):
        """User A accessing their own integrity summary succeeds with 200."""
        app.dependency_overrides[get_current_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            with patch("app.api.v1.integrity.router.get_database", return_value=self.mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    res = await client.get(f"/api/v1/integrity/session/{self.session_a_id}")
                    self.assertEqual(res.status_code, 200)
                    self.assertEqual(res.json()["user_id"], self.user_a_id)

    async def test_user_a_requesting_user_b_integrity_rejected(self):
        """User A requesting User B's integrity session or report is rejected with 404."""
        app.dependency_overrides[get_current_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            with patch("app.api.v1.integrity.router.get_database", return_value=self.mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    res_sess = await client.get(f"/api/v1/integrity/session/{self.session_b_id}")
                    self.assertEqual(res_sess.status_code, 404)

                    res_rep = await client.get(f"/api/v1/integrity/session/{self.session_b_id}/report")
                    self.assertEqual(res_rep.status_code, 404)

    async def test_user_a_accesses_own_facesense_session_success(self):
        """User A accessing their own FaceSense summary succeeds with 200."""
        app.dependency_overrides[get_current_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            with patch("app.api.v1.facesense.router.get_database", return_value=self.mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    res = await client.get(f"/api/v1/facesense/session/{self.session_a_id}")
                    self.assertEqual(res.status_code, 200)
                    self.assertEqual(res.json()["session_id"], self.session_a_id)

    async def test_user_a_requesting_user_b_facesense_rejected(self):
        """User A requesting User B's FaceSense session or timeline is rejected with 404."""
        app.dependency_overrides[get_current_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            with patch("app.api.v1.facesense.router.get_database", return_value=self.mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    res_sess = await client.get(f"/api/v1/facesense/session/{self.session_b_id}")
                    self.assertEqual(res_sess.status_code, 404)

                    res_time = await client.get(f"/api/v1/facesense/session/{self.session_b_id}/timeline")
                    self.assertEqual(res_time.status_code, 404)

    # ── 6. Assessments: Attempted Overwrite ────────────────────────────────────

    async def test_user_a_submitting_for_user_b_assessment_rejected(self):
        """User A submitting answers for User B's assessment session is rejected with 404."""
        app.dependency_overrides[get_current_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            with patch("app.api.v1.assessment.router.get_database", return_value=self.mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    res = await client.post(
                        "/api/v1/assessment/submit",
                        json={
                            "assessment_id": self.assess_b_id,
                            "answers": [{"question_id": "mcq1", "selected_option": "A"}],
                        },
                    )
                    self.assertEqual(res.status_code, 404)

                    # Verify User B's assessment session score was untouched
                    b_assess = await self.mock_db["assessment_sessions"].find_one({"_id": ObjectId(self.assess_b_id)})
                    self.assertEqual(b_assess["score"], 90)
                    self.assertEqual(b_assess["user_id"], self.user_b_id)

    # ── 7. HireScore Querying with Session ID ─────────────────────────────────

    async def test_user_a_requesting_hirescore_with_user_b_session_rejected(self):
        """User A querying HireScore with User B's session_id is rejected with 404."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res = await client.get(f"/api/v1/hirescore/latest?session_id={self.session_b_id}")
                self.assertEqual(res.status_code, 404)

    # ── 8. Administrator Access ───────────────────────────────────────────────

    async def test_admin_accesses_user_resources_success(self):
        """Authorized Administrator can inspect user-owned resources."""
        app.dependency_overrides[get_current_active_user] = lambda: self.admin_user
        app.dependency_overrides[get_current_user] = lambda: self.admin_user
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            with patch("app.api.v1.integrity.router.get_database", return_value=self.mock_db):
                with patch("app.api.v1.facesense.router.get_database", return_value=self.mock_db):
                    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                        # Admin reading User A's resume
                        res_resume = await client.get(f"/api/v1/resume/{self.resume_a_id}")
                        self.assertEqual(res_resume.status_code, 200)

                        # Admin reading User B's interview session
                        res_session = await client.get(f"/api/v1/interview/sessions/{self.session_b_id}")
                        self.assertEqual(res_session.status_code, 200)

                        # Admin reading User B's evaluation
                        res_eval = await client.get(f"/api/v1/evaluations/{self.eval_b_id}")
                        self.assertEqual(res_eval.status_code, 200)

                        # Admin reading User B's evaluation report
                        res_report = await client.get(f"/api/v1/evaluation-reports/{self.report_b_id}")
                        self.assertEqual(res_report.status_code, 200)

                        # Admin reading User B's integrity session
                        res_int = await client.get(f"/api/v1/integrity/session/{self.session_b_id}")
                        self.assertEqual(res_int.status_code, 200)

                        # Admin reading User B's facesense session
                        res_fs = await client.get(f"/api/v1/facesense/session/{self.session_b_id}")
                        self.assertEqual(res_fs.status_code, 200)


if __name__ == "__main__":
    unittest.main()

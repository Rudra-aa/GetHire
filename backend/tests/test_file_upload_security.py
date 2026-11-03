"""
tests/test_file_upload_security.py
----------------------------------
Automated test suite verifying file upload reliability, security, and authorization:
  - Valid upload
  - Unsupported extension
  - Invalid MIME type
  - Oversized file (>10MB)
  - Empty file (0 bytes)
  - Invalid filename (path traversal, null bytes, empty stems)
  - Authorized download (Owner & Administrator)
  - Unauthorized download (Another User & Unauthenticated)
  - Corrupted file handling
  - Safe storage path containment
"""

import os
import shutil
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

import fitz  # PyMuPDF
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.main import app
from app.models.user import UserModel
from app.services.resume_service import UPLOADS_DIR, sanitize_filename


VALID_RESUME_TEXT = """
Alex Mercer
alex.mercer@example.com | (555) 234-5678 | San Francisco, CA
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

PROFESSIONAL SUMMARY
Senior Fullstack Engineer with 5+ years of experience building scalable distributed web applications.

WORK EXPERIENCE
Senior Fullstack Engineer | Stripe
Jun 2021 - Present
• Architected high-throughput payment webhook processing system scaling to 50k requests/sec.
• Optimized PostgreSQL query execution plans, reducing p99 latency by 42%.
• Spearheaded migration of legacy services to Kubernetes and Go microservices.

Software Engineer | Uber
Jan 2019 - May 2021
• Developed real-time dispatch matching algorithm in Python and React.
• Increased system reliability to 99.99% uptime through automated canary deployments.

TECHNICAL PROJECTS
GetHire AI Platform (React, TypeScript, FastAPI, MongoDB)
• Built automated AI interview simulation and resume intelligence analysis engine.
• Reduced candidate onboarding drop-off by 28% through interactive workflows.

EDUCATION
Stanford University
Bachelor of Science in Computer Science | 2015 - 2019
GPA: 3.85

CERTIFICATIONS
AWS Certified Solutions Architect (2022)
Certified Kubernetes Administrator (2023)

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, Go, SQL, HTML, CSS
Frameworks: React, FastAPI, Node.js, Next.js, Express, Tailwind CSS
Databases & Tools: MongoDB, PostgreSQL, Redis, Docker, Kubernetes, Git, AWS
"""


def generate_valid_pdf_bytes(text: str = VALID_RESUME_TEXT) -> bytes:
    """Generate a valid, parseable PDF binary document using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# ── In-Memory Database Mocks ─────────────────────────────────────────────────

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
            doc_val = doc.get(k)
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

class TestFileUploadSecurity(unittest.IsolatedAsyncioTestCase):
    """Verifies all security, validation, and authorization controls on file uploads and downloads."""

    def setUp(self) -> None:
        app.dependency_overrides.clear()

        self.user_a_id = "507f1f77bcf86cd799439001"
        self.user_b_id = "507f1f77bcf86cd799439002"
        self.admin_id = "507f1f77bcf86cd799439003"

        now = datetime.now(timezone.utc)

        self.user_a = UserModel(
            _id=ObjectId(self.user_a_id),
            email="usera@example.com",
            full_name="User Alpha",
            password_hash="hash_a",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=now,
            updated_at=now,
        )

        self.user_b = UserModel(
            _id=ObjectId(self.user_b_id),
            email="userb@example.com",
            full_name="User Beta",
            password_hash="hash_b",
            role="candidate",
            status="active",
            is_verified=True,
            created_at=now,
            updated_at=now,
        )

        self.admin_user = UserModel(
            _id=ObjectId(self.admin_id),
            email="admin@example.com",
            full_name="Admin Security",
            password_hash="hash_admin",
            role="admin",
            status="active",
            is_verified=True,
            created_at=now,
            updated_at=now,
        )

        self.mock_db = MockDatabase({
            "users": MockCollection([
                self.user_a.model_dump(by_alias=True),
                self.user_b.model_dump(by_alias=True),
                self.admin_user.model_dump(by_alias=True),
            ]),
            "resumes": MockCollection([]),
            "audit_logs": MockCollection([]),
        })

        self.created_files = []
        from app.middleware.rate_limit import in_memory_rate_limiter
        in_memory_rate_limiter._records.clear()

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        for f in self.created_files:
            try:
                if os.path.isfile(f):
                    os.remove(f)
                elif os.path.isdir(f):
                    shutil.rmtree(f, ignore_errors=True)
            except OSError:
                pass
        # Clean user_a upload dir if created
        user_a_dir = UPLOADS_DIR / self.user_a_id
        if user_a_dir.exists():
            shutil.rmtree(user_a_dir, ignore_errors=True)
        user_b_dir = UPLOADS_DIR / self.user_b_id
        if user_b_dir.exists():
            shutil.rmtree(user_b_dir, ignore_errors=True)

    # ── 1. Valid Upload ─────────────────────────────────────────────────────

    async def test_01_valid_upload_success(self):
        """Valid PDF upload is stored safely, ownership is recorded, and quality scored."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        pdf_bytes = generate_valid_pdf_bytes()

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                files = {
                    "file": ("alex_mercer_resume.pdf", pdf_bytes, "application/pdf")
                }
                res = await client.post("/api/v1/resume/upload", files=files)

                self.assertEqual(res.status_code, 201)
                data = res.json()
                self.assertTrue(data["success"])
                resume_info = data["data"]["resume"]

                self.assertEqual(resume_info["filename"], "alex_mercer_resume.pdf")
                self.assertEqual(resume_info["user_id"], self.user_a_id)
                self.assertEqual(resume_info["status"], "completed")
                self.assertGreater(resume_info["quality_score"]["overall_score"], 60)

                # Check database record
                db_doc = await self.mock_db["resumes"].find_one({"_id": ObjectId(resume_info["id"])})
                self.assertIsNotNone(db_doc)
                self.assertEqual(db_doc["user_id"], self.user_a_id)
                self.assertEqual(db_doc["filename"], "alex_mercer_resume.pdf")

                # Verify file on disk is stored strictly inside UPLOADS_DIR / user_id
                file_path = Path(db_doc["file_path"]).resolve()
                self.assertTrue(file_path.exists())
                self.assertTrue(file_path.is_relative_to(UPLOADS_DIR))
                self.assertTrue(file_path.is_relative_to(UPLOADS_DIR / self.user_a_id))
                self.created_files.append(str(file_path))

    # ── 2. Unsupported Extension ────────────────────────────────────────────

    async def test_02_unsupported_extension_rejected(self):
        """Files with unsupported extensions (.docx, .sh, .exe, .txt) are rejected with 415."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                for bad_ext, filename in [
                    (".docx", "resume.docx"),
                    (".sh", "deploy_script.sh"),
                    (".exe", "installer.exe"),
                    (".txt", "notes.txt"),
                ]:
                    files = {
                        "file": (filename, b"dummy content", "application/pdf")
                    }
                    res = await client.post("/api/v1/resume/upload", files=files)
                    self.assertEqual(
                        res.status_code,
                        415,
                        f"Expected 415 for extension {bad_ext}, got {res.status_code}",
                    )
                    data = res.json()
                    self.assertFalse(data["success"])
                    self.assertEqual(data["errors"][0]["code"], "INVALID_FILE_TYPE")

                # Verify no resumes were saved in database
                count = await self.mock_db["resumes"].count_documents()
                self.assertEqual(count, 0)

    # ── 3. Invalid MIME Type ────────────────────────────────────────────────

    async def test_03_invalid_mime_type_rejected(self):
        """Files with disallowed MIME types or mismatched magic headers are rejected with 415."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 3a. Disallowed Content-Type header
                for bad_mime in ["image/png", "text/plain", "application/octet-stream", "application/x-sh"]:
                    files = {
                        "file": ("resume.pdf", b"%PDF-1.4 mock pdf header", bad_mime)
                    }
                    res = await client.post("/api/v1/resume/upload", files=files)
                    self.assertEqual(
                        res.status_code,
                        415,
                        f"Expected 415 for MIME {bad_mime}, got {res.status_code}",
                    )
                    data = res.json()
                    self.assertFalse(data["success"])
                    self.assertEqual(data["errors"][0]["code"], "INVALID_MIME_TYPE")

                # 3b. Declared application/pdf MIME type, but binary body lacks %PDF magic signature
                fake_pdf_files = {
                    "file": ("resume.pdf", b"NOT_A_PDF_PLAIN_TEXT_CONTENT", "application/pdf")
                }
                res_fake = await client.post("/api/v1/resume/upload", files=fake_pdf_files)
                self.assertEqual(res_fake.status_code, 415)
                data_fake = res_fake.json()
                self.assertFalse(data_fake["success"])
                self.assertEqual(data_fake["errors"][0]["code"], "INVALID_MIME_TYPE")

    # ── 4. Oversized File ───────────────────────────────────────────────────

    async def test_04_oversized_file_rejected(self):
        """Files exceeding 10MB limit are rejected with 413 and cleanly unlinked from disk."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a

        # 10MB + 1024 bytes
        large_content = b"%PDF-1.4\n" + b"X" * (10 * 1024 * 1024 + 1024)

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                files = {
                    "file": ("large_resume.pdf", large_content, "application/pdf")
                }
                res = await client.post("/api/v1/resume/upload", files=files)

                self.assertEqual(res.status_code, 413)
                data = res.json()
                self.assertFalse(data["success"])
                self.assertEqual(data["errors"][0]["code"], "FILE_TOO_LARGE")

                # Verify no file remains on disk
                user_a_dir = UPLOADS_DIR / self.user_a_id
                if user_a_dir.exists():
                    self.assertEqual(len(list(user_a_dir.iterdir())), 0)

    # ── 5. Empty File ───────────────────────────────────────────────────────

    async def test_05_empty_file_rejected(self):
        """0-byte empty file upload is rejected with 400 Bad Request and EMPTY_FILE code."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                files = {
                    "file": ("empty.pdf", b"", "application/pdf")
                }
                res = await client.post("/api/v1/resume/upload", files=files)

                self.assertEqual(res.status_code, 400)
                data = res.json()
                self.assertFalse(data["success"])
                self.assertEqual(data["errors"][0]["code"], "EMPTY_FILE")

                # Verify no file remains on disk
                user_a_dir = UPLOADS_DIR / self.user_a_id
                if user_a_dir.exists():
                    self.assertEqual(len(list(user_a_dir.iterdir())), 0)

    # ── 6. Invalid Filename & Sanitization ──────────────────────────────────

    async def test_06_invalid_filename_rejected_and_sanitized(self):
        """Path traversal, null bytes, and empty stem filenames are rejected with 400."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        pdf_bytes = generate_valid_pdf_bytes()

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 6a. Path traversal attempts
                for bad_name in [
                    "../../../../etc/passwd.pdf",
                    "../resume.pdf",
                    "subdir/resume.pdf",
                ]:
                    files = {"file": (bad_name, pdf_bytes, "application/pdf")}
                    res = await client.post("/api/v1/resume/upload", files=files)
                    self.assertEqual(res.status_code, 400, f"Expected 400 for filename: {bad_name}")
                    self.assertEqual(res.json()["errors"][0]["code"], "INVALID_FILENAME")

                # 6b. Null bytes and control characters
                files_null = {"file": ("evil\x00resume.pdf", pdf_bytes, "application/pdf")}
                res_null = await client.post("/api/v1/resume/upload", files=files_null)
                self.assertEqual(res_null.status_code, 400)
                self.assertEqual(res_null.json()["errors"][0]["code"], "INVALID_FILENAME")

                # 6c. Dot-only or empty stem
                for empty_name in [".pdf", "   .pdf", "....pdf"]:
                    files_empty = {"file": (empty_name, pdf_bytes, "application/pdf")}
                    res_empty = await client.post("/api/v1/resume/upload", files=files_empty)
                    self.assertEqual(res_empty.status_code, 400)
                    self.assertEqual(res_empty.json()["errors"][0]["code"], "INVALID_FILENAME")

                # 6d. Valid filename with spaces and punctuation is SANITIZED properly
                files_special = {"file": ("Alex Mercer (2025) [Fullstack].pdf", pdf_bytes, "application/pdf")}
                res_special = await client.post("/api/v1/resume/upload", files=files_special)
                self.assertEqual(res_special.status_code, 201)
                sanitized_name = res_special.json()["data"]["resume"]["filename"]
                self.assertEqual(sanitized_name, "Alex_Mercer__2025___Fullstack.pdf")

        # 6e. Direct sanitize_filename function tests covering Windows separators and edge cases
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx_win:
            sanitize_filename("c:\\windows\\system32\\calc.pdf")
        self.assertEqual(ctx_win.exception.status_code, 400)
        self.assertEqual(ctx_win.exception.detail["errors"][0]["code"], "INVALID_FILENAME")

        with self.assertRaises(HTTPException) as ctx_null:
            sanitize_filename("evil\x00resume.pdf")
        self.assertEqual(ctx_null.exception.status_code, 400)

        with self.assertRaises(HTTPException) as ctx_empty:
            sanitize_filename("")
        self.assertEqual(ctx_empty.exception.status_code, 400)

    # ── 7. Authorized Download & Preview ────────────────────────────────────

    async def test_07_authorized_download_and_preview(self):
        """Owner and Administrator can download and preview the uploaded PDF resume."""
        pdf_bytes = generate_valid_pdf_bytes()

        # Upload resume as User A
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res_up = await client.post(
                    "/api/v1/resume/upload",
                    files={"file": ("my_resume.pdf", pdf_bytes, "application/pdf")},
                )
                self.assertEqual(res_up.status_code, 201)
                resume_id = res_up.json()["data"]["resume"]["id"]

                # 7a. User A (Owner) downloads file
                res_dl = await client.get(f"/api/v1/resume/{resume_id}/download")
                self.assertEqual(res_dl.status_code, 200)
                self.assertEqual(res_dl.headers["content-type"], "application/pdf")
                self.assertIn('attachment; filename="my_resume.pdf"', res_dl.headers.get("content-disposition", ""))
                self.assertEqual(res_dl.content, pdf_bytes)

                # 7b. User A (Owner) previews file inline
                res_pv = await client.get(f"/api/v1/resume/{resume_id}/preview")
                self.assertEqual(res_pv.status_code, 200)
                self.assertEqual(res_pv.headers["content-type"], "application/pdf")
                self.assertIn('inline; filename="my_resume.pdf"', res_pv.headers.get("content-disposition", ""))
                self.assertEqual(res_pv.content, pdf_bytes)

                # 7c. Administrator downloads file
                app.dependency_overrides[get_current_active_user] = lambda: self.admin_user
                res_admin_dl = await client.get(f"/api/v1/resume/{resume_id}/download")
                self.assertEqual(res_admin_dl.status_code, 200)
                self.assertEqual(res_admin_dl.content, pdf_bytes)

                # 7d. Administrator previews file
                res_admin_pv = await client.get(f"/api/v1/resume/{resume_id}/preview")
                self.assertEqual(res_admin_pv.status_code, 200)
                self.assertEqual(res_admin_pv.content, pdf_bytes)

    # ── 8. Unauthorized Download & Preview ──────────────────────────────────

    async def test_08_unauthorized_download_and_preview_rejected(self):
        """Another user (User B) or unauthenticated request cannot download or preview User A's file."""
        pdf_bytes = generate_valid_pdf_bytes()

        # Upload as User A
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res_up = await client.post(
                    "/api/v1/resume/upload",
                    files={"file": ("private_resume.pdf", pdf_bytes, "application/pdf")},
                )
                self.assertEqual(res_up.status_code, 201)
                resume_id = res_up.json()["data"]["resume"]["id"]

                # 8a. User B (different user) attempts to download User A's resume -> 404
                app.dependency_overrides[get_current_active_user] = lambda: self.user_b
                res_b_dl = await client.get(f"/api/v1/resume/{resume_id}/download")
                self.assertEqual(res_b_dl.status_code, 404)

                # 8b. User B attempts to preview User A's resume -> 404
                res_b_pv = await client.get(f"/api/v1/resume/{resume_id}/preview")
                self.assertEqual(res_b_pv.status_code, 404)

        # 8c. Unauthenticated request (no auth dependency override) -> 401
        app.dependency_overrides.clear()
        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res_unauth_dl = await client.get(f"/api/v1/resume/{resume_id}/download")
                self.assertEqual(res_unauth_dl.status_code, 401)

                res_unauth_pv = await client.get(f"/api/v1/resume/{resume_id}/preview")
                self.assertEqual(res_unauth_pv.status_code, 401)

    # ── 9. Corrupted File Handling ──────────────────────────────────────────

    async def test_09_corrupted_file_handling(self):
        """Files with %PDF header but malformed/corrupted internal structure return 422 CORRUPTED_PDF."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a

        # %PDF magic header followed by corrupt binary data that PyMuPDF cannot parse
        corrupted_content = b"%PDF-1.4\ncorrupted_xref_stream_garbage_###!!!\n%%EOF"

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                files = {
                    "file": ("corrupted.pdf", corrupted_content, "application/pdf")
                }
                res = await client.post("/api/v1/resume/upload", files=files)

                self.assertEqual(res.status_code, 422)
                data = res.json()
                self.assertFalse(data["success"])
                self.assertEqual(data["errors"][0]["code"], "CORRUPTED_PDF")

                # Verify corrupted file was unlinked and no records saved
                user_a_dir = UPLOADS_DIR / self.user_a_id
                if user_a_dir.exists():
                    self.assertEqual(len(list(user_a_dir.iterdir())), 0)
                count = await self.mock_db["resumes"].count_documents()
                self.assertEqual(count, 0)

    # ── 10. Path Containment Enforcement ────────────────────────────────────

    async def test_10_path_containment_prevents_arbitrary_file_read(self):
        """Attempting to preview or download a file path outside UPLOADS_DIR is blocked with 403."""
        app.dependency_overrides[get_current_active_user] = lambda: self.user_a

        # Forge a resume document in DB pointing outside uploads dir
        now = datetime.now(timezone.utc)
        forged_resume_id = "607f1f77bcf86cd799439099"
        await self.mock_db["resumes"].insert_one({
            "_id": ObjectId(forged_resume_id),
            "user_id": self.user_a_id,
            "filename": "passwd.pdf",
            "file_path": "/etc/passwd",
            "file_size_bytes": 100,
            "version": 1,
            "status": "completed",
            "created_at": now,
            "updated_at": now,
        })

        with patch.object(mongo_manager, "get_database", return_value=self.mock_db):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                res_dl = await client.get(f"/api/v1/resume/{forged_resume_id}/download")
                self.assertEqual(res_dl.status_code, 403)
                self.assertEqual(res_dl.json()["errors"][0]["code"], "PATH_TRAVERSAL_DETECTED")

                res_pv = await client.get(f"/api/v1/resume/{forged_resume_id}/preview")
                self.assertEqual(res_pv.status_code, 403)
                self.assertEqual(res_pv.json()["errors"][0]["code"], "PATH_TRAVERSAL_DETECTED")


if __name__ == "__main__":
    unittest.main()

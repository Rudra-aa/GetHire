"""
tests/test_resume_pipeline.py
-----------------------------
Comprehensive automated test suite for Phase 2: Resume Intelligence.
Built with standard unittest.IsolatedAsyncioTestCase.
"""

import io
import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId
from fastapi import UploadFile

from app.models.resume import (
    ExperienceItem,
    ParsedResumeData,
    PersonalInfo,
    ProjectItem,
    ResumeModel,
)
from app.services.resume_parser import parse_resume_text
from app.services.resume_scorer import calculate_resume_quality_score
from app.services.resume_service import (
    delete_resume,
    get_latest_resume_for_user,
    get_resume_by_id,
    process_and_store_resume,
)

SAMPLE_RESUME_TEXT = """
Alex Mercer
alex.mercer@example.com | (555) 234-5678 | San Francisco, CA
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

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


class TestResumePipeline(unittest.IsolatedAsyncioTestCase):

    def test_01_parse_resume_text_sections(self):
        parsed = parse_resume_text(SAMPLE_RESUME_TEXT)

        # Personal Info
        self.assertEqual(parsed.personal_info.name, "Alex Mercer")
        self.assertEqual(parsed.personal_info.email, "alex.mercer@example.com")
        self.assertIn("linkedin.com/in/alexmercer", parsed.personal_info.linkedin or "")
        self.assertIn("github.com/alexmercer", parsed.personal_info.github or "")

        # Skills & Tech
        self.assertTrue(len(parsed.skills) >= 5)
        self.assertIn("Python", parsed.skills)
        self.assertIn("React", parsed.skills)
        self.assertIn("TypeScript", parsed.skills)

        # Experience
        self.assertTrue(len(parsed.experience) >= 2)
        self.assertEqual(parsed.experience[0].company, "Stripe")
        self.assertEqual(parsed.experience[0].role, "Senior Fullstack Engineer")

        # Projects
        self.assertTrue(len(parsed.projects) >= 1)
        self.assertIn("GetHire", parsed.projects[0].title)

        # Education
        self.assertTrue(len(parsed.education) >= 1)
        self.assertIn("Stanford", parsed.education[0].institution)

        # Certifications
        self.assertTrue(len(parsed.certifications) >= 1)

    def test_02_calculate_resume_quality_score(self):
        parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
        score = calculate_resume_quality_score(SAMPLE_RESUME_TEXT, parsed, page_count=1)

        self.assertGreaterEqual(score.overall_score, 70)
        self.assertGreaterEqual(score.completeness_score, 80)
        self.assertGreaterEqual(score.skills_score, 80)
        self.assertGreaterEqual(score.impact_score, 70)
        self.assertTrue(len(score.strengths) >= 1)

    async def test_03_process_and_store_resume_flow(self):
        user_id = "507f1f77bcf86cd799439011"
        mock_db = MagicMock()
        mock_db.__getitem__.return_value.count_documents = AsyncMock(return_value=0)
        mock_db.__getitem__.return_value.insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("607f1f77bcf86cd799439022"))
        )
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        # Mock PDF UploadFile
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "alex_mercer_resume.pdf"
        mock_file.file = io.BytesIO(b"%PDF-1.4 mock pdf binary content")

        with patch("app.services.resume_service._pdf_service.extract_text") as mock_pdf_extract:
            mock_pdf_extract.return_value = MagicMock(
                text=SAMPLE_RESUME_TEXT,
                pages=1,
                filename="alex_mercer_resume.pdf",
            )

            resume = await process_and_store_resume(mock_db, user_id, mock_file)

            self.assertEqual(resume.user_id, user_id)
            self.assertEqual(resume.version, 1)
            self.assertEqual(resume.status, "completed")
            self.assertEqual(resume.parsed_data.personal_info.name, "Alex Mercer")
            self.assertGreaterEqual(resume.quality_score.overall_score, 70)
            mock_db.__getitem__.return_value.update_one.assert_called()

    async def test_04_get_latest_resume_for_user(self):
        user_id = "507f1f77bcf86cd799439011"
        sample_doc = {
            "_id": ObjectId("607f1f77bcf86cd799439022"),
            "user_id": user_id,
            "version": 2,
            "filename": "resume_v2.pdf",
            "file_path": "/tmp/resume.pdf",
            "file_size_bytes": 1024,
            "page_count": 1,
            "status": "completed",
            "raw_text": SAMPLE_RESUME_TEXT,
            "parsed_data": {
                "personal_info": {"name": "Alex Mercer", "email": "alex@example.com"},
                "skills": ["Python", "React"],
                "technologies": ["Docker", "MongoDB"],
                "experience": [],
                "projects": [],
                "education": [],
                "certifications": [],
            },
            "quality_score": {
                "overall_score": 85,
                "completeness_score": 90,
                "skills_score": 85,
                "impact_score": 80,
                "structure_score": 85,
                "strengths": ["Strong skills"],
                "improvements": ["Add metrics"],
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=sample_doc)

        result = await get_latest_resume_for_user(mock_db, user_id)
        self.assertIsNotNone(result)
        self.assertEqual(result.version, 2)
        self.assertEqual(result.filename, "resume_v2.pdf")

    async def test_05_delete_resume_flow(self):
        user_id = "507f1f77bcf86cd799439011"
        resume_id = "607f1f77bcf86cd799439022"

        sample_doc = {
            "_id": ObjectId(resume_id),
            "user_id": user_id,
            "file_path": "/nonexistent/path/file.pdf",
        }

        mock_db = MagicMock()
        mock_db.__getitem__.return_value.find_one = AsyncMock(return_value=sample_doc)
        mock_db.__getitem__.return_value.delete_one = AsyncMock()
        mock_db.__getitem__.return_value.count_documents = AsyncMock(return_value=0)
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        success = await delete_resume(mock_db, resume_id, user_id)
        self.assertTrue(success)
        mock_db.__getitem__.return_value.delete_one.assert_called()


if __name__ == "__main__":
    unittest.main()

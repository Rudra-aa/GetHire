"""
tests/test_resume_validation.py
--------------------------------
Comprehensive automated test suite for Resume Validation & False-Positive Prevention.
Tests that only authentic resumes/CVs are accepted and scored, while non-resume documents
(invoices, assignments, research papers, certificates, random PDFs) are strictly rejected.
"""

import io
import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from fastapi import HTTPException, UploadFile, status

from app.services.resume_service import process_and_store_resume
from app.services.resume_validator import (
    INVALID_RESUME_MESSAGE,
    validate_resume_document,
)

# ── FIXTURES: VALID RESUMES ─────────────────────────────────────────────────

VALID_ENGINEER_RESUME = """
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

VALID_STUDENT_RESUME = """
Jane Doe
jane.doe@university.edu | (555) 987-6543 | Boston, MA
https://github.com/janedoe | https://linkedin.com/in/janedoe

EDUCATION
Massachusetts Institute of Technology (MIT)
Bachelor of Science in Computer Science and Engineering
Expected Graduation: May 2025 | GPA: 3.92 / 4.0
Relevant Coursework: Data Structures, Algorithms, Operating Systems, Database Systems, Computer Networks

TECHNICAL SKILLS
Programming Languages: Java, Python, C++, C, SQL, JavaScript
Web & Frameworks: React, HTML5, CSS3, Flask, Node.js
Tools & Platforms: Git, GitHub, Linux, Docker, VS Code, Postman

TECHNICAL PROJECTS
Distributed Key-Value Store (Go, Raft Consensus, Docker)
• Implemented linearizable distributed key-value storage engine using Raft consensus protocol.
• Built automated fault tolerance testing harness simulating network partitions and node crashes.

Autonomous Maze Navigation Robot (C++, ROS, Python)
• Programmed real-time LiDAR sensor processing and path planning algorithms for mobile robot.
• Achieved 98% obstacle avoidance accuracy in dynamic unknown indoor environments.

LEADERSHIP & AWARDS
• MIT Hackathon First Place Winner (2024)
• Teaching Assistant for CS 101 - Introduction to Computer Science
"""

VALID_EXECUTIVE_RESUME = """
Robert Sterling
robert.sterling@execmail.com | +1 (212) 555-0199 | New York, NY
https://linkedin.com/in/robertsterling

EXECUTIVE PROFILE
Results-driven Technology Executive with 15+ years of leadership in cloud transformation, enterprise engineering, and AI adoption.

PROFESSIONAL EXPERIENCE
Vice President of Engineering | Global FinTech Corp
2018 - Present
• Led a globally distributed engineering organization of 140+ engineers across 4 international hubs.
• Oversaw $35M annual technology budget and reduced cloud infrastructure expenses by 24%.
• Directed enterprise migration to AWS cloud, delivering 99.999% platform availability.

Director of Software Engineering | Enterprise Cloud Solutions
2013 - 2018
• Built and scaled core SaaS billing platform from $10M to $120M in Annual Recurring Revenue.
• Mentored 8 engineering managers and instituted engineering excellence KPIs across 12 product teams.

EDUCATION
Columbia University
Master of Business Administration (MBA) | 2011 - 2013
Bachelor of Science in Electrical Engineering | 2005 - 2009

CORE COMPETENCIES & TECHNOLOGIES
Cloud Architecture, Agile Leadership, Strategic Planning, Microservices, Python, Java, AWS, Kubernetes, CI/CD
"""

# ── FIXTURES: NON-RESUME DOCUMENTS ──────────────────────────────────────────

INVOICE_DOCUMENT = """
TAX INVOICE
Acme Cloud Services Inc.
123 Tech Boulevard, Suite 400
San Francisco, CA 94107
support@acmecloud.com

INVOICE #: INV-2024-8849
INVOICE DATE: September 10, 2024
DUE DATE: October 10, 2024
PAYMENT TERMS: Net 30

BILL TO:
Global Logistics LLC
456 Industrial Way
Austin, TX 78701
accounts@globallogistics.com

ITEM DESCRIPTION                                 QTY    UNIT PRICE     TOTAL
Cloud Server Compute Hours (Linux 8-Core)       720       $0.45       $324.00
Managed PostgreSQL Database Instance (Primary)     1     $150.00       $150.00
Object Storage (500 GB Tier 1)                     1      $25.00        $25.00
Dedicated IP & Load Balancer Gateway               1      $40.00        $40.00

SUBTOTAL:                                                             $539.00
TAX (8.25%):                                                           $44.47
TOTAL AMOUNT DUE:                                                     $583.47

REMIT TO:
Bank of America, Account: 4892-1092-4401
Routing: 121000358
Thank you for your business!
"""

HOMEWORK_ASSIGNMENT_DOCUMENT = """
CS 301: Algorithms & Data Structures
Fall Semester 2024 | Department of Computer Science
Homework Assignment #4: Graph Algorithms and Dynamic Programming

Due Date: October 15, 2024 at 11:59 PM
Instructor: Professor David Miller | Teaching Assistant: Sarah Chen
Submit your solution via Gradescope as a single PDF file.
Total Points: 100

Instructions:
You must show all intermediate work and runtime complexity proofs for full credit. Collaboration is permitted under the course syllabus policy, but all submitted code and proofs must be your own.

Question 1: (25 Points) Shortest Paths
Given a directed graph G = (V, E) with non-negative edge weights w: E -> R+, modify Dijkstra's algorithm to compute the number of distinct shortest paths from source s to destination t in O(|E| + |V| log |V|) time. Provide pseudocode and prove its correctness using loop invariants.

Question 2: (35 Points) Dynamic Programming
Consider a variation of the Knapsack problem where each item has both a weight and a volume constraint. Formulate the recurrence relation, state the base cases, and give an O(n * W * V) algorithm in Python to find the optimal subset of items.

Question 3: (40 Points) Minimum Spanning Trees
Prove that if an edge e has the strictly minimum weight among all edges in a cut of connected graph G, then e must belong to every Minimum Spanning Tree of G.
"""

RESEARCH_PAPER_DOCUMENT = """
Deep Representation Learning for Low-Resource Neural Machine Translation
Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (ACL 2024)
doi: 10.18653/v1/2024.acl-long.412
arXiv: 2405.18942v1 [cs.CL]

Abstract
Neural machine translation (NMT) suffers from severe performance degradation in low-resource language pairs due to data scarcity. In this paper, we propose a cross-lingual representation alignment framework that leverages transfer learning from high-resource auxiliary languages. Our experimental results on the FLORES-200 benchmark demonstrate a +4.2 BLEU score improvement over baseline architectures.

1. Introduction
Modern natural language processing systems rely heavily on large-scale parallel corpora. However, over 90% of the world's 7,000 living languages lack sufficient parallel training corpora for supervised neural sequence-to-sequence models...

2. Related Work and Methodology
Recent advances in multilingual pretraining (Conneau et al., 2020) have shown promising results...

References
[1] A. Vaswani, N. Shazeer, N. Parmar, et al. "Attention Is All You Need." NeurIPS 2017.
[2] J. Devlin, M. Chang, K. Lee, and K. Toutanova. "BERT: Pre-training of Deep Bidirectional Transformers." NAACL 2019.
"""

CERTIFICATE_DOCUMENT = """
CERTIFICATE OF COMPLETION
This is to certify that
Michael Johnson
has successfully completed the online training course
Full-Stack Web Development Bootcamp (React, Node.js, Python)
Date of Issue: July 15, 2024
Certificate ID: CERT-89410-FSW
Authorized Signatory: TechAcademy Global Educational Services
"""

LEGAL_AGREEMENT_DOCUMENT = """
NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of January 15, 2024, by and between Alpha Corp, hereinafter referred to as the "Disclosing Party", and Beta Solutions LLC, hereinafter referred to as the "Receiving Party".

1. Confidential Information: The Receiving Party agrees to hold all proprietary trade secrets, technical specifications, and business plans in strict confidence.
2. Terms and Conditions: This Agreement shall remain in effect for a period of three (3) years from the effective date.
3. Governing Law and Jurisdiction: This Agreement shall be governed by the laws of the State of Delaware. All rights reserved.
"""

DECOY_KEYWORD_PROSE = """
Exploring the Future of Web Development in Modern Enterprises

In recent years, our technology consulting firm has gained extensive experience across various industry sectors. Our team has built deep skills in organizational transformation and cloud adoption. We believe that cultivating experience and acquiring practical skills are the most essential traits for modern engineering teams.

In this article, we reflect on our multi-year experience working with global enterprises. Developing strong communication skills and leadership experience enables companies to navigate technological disruption effectively.
"""

SHORT_EMPTY_DOCUMENT = """
Hello world. This is a short test document.
"""


# ── TEST SUITE ──────────────────────────────────────────────────────────────

class TestResumeValidation(unittest.IsolatedAsyncioTestCase):

    def test_01_valid_software_engineer_resume_accepted(self):
        result = validate_resume_document(VALID_ENGINEER_RESUME, page_count=1)
        self.assertTrue(result.is_valid)
        self.assertGreaterEqual(result.confidence_score, 0.60)
        self.assertIsNone(result.reason)
        self.assertIn("experience", result.detected_sections)
        self.assertIn("education", result.detected_sections)
        self.assertIn("skills", result.detected_sections)

    def test_02_valid_student_fresher_resume_accepted(self):
        result = validate_resume_document(VALID_STUDENT_RESUME, page_count=1)
        self.assertTrue(result.is_valid)
        self.assertGreaterEqual(result.confidence_score, 0.55)
        self.assertIsNone(result.reason)
        self.assertIn("education", result.detected_sections)
        self.assertIn("projects", result.detected_sections)
        self.assertIn("skills", result.detected_sections)

    def test_03_valid_executive_resume_accepted(self):
        result = validate_resume_document(VALID_EXECUTIVE_RESUME, page_count=2)
        self.assertTrue(result.is_valid)
        self.assertGreaterEqual(result.confidence_score, 0.60)
        self.assertIsNone(result.reason)
        self.assertIn("experience", result.detected_sections)
        self.assertIn("education", result.detected_sections)

    def test_04_invoice_document_rejected(self):
        result = validate_resume_document(INVOICE_DOCUMENT, page_count=1)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)
        self.assertIn("invoice_signature", result.negative_signals)

    def test_05_homework_assignment_rejected(self):
        result = validate_resume_document(HOMEWORK_ASSIGNMENT_DOCUMENT, page_count=2)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)
        self.assertIn("assignment_signature", result.negative_signals)

    def test_06_research_paper_rejected(self):
        result = validate_resume_document(RESEARCH_PAPER_DOCUMENT, page_count=6)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)
        self.assertIn("research_paper_signature", result.negative_signals)

    def test_07_certificate_document_rejected(self):
        result = validate_resume_document(CERTIFICATE_DOCUMENT, page_count=1)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)
        self.assertIn("standalone_certificate", result.negative_signals)

    def test_08_legal_agreement_rejected(self):
        result = validate_resume_document(LEGAL_AGREEMENT_DOCUMENT, page_count=2)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)
        self.assertIn("legal_or_policy", result.negative_signals)

    def test_09_decoy_keyword_prose_rejected(self):
        result = validate_resume_document(DECOY_KEYWORD_PROSE, page_count=1)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)

    def test_10_short_empty_document_rejected(self):
        result = validate_resume_document(SHORT_EMPTY_DOCUMENT, page_count=1)
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.reason)

    async def test_11_process_and_store_resume_rejects_non_resume_document(self):
        user_id = "507f1f77bcf86cd799439011"
        mock_db = MagicMock()
        mock_db.__getitem__.return_value.count_documents = AsyncMock(return_value=0)
        mock_db.__getitem__.return_value.insert_one = AsyncMock()
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "invoice_payment.pdf"
        mock_file.file = io.BytesIO(b"%PDF-1.4 mock invoice binary content")

        with patch("app.services.resume_service._pdf_service.extract_text") as mock_pdf_extract:
            mock_pdf_extract.return_value = MagicMock(
                text=INVOICE_DOCUMENT,
                pages=1,
                filename="invoice_payment.pdf",
            )

            with self.assertRaises(HTTPException) as ctx:
                await process_and_store_resume(mock_db, user_id, mock_file)

            self.assertEqual(ctx.exception.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
            detail = ctx.exception.detail
            self.assertFalse(detail["success"])
            self.assertEqual(detail["message"], INVALID_RESUME_MESSAGE)
            self.assertEqual(detail["errors"][0]["code"], "INVALID_RESUME_DOCUMENT")

            # Verify that NO database write or score calculation occurred
            mock_db.__getitem__.return_value.insert_one.assert_not_called()
            mock_db.__getitem__.return_value.update_one.assert_not_called()

    async def test_12_process_and_store_resume_accepts_valid_resume(self):
        user_id = "507f1f77bcf86cd799439011"
        mock_db = MagicMock()
        mock_db.__getitem__.return_value.count_documents = AsyncMock(return_value=0)
        mock_db.__getitem__.return_value.insert_one = AsyncMock(
            return_value=MagicMock(inserted_id=ObjectId("607f1f77bcf86cd799439022"))
        )
        mock_db.__getitem__.return_value.update_one = AsyncMock()

        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "alex_mercer_resume.pdf"
        mock_file.file = io.BytesIO(b"%PDF-1.4 mock resume content")

        with patch("app.services.resume_service._pdf_service.extract_text") as mock_pdf_extract:
            mock_pdf_extract.return_value = MagicMock(
                text=VALID_ENGINEER_RESUME,
                pages=1,
                filename="alex_mercer_resume.pdf",
            )

            resume = await process_and_store_resume(mock_db, user_id, mock_file)
            self.assertEqual(resume.user_id, user_id)
            self.assertEqual(resume.version, 1)
            self.assertEqual(resume.status, "completed")
            self.assertGreaterEqual(resume.quality_score.overall_score, 70)
            mock_db.__getitem__.return_value.insert_one.assert_called()
            mock_db.__getitem__.return_value.update_one.assert_called()


if __name__ == "__main__":
    unittest.main()

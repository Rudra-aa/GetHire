"""
tests/test_hirescore_engine.py
-------------------------------
Automated test suite for Phase 5: HireScore Engine & Career Intelligence Platform.
Tests HireScoreEngine, ReadinessEngine, BenchmarkEngine, GapAnalyzer,
RecommendationEngine, CareerRoadmap, and full pipeline integration.
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId

from app.models.evaluation import (
    DimensionScore,
    EvaluationModel,
    EvaluationScores,
    FollowUpRecommendation,
)
from app.models.resume import (
    ParsedResumeData,
    QualityScoreBreakdown,
    ResumeModel,
)
from app.services.hire_score_engine import (
    calculate_hirescore_components,
    compute_composite_hirescore,
    get_or_compute_user_hirescore,
)
from app.services.readiness_engine import evaluate_candidate_readiness
from app.services.benchmark_engine import calculate_industry_benchmark
from app.services.gap_analyzer import analyze_skill_gaps
from app.services.recommendation_engine import generate_recommendations
from app.services.career_roadmap import generate_career_roadmap

TEST_USER_ID = str(ObjectId())


def _build_mock_evaluations() -> list[EvaluationModel]:
    return [
        EvaluationModel(
            session_id="sess_123",
            question_id="q_1",
            user_id=TEST_USER_ID,
            overall_score=85,
            scores=EvaluationScores(
                overall=85,
                technical_accuracy=DimensionScore(score=88, explanation="Solid tech depth"),
                concept_coverage=DimensionScore(score=82, explanation="Good coverage"),
                problem_solving=DimensionScore(score=90, explanation="Structured decomposition"),
                communication=DimensionScore(score=84, explanation="Clear cadence"),
                completeness=DimensionScore(score=80, explanation="STAR complete"),
            ),
            strengths=["Excellent architectural decomposition", "STAR format followed"],
            weaknesses=["Could explore distributed replication strategies further"],
            recommended_improvements=["Review Redis eviction policies"],
        ),
        EvaluationModel(
            session_id="sess_123",
            question_id="q_2",
            user_id=TEST_USER_ID,
            overall_score=78,
            scores=EvaluationScores(
                overall=78,
                technical_accuracy=DimensionScore(score=76, explanation="Minor gaps in caching"),
                concept_coverage=DimensionScore(score=74, explanation="Missed cache invalidation"),
                problem_solving=DimensionScore(score=80, explanation="Good approach"),
                communication=DimensionScore(score=86, explanation="Well articulated"),
                completeness=DimensionScore(score=75, explanation="STAR followed"),
            ),
            strengths=["Strong communication"],
            weaknesses=["Omitted cache stampede prevention"],
            recommended_improvements=["Study distributed lock patterns"],
        ),
    ]


def _build_mock_resume() -> ResumeModel:
    return ResumeModel(
        user_id=ObjectId(TEST_USER_ID),
        filename="test_resume.pdf",
        file_path="/tmp/test.pdf",
        file_size_bytes=1024,
        parsed_data=ParsedResumeData(skills=["Python", "FastAPI", "PostgreSQL", "React"]),
        quality_score=QualityScoreBreakdown(
            overall_score=82,
            completeness_score=80,
            skills_score=85,
            impact_score=80,
            structure_score=80,
            strengths=["Strong tech ontology"],
            improvements=["Add more metrics"],
        ),
    )


class TestHireScoreEngine(unittest.IsolatedAsyncioTestCase):

    # ── 1. HireScore Component & Composite Tests ───────────────────────────

    def test_01_hirescore_components_calculation(self):
        evals = _build_mock_evaluations()
        resume = _build_mock_resume()

        components = calculate_hirescore_components(evals, resume)

        self.assertEqual(components.resume_quality, 82)
        self.assertEqual(components.technical_accuracy, 82)  # (88+76)/2
        self.assertEqual(components.problem_solving, 85)     # (90+80)/2
        self.assertEqual(components.communication, 85)       # (84+86)/2
        self.assertEqual(components.concept_coverage, 78)    # (82+74)/2
        self.assertEqual(components.star_structure, 77)      # (80+75)/2

    def test_02_composite_hirescore_weighting(self):
        evals = _build_mock_evaluations()
        resume = _build_mock_resume()
        components = calculate_hirescore_components(evals, resume)
        score = compute_composite_hirescore(components)

        self.assertIsInstance(score, int)
        self.assertGreaterEqual(score, 75)
        self.assertLessEqual(score, 90)

    # ── 2. Readiness Engine Tests ──────────────────────────────────────────

    def test_03_readiness_engine_verdict_and_confidence(self):
        evals = _build_mock_evaluations()
        resume = _build_mock_resume()
        components = calculate_hirescore_components(evals, resume)
        score = compute_composite_hirescore(components)

        readiness = evaluate_candidate_readiness(score, components, evals)

        self.assertGreaterEqual(readiness.readiness_percentage, 70)
        self.assertIn(readiness.verdict, ["Offer Ready", "Hire", "Borderline"])
        self.assertIn(readiness.confidence_level, ["High", "Medium", "Low"])
        self.assertTrue(len(readiness.summary) > 0)

    # ── 3. Benchmark Engine Tests ──────────────────────────────────────────

    def test_04_benchmark_percentile_and_bands(self):
        benchmark_mid = calculate_industry_benchmark(hirescore=85, experience_level="mid")
        self.assertEqual(benchmark_mid.target_level, "Mid")
        self.assertGreaterEqual(benchmark_mid.percentile, 80)
        self.assertEqual(benchmark_mid.band, "Top Tier")
        self.assertIn("Senior Ready", benchmark_mid.relative_position)

        benchmark_junior = calculate_industry_benchmark(hirescore=50, experience_level="entry")
        self.assertEqual(benchmark_junior.target_level, "Junior")
        self.assertLessEqual(benchmark_junior.percentile, 50)

    # ── 4. Gap Analyzer Tests ──────────────────────────────────────────────

    def test_05_gap_analyzer_identifies_and_ranks_gaps(self):
        evals = _build_mock_evaluations()
        resume = _build_mock_resume()

        gaps = analyze_skill_gaps(evals, resume)

        self.assertTrue(len(gaps) > 0)
        skill_names = [g.skill for g in gaps]
        self.assertTrue(any("Redis" in s or "Caching" in s for s in skill_names))
        
        self.assertGreaterEqual(gaps[0].impact_score, gaps[-1].impact_score)
        self.assertTrue(gaps[0].learning_hours > 0)
        self.assertTrue(len(gaps[0].recommended_resources) > 0)

    # ── 5. Recommendation Engine Tests ─────────────────────────────────────

    def test_06_recommendations_generation(self):
        evals = _build_mock_evaluations()
        resume = _build_mock_resume()
        gaps = analyze_skill_gaps(evals, resume)

        recs = generate_recommendations(gaps, evals, resume)

        self.assertTrue(len(recs.daily_tasks) > 0)
        self.assertTrue(len(recs.weekly_goals) > 0)
        self.assertTrue(len(recs.practice_questions) > 0)
        self.assertTrue(len(recs.resume_improvements) > 0)
        self.assertTrue(len(recs.project_suggestions) > 0)

    # ── 6. Career Roadmap Tests ────────────────────────────────────────────

    def test_07_career_roadmap_six_weeks_progression(self):
        evals = _build_mock_evaluations()
        resume = _build_mock_resume()

        roadmap = generate_career_roadmap(
            hirescore=80,
            readiness_percentage=78,
            evaluations=evals,
            resume=resume,
            total_sessions_completed=1,
        )

        self.assertEqual(len(roadmap), 6)
        weeks = [m.week for m in roadmap]
        self.assertEqual(weeks, [1, 2, 3, 4, 5, 6])
        
        statuses = [m.status for m in roadmap]
        self.assertIn("active", statuses)
        self.assertIn("completed", statuses)
        self.assertIn("upcoming", statuses)

    # ── 7. Full DB Pipeline Orchestration Mock Test ────────────────────────

    async def test_08_get_or_compute_user_hirescore_pipeline(self):
        db_mock = MagicMock()
        hirescore_col_mock = MagicMock()

        hirescore_col_mock.find_one = AsyncMock(return_value=None)
        hirescore_col_mock.insert_one = AsyncMock(return_value=MagicMock(inserted_id=ObjectId()))

        user_col = MagicMock()
        user_col.find_one = AsyncMock(return_value={"_id": ObjectId(TEST_USER_ID), "target_role": "Backend Engineer", "experience_level": "mid"})

        resume_col = MagicMock()
        resume_col.find_one = AsyncMock(return_value={
            "_id": ObjectId(),
            "user_id": ObjectId(TEST_USER_ID),
            "filename": "resume.pdf",
            "file_path": "/tmp/resume.pdf",
            "file_size_bytes": 1024,
            "parsed_data": {"skills": ["Python", "FastAPI"]},
            "quality_score": {
                "overall_score": 80,
                "completeness_score": 80,
                "skills_score": 85,
                "impact_score": 75,
                "structure_score": 80,
                "strengths": [],
                "improvements": [],
            },
        })

        eval_col = MagicMock()
        eval_cursor = MagicMock()
        eval_cursor.sort.return_value = eval_cursor
        eval_cursor.to_list = AsyncMock(return_value=[
            {
                "_id": ObjectId(),
                "session_id": "sess_1",
                "question_id": "q_1",
                "user_id": TEST_USER_ID,
                "overall_score": 82,
                "scores": {
                    "overall": 82,
                    "technical_accuracy": {"score": 85, "strengths": [], "weaknesses": [], "explanation": ""},
                    "concept_coverage": {"score": 80, "strengths": [], "weaknesses": [], "explanation": ""},
                    "problem_solving": {"score": 85, "strengths": [], "weaknesses": [], "explanation": ""},
                    "communication": {"score": 80, "strengths": [], "weaknesses": [], "explanation": ""},
                    "completeness": {"score": 80, "strengths": [], "weaknesses": [], "explanation": ""},
                },
                "strengths": ["Clear STAR answer"],
                "weaknesses": [],
                "recommended_improvements": [],
                "follow_up": {"follow_up_required": False},
                "rubric_snapshot": {},
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        ])
        eval_col.find.return_value = eval_cursor

        sessions_col = MagicMock()
        sessions_col.count_documents = AsyncMock(return_value=2)

        def mock_db_getitem(name):
            if name == "hirescores":
                return hirescore_col_mock
            if name == "users":
                return user_col
            if name == "resumes":
                return resume_col
            if name == "evaluations":
                return eval_col
            if name == "interview_sessions":
                return sessions_col
            return MagicMock()

        db_mock.__getitem__.side_effect = mock_db_getitem

        model = await get_or_compute_user_hirescore(db_mock, TEST_USER_ID, force_recompute=True)

        self.assertIsNotNone(model)
        self.assertEqual(model.user_id, TEST_USER_ID)
        self.assertGreaterEqual(model.overall_score, 70)
        self.assertEqual(len(model.career_roadmap), 6)
        self.assertTrue(len(model.gaps) > 0)
        self.assertTrue(len(model.recommendations.daily_tasks) > 0)


if __name__ == "__main__":
    unittest.main()

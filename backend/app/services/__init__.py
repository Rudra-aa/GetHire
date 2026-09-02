"""
app/services/__init__.py
------------------------
Services package for GetHire.
"""

from app.services.auth_service import (
    authenticate_user,
    log_auth_event,
    logout_user,
    register_user,
    rotate_refresh_token,
)
from app.services.user_service import get_user_by_id, update_user_profile
from app.services.resume_service import (
    delete_resume,
    get_latest_resume_for_user,
    get_resume_by_id,
    process_and_store_resume,
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
from app.services.evaluation_service import (
    evaluate_and_store_answer,
    evaluate_session_all_answers,
    get_session_evaluations,
)
from app.services.keyword_engine import evaluate_keywords_and_concepts
from app.services.rubric_engine import build_rubric_for_question, evaluate_rubric
from app.services.communication_engine import analyze_communication
from app.services.followup_engine import determine_followup_recommendation

# Phase 5: HireScore & Career Intelligence Engine
from app.services.hire_score_engine import (
    calculate_hirescore_components,
    compute_composite_hirescore,
    get_or_compute_user_hirescore,
    get_user_hirescore_history,
)
from app.services.readiness_engine import evaluate_candidate_readiness
from app.services.benchmark_engine import calculate_industry_benchmark
from app.services.gap_analyzer import analyze_skill_gaps
from app.services.recommendation_engine import generate_recommendations
from app.services.career_roadmap import generate_career_roadmap

__all__ = [
    "register_user",
    "authenticate_user",
    "rotate_refresh_token",
    "logout_user",
    "log_auth_event",
    "get_user_by_id",
    "update_user_profile",
    "process_and_store_resume",
    "get_latest_resume_for_user",
    "get_resume_by_id",
    "delete_resume",
    "create_interview_plan",
    "generate_questions_from_plan",
    "create_interview_session",
    "get_interview_session",
    "update_session_state",
    "complete_interview_session",
    "get_user_interview_history",
    "save_interview_answer",
    "get_answers_for_session",
    "evaluate_and_store_answer",
    "evaluate_session_all_answers",
    "get_session_evaluations",
    "evaluate_keywords_and_concepts",
    "build_rubric_for_question",
    "evaluate_rubric",
    "analyze_communication",
    "determine_followup_recommendation",
    "calculate_hirescore_components",
    "compute_composite_hirescore",
    "get_or_compute_user_hirescore",
    "get_user_hirescore_history",
    "evaluate_candidate_readiness",
    "calculate_industry_benchmark",
    "analyze_skill_gaps",
    "generate_recommendations",
    "generate_career_roadmap",
]

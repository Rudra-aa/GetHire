"""
evaluation.py
-------------
FastAPI router for Answer Evaluation, Scoring, and Report Generation.

Endpoints:
    POST /api/v1/evaluate-answer  — Evaluate a single answer
    POST /api/v1/score            — Compute final weighted score
    POST /api/v1/report           — Generate PDF report
    GET  /api/v1/report/{id}      — Download the generated report
"""

from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse, FileResponse

from backend.database.session_store import (
    get_session, store_answer, get_answers,
    store_score, store_report_meta, get_report_meta,
)
from backend.models.schemas import (
    SubmitAnswerRequest, EvaluateAnswerResponse,
    ScoreRequest, ScoreResponse,
    ReportRequest,
)
from backend.services.evaluator_service import evaluate_answer
from backend.services.scoring_engine import (
    compute_overall_score, aggregate_answer_scores, generate_mock_emotion_scores
)
from backend.services.report_service import generate_report


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/v1", tags=["Evaluation"])


# ---------------------------------------------------------------------------
# Answer Evaluation
# ---------------------------------------------------------------------------

@router.post(
    "/evaluate-answer",
    summary="Evaluate a candidate's answer to an interview question",
    response_description="Technical score, communication score, and detailed feedback",
)
async def evaluate_candidate_answer(body: SubmitAnswerRequest) -> JSONResponse:
    """
    **Evaluate a single interview answer.**

    Scoring pipeline:
    1. Technical score — keyword matching against skill database
    2. Communication score — sentence structure, reasoning markers, depth
    3. Generate structured feedback (strengths + improvements)

    The evaluated answer is stored in the session for final scoring.
    """
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{body.session_id}' not found.",
        )

    # Run evaluation
    result = evaluate_answer(
        question=body.question_text,
        answer=body.answer_text,
        skill=body.skill,
        difficulty=body.difficulty,
    )

    # Build answer record for storage
    answer_record = {
        "question_id": body.question_id,
        "question_text": body.question_text,
        "answer_text": body.answer_text,
        "skill": body.skill,
        "difficulty": body.difficulty,
        "time_taken_seconds": body.time_taken_seconds,
        "technical_score": result.technical_score,
        "communication_score": result.communication_score,
        "feedback": result.feedback,
        "strengths": result.strengths,
        "improvements": result.improvements,
        "keywords_matched": result.keywords_matched,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Persist the evaluated answer
    store_answer(body.session_id, answer_record)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "question_id": body.question_id,
            "technical_score": result.technical_score,
            "communication_score": result.communication_score,
            "feedback": result.feedback,
            "strengths": result.strengths,
            "improvements": result.improvements,
            "keywords_matched": result.keywords_matched,
        },
    )


# ---------------------------------------------------------------------------
# Final Score
# ---------------------------------------------------------------------------

@router.post(
    "/score",
    summary="Compute the final weighted interview score",
    response_description="Overall score, component breakdown, and hiring recommendation",
)
async def compute_final_score(body: ScoreRequest) -> JSONResponse:
    """
    **Compute the final interview score using the TRD formula:**

    ```
    Overall = 0.50 × Technical + 0.20 × Communication
            + 0.15 × Face + 0.15 × Voice
    ```

    If face_score / voice_score are not provided, mock scores are computed
    from answer quality data (realistic simulation).

    **Recommendation thresholds:**
    - ≥ 80 → Strong Hire
    - 65–79 → Hire
    - 50–64 → Maybe
    - < 50 → No Hire
    """
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{body.session_id}' not found.",
        )

    answers = get_answers(body.session_id)

    # Use provided scores or compute averages from stored answers
    if answers and body.technical_score == 0:
        avg_tech, avg_comm = aggregate_answer_scores(answers)
    else:
        avg_tech = body.technical_score
        avg_comm = body.communication_score

    # Compute mock emotion scores from answer quality
    face_score, voice_score = generate_mock_emotion_scores(answers)
    if body.face_score:
        face_score = body.face_score
    if body.voice_score:
        voice_score = body.voice_score

    score_result = compute_overall_score(
        technical_score=avg_tech,
        communication_score=avg_comm,
        face_score=face_score,
        voice_score=voice_score,
    )

    score_data = {
        "session_id": body.session_id,
        "technical_score": score_result.technical_score,
        "communication_score": score_result.communication_score,
        "face_score": score_result.face_score,
        "voice_score": score_result.voice_score,
        "overall_score": score_result.overall_score,
        "recommendation": score_result.recommendation,
        "recommendation_color": score_result.recommendation_color,
        "component_breakdown": score_result.component_breakdown,
    }

    # Persist final score
    store_score(body.session_id, score_data)

    return JSONResponse(status_code=status.HTTP_200_OK, content=score_data)


@router.get(
    "/score/{session_id}",
    summary="Get the final score for a completed session",
)
async def get_final_score(session_id: str) -> JSONResponse:
    """Retrieve the final score for a completed interview session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )

    answers = get_answers(session_id)
    if not answers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No answers found for this session. Complete the interview first.",
        )

    avg_tech, avg_comm = aggregate_answer_scores(answers)
    face_score, voice_score = generate_mock_emotion_scores(answers)

    score_result = compute_overall_score(
        technical_score=avg_tech,
        communication_score=avg_comm,
        face_score=face_score,
        voice_score=voice_score,
    )

    score_data = {
        "session_id": session_id,
        "technical_score": score_result.technical_score,
        "communication_score": score_result.communication_score,
        "face_score": score_result.face_score,
        "voice_score": score_result.voice_score,
        "overall_score": score_result.overall_score,
        "recommendation": score_result.recommendation,
        "recommendation_color": score_result.recommendation_color,
        "component_breakdown": score_result.component_breakdown,
        "answers_evaluated": len(answers),
        "skills_covered": list({a.get("skill") for a in answers}),
    }

    return JSONResponse(status_code=status.HTTP_200_OK, content=score_data)


# ---------------------------------------------------------------------------
# PDF Report Generation
# ---------------------------------------------------------------------------

@router.post(
    "/report",
    summary="Generate a PDF interview report",
    response_description="Report metadata with download URL",
)
async def generate_pdf_report(body: ReportRequest) -> JSONResponse:
    """
    **Generate a comprehensive PDF interview report.**

    The report includes:
    - Candidate info and interview date
    - Score breakdown (technical / communication / emotion)
    - Per-question analysis with feedback
    - Final recommendation with justification

    Returns a report URL for downloading the PDF.
    """
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{body.session_id}' not found.",
        )

    answers = get_answers(body.session_id)
    candidate_name = body.candidate_name or session.get("candidate_name", "Candidate")

    # Compute score for report
    if answers:
        avg_tech, avg_comm = aggregate_answer_scores(answers)
        face_score, voice_score = generate_mock_emotion_scores(answers)
    else:
        avg_tech, avg_comm, face_score, voice_score = 0.0, 0.0, 65.0, 60.0

    score_result = compute_overall_score(
        technical_score=avg_tech,
        communication_score=avg_comm,
        face_score=face_score,
        voice_score=voice_score,
    )

    score_data = {
        "technical_score": score_result.technical_score,
        "communication_score": score_result.communication_score,
        "face_score": score_result.face_score,
        "voice_score": score_result.voice_score,
        "overall_score": score_result.overall_score,
        "recommendation": score_result.recommendation,
        "recommendation_color": score_result.recommendation_color,
    }

    # Generate PDF
    try:
        report_path = generate_report(
            session_id=body.session_id,
            candidate_name=candidate_name,
            skills_tested=session.get("skills", []),
            answers=answers,
            score_data=score_data,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {exc}",
        ) from exc

    generated_at = datetime.now(timezone.utc).isoformat()
    store_report_meta(body.session_id, str(report_path))

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "session_id": body.session_id,
            "report_filename": report_path.name,
            "download_url": f"/api/v1/report/download/{body.session_id}",
            "generated_at": generated_at,
            "overall_score": score_result.overall_score,
            "recommendation": score_result.recommendation,
        },
    )


@router.get(
    "/report/download/{session_id}",
    summary="Download the generated PDF report",
)
async def download_report(session_id: str) -> FileResponse:
    """Download the PDF report for a completed interview session."""
    meta = get_report_meta(session_id)
    if not meta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No report found. Generate the report first via POST /api/v1/report.",
        )

    report_path = Path(meta["path"])
    if not report_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found on disk. Please regenerate.",
        )

    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=f"GetHire_Report_{session_id[:8]}.pdf",
    )


# ---------------------------------------------------------------------------
# Answers endpoint (for results page)
# ---------------------------------------------------------------------------

@router.get(
    "/sessions/{session_id}/answers",
    summary="Get all evaluated answers for a session",
)
async def get_session_answers(session_id: str) -> JSONResponse:
    """Return all evaluated answers for the results page."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )

    answers = get_answers(session_id)
    return JSONResponse(content={
        "session_id": session_id,
        "answers": answers,
        "total": len(answers),
    })

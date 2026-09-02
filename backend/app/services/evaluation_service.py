"""
app/services/evaluation_service.py
----------------------------------
Evaluation Pipeline Orchestration Service for GetHire.
Coordinates KeywordEngine, RubricEngine, CommunicationEngine, and FollowUpEngine.
Calculates multidimensional STAR evaluation backed by real candidate transcripts and conversational turns.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.models.evaluation import (
    DimensionScore,
    EvaluationModel,
    EvaluationScores,
    FollowUpRecommendation,
)
from app.models.interview import InterviewQuestion, InterviewSessionModel
from app.services.communication_engine import analyze_communication
from app.services.followup_engine import determine_followup_recommendation
from app.services.interview_session_service import get_interview_session
from app.services.keyword_engine import evaluate_keywords_and_concepts, SYNONYM_MAP
from app.services.rubric_engine import build_rubric_for_question, evaluate_rubric

logger = get_logger(__name__)


def evaluate_single_answer_payload(
    question: InterviewQuestion,
    answer_text: str,
    turn_eval_data: Optional[Dict[str, Any]] = None,
) -> Tuple[EvaluationScores, int, List[str], List[str], List[str], FollowUpRecommendation, dict]:
    """
    Pure business evaluation pipeline for an answer against question criteria.
    Combines NLP keyword analysis, rubric scoring, communication analysis, and LLM turn evaluation.
    """
    word_count = len(answer_text.strip().split()) if answer_text else 0

    # 1. Keyword & Concept Analysis
    kw_result = evaluate_keywords_and_concepts(
        answer_text=answer_text,
        expected_concepts=question.expected_concepts or [],
        supplemental_keywords=[question.skill_targeted] if question.skill_targeted else [],
    )

    # 2. Rubric Construction & Evaluation
    rubric = build_rubric_for_question(question)
    rubric_result = evaluate_rubric(rubric, kw_result, word_count)

    # 3. Communication Linguistic Analysis
    comm_result = analyze_communication(answer_text)

    # Incorporate turn evaluation if available
    tech_score = rubric_result.technical_accuracy_score
    comm_score = comm_result.score
    prob_score = rubric_result.problem_solving_score
    concept_score = rubric_result.concept_coverage_score
    comp_score = rubric_result.completeness_score

    if turn_eval_data:
        turn_tech = turn_eval_data.get("technical_score")
        turn_comm = turn_eval_data.get("communication_score")
        if turn_tech is not None and turn_tech > 0:
            tech_score = int(round(tech_score * 0.4 + turn_tech * 0.6))
            prob_score = max(prob_score, int(round(turn_tech * 0.85)))
            concept_score = max(concept_score, int(round(turn_tech * 0.8)))
        if turn_comm is not None and turn_comm > 0:
            comm_score = int(round(comm_score * 0.4 + turn_comm * 0.6))

    # 4. Follow-up Recommendation
    followup = determine_followup_recommendation(question, kw_result, rubric_result, word_count)

    # 5. Composite Overall Score Calculation
    weights = rubric.scoring_weights
    raw_overall = (
        tech_score * weights.get("technical_accuracy", 0.35)
        + concept_score * weights.get("concept_coverage", 0.25)
        + prob_score * weights.get("problem_solving", 0.20)
        + comm_score * weights.get("communication", 0.10)
        + comp_score * weights.get("completeness", 0.10)
    )
    overall_score = int(round(min(100, max(0, raw_overall))))

    # 6. Assemble Dimension Scores with Evidence
    evidence_snippet = answer_text[:120] if answer_text else "No response provided"
    if turn_eval_data and turn_eval_data.get("evidence_quote"):
        evidence_snippet = turn_eval_data.get("evidence_quote")

    scores = EvaluationScores(
        overall=overall_score,
        technical_accuracy=DimensionScore(
            score=tech_score,
            strengths=rubric_result.technical_strengths if tech_score >= 60 else ["Demonstrated core technical understanding"],
            weaknesses=rubric_result.technical_weaknesses if tech_score < 75 else [],
            explanation=f"Technical accuracy evaluated at {tech_score}/100. Evidence: \"{evidence_snippet}\"",
        ),
        concept_coverage=DimensionScore(
            score=concept_score,
            strengths=rubric_result.concept_strengths if rubric_result.concept_strengths else [f"Discussed {question.skill_targeted or 'core domain'}"],
            weaknesses=rubric_result.concept_weaknesses if concept_score < 70 else [],
            explanation=rubric_result.concept_explanation if rubric_result.concept_explanation else f"Concept coverage evaluated at {concept_score}/100.",
        ),
        problem_solving=DimensionScore(
            score=prob_score,
            strengths=rubric_result.problem_solving_strengths if prob_score >= 60 else ["Structured reasoning provided"],
            weaknesses=rubric_result.problem_solving_weaknesses if prob_score < 75 else [],
            explanation=f"Problem solving evaluated at {prob_score}/100 based on architectural reasoning.",
        ),
        communication=DimensionScore(
            score=comm_score,
            strengths=comm_result.strengths if comm_score >= 60 else ["Clear technical articulation"],
            weaknesses=comm_result.weaknesses if comm_score < 75 else [],
            explanation=comm_result.explanation,
        ),
        completeness=DimensionScore(
            score=comp_score,
            strengths=rubric_result.completeness_strengths if comp_score >= 60 else ["Substantive verbal answer"],
            weaknesses=rubric_result.completeness_weaknesses if comp_score < 70 else [],
            explanation=rubric_result.completeness_explanation,
        ),
    )

    # 7. Aggregate Top Strengths, Weaknesses, and Improvements
    all_strengths = (
        scores.technical_accuracy.strengths
        + scores.concept_coverage.strengths
        + scores.problem_solving.strengths
        + scores.communication.strengths
    )
    all_weaknesses = (
        scores.technical_accuracy.weaknesses
        + scores.concept_coverage.weaknesses
        + scores.problem_solving.weaknesses
        + scores.communication.weaknesses
    )

    improvements = []
    if kw_result.missing_concepts:
        improvements.append(f"Incorporate additional domain concepts: {', '.join(kw_result.missing_concepts[:2])}")
    if comm_result.filler_count > 0:
        improvements.append("Reduce filler phrases by taking deliberate pauses")
    if word_count < 25:
        improvements.append("Elaborate on specific architectural tradeoffs and performance outcomes")

    rubric_snapshot = {
        "category": rubric.category,
        "difficulty": rubric.difficulty,
        "expected_concepts": rubric.expected_concepts,
        "passing_threshold": rubric.passing_threshold,
        "weights": rubric.scoring_weights,
    }

    return scores, overall_score, all_strengths, all_weaknesses, improvements, followup, rubric_snapshot


async def evaluate_and_store_answer(
    db: AsyncIOMotorDatabase,
    session_id: str,
    question_id: str,
    user_id: str,
    answer_text_override: Optional[str] = None,
) -> Optional[EvaluationModel]:
    """
    Perform evaluation for a question in a session and persist result in MongoDB.
    """
    session = await get_interview_session(db, session_id, user_id)
    if not session:
        doc = await db["interview_sessions"].find_one({"session_id": session_id})
        if not doc and ObjectId.is_valid(session_id):
            doc = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
        if doc:
            session = InterviewSessionModel(**doc)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    question = next((q for q in session.questions if q.id == question_id), None)
    q_index = next((i for i, q in enumerate(session.questions) if q.id == question_id), 0)

    if not question:
        question = InterviewQuestion(
            id=question_id,
            question_text="Technical architectural interview discussion.",
            category="Technical",
            difficulty="medium",
            expected_concepts=["Distributed Systems", "FastAPI", "Redis", "Architecture", "PostgreSQL"],
            skill_targeted="Architecture",
        )

    # 1. Resolve candidate answer text from DB sources
    answer_text = answer_text_override
    answer_doc_id: Optional[str] = None
    turn_eval_data: Optional[Dict[str, Any]] = None

    if not answer_text:
        ans_doc = await db["interview_answers"].find_one({"session_id": session_id, "question_id": question_id})
        if ans_doc and ans_doc.get("answer_text"):
            answer_doc_id = str(ans_doc["_id"])
            answer_text = ans_doc.get("answer_text", "")
            turn_eval_data = ans_doc.get("evaluation_result")

    if not answer_text:
        turn_doc = await db["turn_evaluations"].find_one({"session_id": session_id, "question_id": question_id})
        if not turn_doc:
            turn_doc = await db["turn_evaluations"].find_one({"session_id": session_id, "turn_index": q_index})
        if turn_doc:
            turn_eval_data = turn_doc
            answer_text = turn_doc.get("candidate_transcript", "")

    if not answer_text:
        raw_sess = await db["interview_sessions"].find_one({"$or": [{"_id": ObjectId(session_id) if ObjectId.is_valid(session_id) else None}, {"session_id": session_id}]})
        transcripts = raw_sess.get("transcripts", []) if raw_sess else []
        if q_index < len(transcripts):
            t_item = transcripts[q_index]
            if isinstance(t_item, dict):
                answer_text = t_item.get("candidate_transcript", "")
                turn_eval_data = t_item.get("evaluation")

    if not answer_text or not answer_text.strip() or "Candidate has joined the interview" in answer_text or "Please greet them" in answer_text:
        return None

    scores, overall, strengths, weaknesses, improvements, followup, rubric_snap = evaluate_single_answer_payload(
        question=question,
        answer_text=answer_text,
        turn_eval_data=turn_eval_data,
    )

    now = datetime.now(timezone.utc)
    eval_model = EvaluationModel(
        session_id=session_id,
        question_id=question_id,
        answer_id=answer_doc_id,
        user_id=user_id,
        scores=scores,
        overall_score=overall,
        strengths=strengths,
        weaknesses=weaknesses,
        recommended_improvements=improvements,
        follow_up=followup,
        rubric_snapshot=rubric_snap,
        created_at=now,
        updated_at=now,
    )

    filter_query = {"session_id": session_id, "question_id": question_id}
    await db["evaluations"].update_one(
        filter_query,
        {"$set": eval_model.model_dump(by_alias=True, exclude={"id"})},
        upsert=True,
    )

    saved_eval = await db["evaluations"].find_one(filter_query)
    eval_model.id = str(saved_eval["_id"])

    if answer_doc_id:
        await db["interview_answers"].update_one(
            {"_id": ObjectId(answer_doc_id)},
            {"$set": {"evaluation_result": {"overall_score": overall, "evaluated_at": now.isoformat()}}},
        )

    return eval_model


async def evaluate_session_all_answers(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> Tuple[List[EvaluationModel], int, Dict[str, int]]:
    """
    Batch evaluate all answered conversational turns in a session.
    Extracts real candidate answers from turn transcripts, questions asked by AI, and turn evaluations.
    """
    raw_sess = await db["interview_sessions"].find_one({"$or": [{"_id": ObjectId(session_id) if ObjectId.is_valid(session_id) else None}, {"session_id": session_id}]})
    if not raw_sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Interview session not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    transcripts = raw_sess.get("transcripts", [])
    target_role = raw_sess.get("target_role", "Senior Full-Stack Engineer")

    # Fetch candidate resume skills if available
    resume_doc = await db["resumes"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
    resume_skills = resume_doc.get("parsed_data", {}).get("skills", []) if resume_doc else []
    base_concepts = resume_skills if resume_skills else ["FastAPI", "Python", "React", "PostgreSQL", "Redis", "Distributed Systems"]

    evaluations: List[EvaluationModel] = []

    # 1. Process candidate turns from transcripts
    for i, t_item in enumerate(transcripts):
        if not isinstance(t_item, dict):
            continue
        cand_text = t_item.get("candidate_transcript", "")
        if not cand_text or not cand_text.strip():
            continue
        if "Candidate has joined the interview" in cand_text or "Please greet them" in cand_text:
            continue

        # Determine prompt asked prior to this candidate turn
        ai_prompt = "Technical architectural discussion."
        if i > 0 and isinstance(transcripts[i - 1], dict):
            ai_prompt = transcripts[i - 1].get("ai_response", ai_prompt)
        elif raw_sess.get("questions") and len(raw_sess["questions"]) > 0:
            ai_prompt = raw_sess["questions"][0].get("question_text", ai_prompt)

        # Expected concepts tailored to the specific question context
        concepts = []
        prompt_lower = ai_prompt.lower()
        if "cache" in prompt_lower or "redis" in prompt_lower or "invalidation" in prompt_lower:
            concepts = ["Caching / Redis", "Write-Through / Cache-Aside", "TTL / Expiration", "Invalidation / Consistency"]
        elif "kafka" in prompt_lower or "event" in prompt_lower or "consumer" in prompt_lower or "dlq" in prompt_lower:
            concepts = ["Kafka / Event-Driven", "Transactional Outbox", "Dead-Letter Queue (DLQ)", "Eventual Consistency"]
        elif "websocket" in prompt_lower or "scaling" in prompt_lower or "load balancer" in prompt_lower:
            concepts = ["WebSockets / PubSub", "Envoy / Load Balancer", "Sticky Sessions", "Connection Pooling"]
        elif "concurrency" in prompt_lower or "race" in prompt_lower or "locking" in prompt_lower or "sequencing" in prompt_lower:
            concepts = ["Distributed Locking / Redlock", "Lamport Timestamps", "Event Sequencing", "Eventual Consistency"]
        elif "fastapi" in prompt_lower or "parameter" in prompt_lower or "validation" in prompt_lower or "pydantic" in prompt_lower:
            concepts = ["FastAPI", "Pydantic Validation", "Async Handlers / asyncpg", "Envoy / Sticky Sessions"]
        elif "challenge" in prompt_lower or "architect" in prompt_lower or "microservice" in prompt_lower or "background" in prompt_lower:
            concepts = ["Distributed Microservices", "FastAPI / Python", "PostgreSQL / Database", "Redis / Kafka Caching"]
        else:
            concepts = base_concepts[:4] if base_concepts else ["System Architecture", "Backend APIs", "Data Flow", "Tradeoffs"]

        turn_q = InterviewQuestion(
            id=f"turn_{i}",
            position=i,
            category="Technical",
            difficulty="medium",
            question_text=ai_prompt[:200],
            expected_concepts=concepts,
            skill_targeted="Fullstack Architecture",
        )

        turn_eval_data = t_item.get("evaluation")
        if not turn_eval_data:
            turn_doc = await db["turn_evaluations"].find_one({"session_id": session_id, "turn_index": i})
            if turn_doc:
                turn_eval_data = turn_doc

        scores, overall, strengths, weaknesses, improvements, followup, rubric_snap = evaluate_single_answer_payload(
            question=turn_q,
            answer_text=cand_text,
            turn_eval_data=turn_eval_data,
        )

        now = datetime.now(timezone.utc)
        ev_model = EvaluationModel(
            session_id=session_id,
            question_id=f"turn_{i}",
            answer_id=None,
            user_id=user_id,
            scores=scores,
            overall_score=overall,
            strengths=strengths,
            weaknesses=weaknesses,
            recommended_improvements=improvements,
            follow_up=followup,
            rubric_snapshot=rubric_snap,
            created_at=now,
            updated_at=now,
        )

        filter_query = {"session_id": session_id, "question_id": f"turn_{i}"}
        await db["evaluations"].update_one(
            filter_query,
            {"$set": ev_model.model_dump(by_alias=True, exclude={"id"})},
            upsert=True,
        )
        saved = await db["evaluations"].find_one(filter_query)
        ev_model.id = str(saved["_id"])
        evaluations.append(ev_model)

    # 2. If transcripts were empty, check interview_answers or turn_evaluations
    if not evaluations:
        turn_docs = await db["turn_evaluations"].find({"session_id": session_id}).sort("turn_index", 1).to_list(50)
        for t_doc in turn_docs:
            cand_text = t_doc.get("candidate_transcript", "")
            if not cand_text or not cand_text.strip() or "Candidate has joined" in cand_text:
                continue
            turn_idx = t_doc.get("turn_index", 0)
            t_q = InterviewQuestion(
                id=f"turn_{turn_idx}",
                question_text=f"Technical Turn {turn_idx + 1}",
                category="Technical",
                difficulty="medium",
                expected_concepts=base_concepts + ["Distributed Systems", "Architecture"],
                skill_targeted="Architecture",
            )
            scores, overall, strengths, weaknesses, improvements, followup, rubric_snap = evaluate_single_answer_payload(
                question=t_q,
                answer_text=cand_text,
                turn_eval_data=t_doc,
            )
            now = datetime.now(timezone.utc)
            ev_model = EvaluationModel(
                session_id=session_id,
                question_id=f"turn_{turn_idx}",
                answer_id=None,
                user_id=user_id,
                scores=scores,
                overall_score=overall,
                strengths=strengths,
                weaknesses=weaknesses,
                recommended_improvements=improvements,
                follow_up=followup,
                rubric_snapshot=rubric_snap,
                created_at=now,
                updated_at=now,
            )
            filter_query = {"session_id": session_id, "question_id": f"turn_{turn_idx}"}
            await db["evaluations"].update_one(
                filter_query,
                {"$set": ev_model.model_dump(by_alias=True, exclude={"id"})},
                upsert=True,
            )
            saved = await db["evaluations"].find_one(filter_query)
            ev_model.id = str(saved["_id"])
            evaluations.append(ev_model)

    # 3. Compute composite averages across actually answered evaluations
    if not evaluations:
        logger.warning("[EVALUATION_INPUT] No candidate answers or transcripts found to evaluate", session_id=session_id)
        return [], 0, {
            "technical_accuracy": 0,
            "concept_coverage": 0,
            "problem_solving": 0,
            "communication": 0,
            "completeness": 0,
        }

    total_overall = sum(e.overall_score for e in evaluations)
    avg_overall = int(round(total_overall / len(evaluations)))

    avg_dims = {
        "technical_accuracy": int(round(sum(e.scores.technical_accuracy.score for e in evaluations) / len(evaluations))),
        "concept_coverage": int(round(sum(e.scores.concept_coverage.score for e in evaluations) / len(evaluations))),
        "problem_solving": int(round(sum(e.scores.problem_solving.score for e in evaluations) / len(evaluations))),
        "communication": int(round(sum(e.scores.communication.score for e in evaluations) / len(evaluations))),
        "completeness": int(round(sum(e.scores.completeness.score for e in evaluations) / len(evaluations))),
    }

    logger.info(
        "[EVALUATION_INPUT]",
        session_id=session_id,
        answered_evaluations=len(evaluations),
        avg_overall=avg_overall,
    )
    for dim_name, dim_score in avg_dims.items():
        logger.info(
            "[EVALUATION_DIMENSION]",
            dimension=dim_name,
            score=dim_score,
            session_id=session_id,
        )

    return evaluations, avg_overall, avg_dims


async def get_session_evaluations(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
) -> List[EvaluationModel]:
    """Retrieve all evaluation records for a session."""
    cursor = db["evaluations"].find({"session_id": session_id, "user_id": user_id}).sort("created_at", 1)
    docs = await cursor.to_list(length=100)
    return [EvaluationModel(**d) for d in docs]

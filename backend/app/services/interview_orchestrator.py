"""
app/services/interview_orchestrator.py
---------------------------------------
Central Interview Orchestrator for GetHire V3.2.
Owns session lifecycle, context aggregation via Candidate Intelligence Graph,
blueprint execution, turn evaluation, memory storage, and domain event publishing.

LOC Constraint: < 300 LOC
Single Responsibility: Interview Session Orchestration & Memory Control
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId

from app.core.event_bus import event_bus
from app.domains.candidate_graph.graph_service import candidate_graph_service
from app.domains.interview.personas import get_persona
from app.providers.gemini_live import gemini_live_provider
from app.services.interview_intelligence_engine import interview_intelligence_engine
from app.services.turn_evaluator import turn_evaluator
from app.core.logging import get_logger

logger = get_logger(__name__)


class InterviewOrchestrator:
    """Central Controller for GetHire Interview Sessions."""

    async def start_orchestrated_session(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        target_role: str = "Senior Full-Stack Engineer",
        persona_id: str = "lead_architect",
    ) -> Dict[str, Any]:
        """Initializes an orchestrated interview session with Candidate Intelligence Context."""
        candidate_graph = await candidate_graph_service.get_candidate_graph(db, user_id)
        persona = get_persona(persona_id).model_dump()

        session_id = f"sess_orch_{user_id[:8]}_{int(datetime.now(timezone.utc).timestamp())}"
        session_doc = {
            "id": session_id,
            "session_id": session_id,
            "user_id": user_id,
            "target_role": target_role,
            "persona": persona,
            "status": "running",
            "current_question_index": 0,
            "total_questions": 4,
            "elapsed_seconds": 0,
            "questions": [
                {
                    "id": "q1",
                    "position": 1,
                    "category": "System Architecture",
                    "question_text": f"Welcome! Let's discuss your experience as a {target_role}. What problem were you solving in your recent project, and what was your architecture role?",
                    "expected_concepts": ["FastAPI", "System Architecture", "Microservices"],
                },
                {
                    "id": "q2",
                    "position": 2,
                    "category": "Database & Caching",
                    "question_text": "How do you handle cache stampedes and database node failovers under high concurrency?",
                    "expected_concepts": ["Redis Sentinel", "XFetch", "Read Replicas"],
                },
            ],
            "answers": [],
            "transcripts": [],
            "started_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
        }

        await db["interview_sessions"].insert_one(session_doc)
        await event_bus.publish("InterviewStarted", {"session_id": session_id, "user_id": user_id})

        session_doc["id"] = session_id
        session_doc.pop("_id", None)
        return session_doc

    async def process_turn(
        self,
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: str,
        candidate_transcript: str,
    ) -> Dict[str, Any]:
        """Processes candidate answer turn, evaluates, decides next action via Intelligence Engine."""
        session = None
        if ObjectId.is_valid(session_id):
            try:
                session = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
            except Exception:
                session = None

        if not session:
            session = await db["interview_sessions"].find_one({"session_id": session_id})
            if not session:
                session = await db["interview_sessions"].find_one({"id": session_id})

        if not session:
            # Generate Gemini response even if session is unpersisted demo session
            ai_turn = await gemini_live_provider.generate_turn_response(
                session_id=session_id,
                current_prompt="Tell me about your architecture experience.",
                candidate_transcript=candidate_transcript,
                conversation_history=[],
                context_payload={"target_role": "Senior Full-Stack Engineer"},
            )
            
            if ai_turn.get("status") == "error":
                from fastapi import HTTPException
                raise HTTPException(status_code=503, detail=ai_turn.get("error", "AI Provider unavailable"))
                
            return {
                "session_id": session_id,
                "ai_response": ai_turn.get("ai_text"),
                "decision": {"action": "advance_question"},
                "status": "success",
            }

        curr_idx = session.get("current_question_index", 0)
        questions = session.get("questions", [])
        curr_q = questions[curr_idx] if curr_idx < len(questions) else (questions[0] if questions else {})

        # 1. Immediate Turn Evaluation
        logger.info("[INTERVIEW_RUNTIME] context_loaded", session_id=session_id, user_id=user_id)
        eval_result = await turn_evaluator.evaluate_turn(
            db=db,
            session_id=session_id,
            turn_index=curr_idx,
            question_id=curr_q.get("id", f"q_{curr_idx}"),
            candidate_transcript=candidate_transcript,
            expected_skills=curr_q.get("expected_concepts", []),
            rubric={},
        )

        # 2. Intelligence Engine Decision
        logger.info("[INTERVIEW_RUNTIME] blueprint_loaded", curr_idx=curr_idx)
        decision = interview_intelligence_engine.decide_next_action(
            current_question_index=curr_idx,
            total_questions=len(questions) if questions else 4,
            turn_evaluation=eval_result,
            rubric={},
        )

        # Fetch candidate skills from latest resume for deep context
        resume_doc = await db["resumes"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
        resume_skills = resume_doc.get("parsed_data", {}).get("skills", []) if resume_doc else []

        # 3. Generate AI Turn Speech/Text via Gemini Provider
        logger.info("[INTERVIEW_RUNTIME] provider_called", provider="gemini_live")
        ai_turn = await gemini_live_provider.generate_turn_response(
            session_id=session_id,
            current_prompt=curr_q.get("question_text", "Describe your technical architecture decisions."),
            candidate_transcript=candidate_transcript,
            conversation_history=session.get("transcripts", []),
            context_payload={
                "persona": session.get("persona", {}),
                "target_role": session.get("target_role", "Senior Full-Stack Engineer"),
                "skills": resume_skills if resume_skills else ["FastAPI", "React", "MongoDB", "Redis"],
            },
        )
        logger.info("[INTERVIEW_RUNTIME] provider_returned", status=ai_turn.get("status"))
        
        if ai_turn.get("status") == "error":
            from fastapi import HTTPException
            raise HTTPException(status_code=503, detail=ai_turn.get("error", "AI Provider unavailable"))

        # Update Session State & Answers in DB
        next_idx = decision.get("next_question_index", curr_idx + 1)
        qid = curr_q.get("id", f"q_{curr_idx}")
        
        # 1. Upsert answer document into interview_answers
        await db["interview_answers"].update_one(
            {"session_id": session_id, "question_id": qid},
            {
                "$set": {
                    "user_id": user_id,
                    "session_id": session_id,
                    "question_id": qid,
                    "turn_index": curr_idx,
                    "answer_text": candidate_transcript,
                    "evaluation_result": {
                        "technical_score": eval_result.get("technical_score", 80),
                        "communication_score": eval_result.get("communication_score", 80),
                        "verdict": eval_result.get("verdict", "Good"),
                        "evaluated_at": datetime.now(timezone.utc).isoformat(),
                    },
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

        # 2. Update interview_sessions state and transcripts
        await db["interview_sessions"].update_one(
            {"_id": session.get("_id")},
            {
                "$set": {
                    "current_question_index": next_idx,
                    "updated_at": datetime.now(timezone.utc),
                },
                "$push": {
                    "transcripts": {
                        "turn": curr_idx,
                        "question_id": qid,
                        "candidate_transcript": candidate_transcript,
                        "ai_response": ai_turn.get("ai_text"),
                        "evaluation": eval_result,
                    }
                },
            },
        )

        logger.info("[INTERVIEW_RUNTIME] response_serialized", session_id=session_id, turn_index=curr_idx)

        return {
            "session_id": session_id,
            "ai_response": ai_turn.get("ai_text"),
            "decision": decision,
            "evaluation": eval_result,
            "status": "success",
        }


# Singleton Instance
interview_orchestrator = InterviewOrchestrator()

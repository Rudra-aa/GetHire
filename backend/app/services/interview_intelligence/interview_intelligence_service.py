"""
app/services/interview_intelligence/interview_intelligence_service.py
-----------------------------------------------------------------------
Interview Intelligence Service & DB Persistence Manager.
Orchestrates Face Pipeline, Browser Integrity Pipeline, Camera & Mic Monitoring,
Session Health, Event Timeline, Integrity Score, and MongoDB persistence.

LOC Constraint: < 300 LOC
Single Responsibility: Interview Intelligence Session Lifecycle & Persistence
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.services.interview_intelligence.face_pipeline import face_pipeline
from app.services.interview_intelligence.browser_integrity_pipeline import browser_integrity_pipeline
from app.services.interview_intelligence.camera_monitor import camera_monitor
from app.services.interview_intelligence.microphone_monitor import microphone_monitor
from app.services.interview_intelligence.session_health import session_health_engine
from app.services.interview_intelligence.timeline_engine import intelligence_timeline_engine
from app.services.interview_intelligence.integrity_score_engine import integrity_score_engine

logger = get_logger(__name__)


class InterviewIntelligenceService:
    """Main service orchestrating real-time telemetry and session persistence."""

    async def start_session(self, db: AsyncIOMotorDatabase, user_id: str, session_id: str) -> Dict[str, Any]:
        """Initializes a new Interview Intelligence session."""
        session_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "status": "active",
            "started_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "integrity_score": 100,
            "events_count": 0,
            "telemetry_samples_count": 0,
        }

        await db["interview_intelligence_sessions"].update_one(
            {"session_id": session_id}, {"$set": session_doc}, upsert=True
        )
        logger.info("Interview Intelligence session started", session_id=session_id, user_id=user_id)
        return session_doc

    async def log_event(self, db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Logs an objective integrity event (tab switch, fullscreen exit, copy attempt, etc.)."""
        session_id = payload.get("session_id", "default")
        question_id = payload.get("question_id")
        timestamp_sec = float(payload.get("timestamp_sec", 0.0))

        processed = browser_integrity_pipeline.evaluate_browser_event(payload)
        event_record = intelligence_timeline_engine.format_event_log(
            event_type=processed["event_type"],
            title=processed["title"],
            severity=processed["severity"],
            description=processed["details"],
            timestamp_sec=timestamp_sec,
            duration_sec=processed["duration_sec"],
            question_id=question_id,
            metadata={"penalty_points": processed["penalty_points"]},
        )
        event_record["session_id"] = session_id
        event_record["user_id"] = user_id

        await db["interview_intelligence_events"].insert_one(event_record)

        # Recalculate session integrity score
        cursor = db["interview_intelligence_events"].find({"session_id": session_id})
        all_events = await cursor.to_list(length=500)
        score_res = integrity_score_engine.compute_integrity_score(all_events)

        await db["interview_intelligence_sessions"].update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                    "integrity_score": score_res["integrity_score"],
                    "events_count": len(all_events),
                }
            },
            upsert=True,
        )

        event_record["updated_integrity_score"] = score_res["integrity_score"]
        event_record.pop("_id", None)
        return event_record

    async def process_telemetry(self, db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Processes 1-second live telemetry batch from active webcam/mic/browser monitors."""
        session_id = payload.get("session_id", "default")

        face_res = face_pipeline.process_face_telemetry(payload)
        cam_res = camera_monitor.evaluate_camera_telemetry(payload)
        mic_res = microphone_monitor.evaluate_audio_telemetry(payload)
        health_res = session_health_engine.evaluate_session_health(payload)

        # Fetch integrity score
        sess = await db["interview_intelligence_sessions"].find_one({"session_id": session_id})
        integrity_val = sess.get("integrity_score", 100) if sess else 100

        telemetry = {
            "session_id": session_id,
            "timestamp_sec": float(payload.get("timestamp_sec", 0.0)),
            "face": face_res,
            "camera": cam_res,
            "microphone": mic_res,
            "health": health_res,
            "integrity_score": integrity_val,
        }

        await db["interview_intelligence_sessions"].update_one(
            {"session_id": session_id},
            {
                "$inc": {"telemetry_samples_count": 1},
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                    "latest_telemetry": telemetry,
                },
            },
            upsert=True,
        )
        return telemetry

    async def finish_session(self, db: AsyncIOMotorDatabase, session_id: str) -> Dict[str, Any]:
        """Finalizes Interview Intelligence session report."""
        cursor = db["interview_intelligence_events"].find({"session_id": session_id}).sort("timestamp_sec", 1)
        events = await cursor.to_list(length=500)
        for ev in events:
            ev["id"] = str(ev["_id"])
            ev.pop("_id", None)

        score_res = integrity_score_engine.compute_integrity_score(events)

        report = {
            "session_id": session_id,
            "status": "completed",
            "completed_at": datetime.now(timezone.utc),
            "integrity_score": score_res["integrity_score"],
            "integrity_rating": score_res["rating"],
            "total_events": len(events),
            "events": events,
            "event_counts": score_res["event_counts"],
        }

        await db["interview_intelligence_sessions"].update_one(
            {"session_id": session_id}, {"$set": report}
        )

        logger.info("Interview Intelligence session finished", session_id=session_id)
        return report


# Singleton instance
interview_intelligence_service = InterviewIntelligenceService()

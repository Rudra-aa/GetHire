"""
app/services/facesense/facesense_service.py
---------------------------------------------
FaceSense Core Service & DB Persistence Manager.
Orchestrates session lifecycle, frame/metric batch processing, sub-engine coordination,
behavioral event generation, and MongoDB storage for facesense_sessions and facesense_events.
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger
from app.services.facesense.emotion_engine import emotion_engine
from app.services.facesense.eye_contact_engine import eye_contact_engine
from app.services.facesense.head_pose_engine import head_pose_engine
from app.services.facesense.blink_engine import blink_engine
from app.services.facesense.attention_engine import attention_engine
from app.services.facesense.presence_engine import presence_engine
from app.services.facesense.confidence_engine import confidence_engine
from app.services.facesense.stress_engine import stress_engine
from app.services.facesense.timeline_engine import timeline_engine
from app.services.facesense.event_engine import event_engine

logger = get_logger(__name__)


class FaceSenseService:
    """Manages FaceSense sessions, real-time metric evaluation, and MongoDB persistence."""

    async def start_session(
        self, db: AsyncIOMotorDatabase, user_id: str, session_id: str
    ) -> Dict[str, Any]:
        """Initializes a new FaceSense session record."""
        session_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "status": "active",
            "started_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "total_frames_processed": 0,
            "samples": [],
            "overall_facescore": None,
            "avg_confidence": None,
            "avg_stress": None,
            "avg_eye_contact": None,
            "avg_attention": None,
            "avg_presence": None,
        }

        res = await db["facesense_sessions"].insert_one(session_doc)
        session_doc["id"] = str(res.inserted_id)
        logger.info("FaceSense session started", session_id=session_id, user_id=user_id)
        return session_doc

    async def process_metrics_batch(
        self, db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Processes a metric payload or frame landmark snapshot sent from frontend.
        Computes real-time scores across all FaceSense sub-engines based strictly on physical data.
        """
        session_id = payload.get("session_id", "default_session")
        question_id = payload.get("question_id")
        timestamp_sec = float(payload.get("timestamp_sec", 0.0))

        # 1. Base input metrics / landmarks from frontend
        pitch = float(payload.get("pitch", 0.0))
        yaw = float(payload.get("yaw", 0.0))
        roll = float(payload.get("roll", 0.0))
        face_visible = bool(payload.get("face_visible", True))
        eye_contact_in = payload.get("eye_contact_pct")
        blink_rate_in = payload.get("blink_rate_bpm")
        smile_pct = float(payload.get("smile_pct", 0.0))
        face_box = payload.get("face_box", [0.2, 0.1, 0.6, 0.7])

        # Emotion input or prediction
        emotion_label = payload.get("emotion_label", "Neutral")
        emotion_conf = float(payload.get("emotion_confidence", 0.85))

        # 2. Sub-engine calculations
        eye_metrics = eye_contact_engine.analyze_gaze(
            yaw=yaw, pitch=pitch, eye_contact_input=eye_contact_in, looking_away_duration_sec=payload.get("looking_away_duration_sec", 0.0)
        )
        head_metrics = head_pose_engine.analyze_head_pose(pitch=pitch, yaw=yaw, roll=roll)
        blink_metrics = blink_engine.analyze_blink_rate(blink_rate_input=blink_rate_in)
        att_metrics = attention_engine.compute_attention(
            face_visible=face_visible,
            eye_contact_pct=eye_metrics["eye_contact_score"],
            looking_away_duration_sec=eye_metrics["looking_away_duration_sec"],
            head_stability_score=head_metrics["head_stability_score"],
        )
        presence_metrics = presence_engine.evaluate_presence(
            face_box=tuple(face_box) if len(face_box) == 4 else (0.2, 0.1, 0.6, 0.7),
            face_visible=face_visible,
            head_stability_score=head_metrics["head_stability_score"],
        )
        conf_metrics = confidence_engine.compute_confidence(
            eye_contact_score=eye_metrics["eye_contact_score"],
            head_stability_score=head_metrics["head_stability_score"],
            smile_pct=smile_pct,
            emotion_label=emotion_label,
            emotion_confidence=emotion_conf,
        )
        stress_metrics = stress_engine.compute_stress(
            blink_rate_bpm=blink_metrics["blink_rate_bpm"],
            emotion_label=emotion_label,
            head_stability_score=head_metrics["head_stability_score"],
            eye_contact_score=eye_metrics["eye_contact_score"],
        )

        overall_facescore = round(
            (conf_metrics["confidence_score"] * 0.30)
            + (att_metrics["attention_score"] * 0.25)
            + (presence_metrics["presence_score"] * 0.20)
            + (eye_metrics["eye_contact_score"] * 0.15)
            + (max(0.0, 100.0 - stress_metrics["stress_score"]) * 0.10)
        )

        sample = {
            "timestamp_sec": timestamp_sec,
            "question_id": question_id,
            "emotion_label": emotion_label,
            "emotion_confidence": round(emotion_conf, 2),
            "eye_contact_score": eye_metrics["eye_contact_score"],
            "direction_status": eye_metrics["direction_status"],
            "head_stability_score": head_metrics["head_stability_score"],
            "pitch": head_metrics["pitch"],
            "yaw": head_metrics["yaw"],
            "roll": head_metrics["roll"],
            "blink_rate_bpm": blink_metrics["blink_rate_bpm"],
            "smile_pct": round(smile_pct, 1),
            "attention_score": att_metrics["attention_score"],
            "presence_score": presence_metrics["presence_score"],
            "confidence_score": conf_metrics["confidence_score"],
            "stress_score": stress_metrics["stress_score"],
            "overall_facescore": overall_facescore,
            "face_visible": face_visible,
        }

        # 3. Detect and insert behavioral events if state changed
        events = event_engine.evaluate_frame_events(sample, None, question_id, timestamp_sec)
        if events:
            for ev in events:
                ev["session_id"] = session_id
                ev["user_id"] = user_id
                await db["facesense_events"].insert_one(ev)

        # 4. Push sample to facesense_sessions
        await db["facesense_sessions"].update_one(
            {"session_id": session_id},
            {
                "$push": {"samples": sample},
                "$inc": {"total_frames_processed": 1},
                "$set": {
                    "session_id": session_id,
                    "user_id": user_id,
                    "updated_at": datetime.now(timezone.utc),
                    "overall_facescore": overall_facescore,
                    "avg_confidence": conf_metrics["confidence_score"],
                    "avg_stress": stress_metrics["stress_score"],
                    "avg_eye_contact": eye_metrics["eye_contact_score"],
                    "avg_attention": att_metrics["attention_score"],
                    "avg_presence": presence_metrics["presence_score"],
                },
            },
            upsert=True,
        )

        return sample

    async def finish_session(self, db: AsyncIOMotorDatabase, session_id: str) -> Dict[str, Any]:
        """Finalizes FaceSense session, aggregating full timeline & question analytics."""
        session_doc = await db["facesense_sessions"].find_one({"session_id": session_id})
        if not session_doc:
            return {"session_id": session_id, "status": "completed"}

        samples = session_doc.get("samples", [])
        timeline = timeline_engine.aggregate_timeline(samples)
        q_analytics = timeline_engine.correlate_questions(samples)

        if samples:
            avg_conf = round(sum(s.get("confidence_score", 0) for s in samples) / len(samples), 1)
            avg_stress = round(sum(s.get("stress_score", 0) for s in samples) / len(samples), 1)
            avg_eye = round(sum(s.get("eye_contact_score", 0) for s in samples) / len(samples), 1)
            avg_att = round(sum(s.get("attention_score", 0) for s in samples) / len(samples), 1)
            avg_pres = round(sum(s.get("presence_score", 0) for s in samples) / len(samples), 1)
            overall_fs = int(round(sum(s.get("overall_facescore", 0) for s in samples) / len(samples)))
        else:
            avg_conf = None
            avg_stress = None
            avg_eye = None
            avg_att = None
            avg_pres = None
            overall_fs = None

        summary = {
            "session_id": session_id,
            "status": "completed",
            "completed_at": datetime.now(timezone.utc),
            "total_frames_processed": len(samples),
            "overall_facescore": overall_fs,
            "avg_confidence": avg_conf,
            "avg_stress": avg_stress,
            "avg_eye_contact": avg_eye,
            "avg_attention": avg_att,
            "avg_presence": avg_pres,
            "timeline": timeline,
            "question_analytics": q_analytics,
        }

        await db["facesense_sessions"].update_one(
            {"session_id": session_id}, {"$set": summary}
        )

        logger.info("FaceSense session finished", session_id=session_id, total_samples=len(samples))
        return summary

    async def get_session_summary(self, db: AsyncIOMotorDatabase, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves session summary analytics."""
        doc = await db["facesense_sessions"].find_one({"session_id": session_id})
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        return doc


# Singleton instance
facesense_service = FaceSenseService()

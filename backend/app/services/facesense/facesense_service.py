"""
app/services/facesense/facesense_service.py
---------------------------------------------
FaceSense Core Service & DB Persistence Manager.
Orchestrates session lifecycle, frame/metric batch processing, sub-engine coordination,
behavioral event generation, non-verbal & verbal attitude synthesis, and MongoDB storage.
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from fastapi import HTTPException, status

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
from app.services.facesense.verbal_attitude_engine import verbal_attitude_engine

logger = get_logger(__name__)


class FaceSenseService:
    """Manages FaceSense sessions, real-time metric evaluation, and MongoDB persistence."""

    async def start_session(
        self,
        db: AsyncIOMotorDatabase,
        user_id: str,
        session_id: str,
        visual_analysis_enabled: bool = True,
    ) -> Dict[str, Any]:
        """Initializes a new FaceSense session record with candidate visual analysis preference."""
        int_sess = None
        if ObjectId.is_valid(session_id):
            int_sess = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
        if not int_sess:
            int_sess = await db["interview_sessions"].find_one({"session_id": session_id})

        if int_sess and str(int_sess.get("user_id")) != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")

        existing = await db["facesense_sessions"].find_one({"session_id": session_id})
        if existing and str(existing.get("user_id")) != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FaceSense session not found")

        data_quality_status = "sufficient" if visual_analysis_enabled else "disabled"
        data_quality_reason = None if visual_analysis_enabled else "Visual analysis was disabled by the candidate."

        session_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "status": "active",
            "started_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "visual_analysis_enabled": visual_analysis_enabled,
            "data_quality_status": data_quality_status,
            "data_quality_reason": data_quality_reason,
            "total_frames_processed": 0,
            "samples": [],
            "overall_facescore": None,
            "avg_confidence": None,
            "avg_stress": None,
            "avg_eye_contact": None,
            "avg_attention": None,
            "avg_presence": None,
            "camera_facing_consistency_pct": None,
            "posture_stability_pct": None,
            "expression_variation_score": None,
            "presentation_stability_score": None,
            "verbal_attitude_assessment": None,
            "strengths": [],
            "areas_for_improvement": [],
            "constructive_summary": None,
        }

        if existing:
            await db["facesense_sessions"].update_one(
                {"session_id": session_id},
                {"$set": {
                    "visual_analysis_enabled": visual_analysis_enabled,
                    "data_quality_status": data_quality_status,
                    "data_quality_reason": data_quality_reason,
                    "updated_at": datetime.now(timezone.utc),
                }}
            )
            session_doc["id"] = str(existing.get("_id"))
        else:
            res = await db["facesense_sessions"].insert_one(session_doc)
            session_doc["id"] = str(res.inserted_id)

        logger.info(
            "FaceSense session initialized",
            session_id=session_id,
            user_id=user_id,
            visual_analysis_enabled=visual_analysis_enabled,
        )
        return session_doc

    async def toggle_visual_analysis(
        self,
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: str,
        enabled: bool,
    ) -> Dict[str, Any]:
        """Dynamically enables or disables visual presentation analysis during an active interview."""
        query = {"session_id": session_id}
        doc = await db["facesense_sessions"].find_one(query)
        if not doc or str(doc.get("user_id")) != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FaceSense session not found")

        data_quality_status = "sufficient" if enabled else "disabled"
        data_quality_reason = None if enabled else "Visual analysis was disabled by the candidate."

        await db["facesense_sessions"].update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "visual_analysis_enabled": enabled,
                    "data_quality_status": data_quality_status,
                    "data_quality_reason": data_quality_reason,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        logger.info("FaceSense visual analysis toggled", session_id=session_id, enabled=enabled)
        return {
            "session_id": session_id,
            "visual_analysis_enabled": enabled,
            "status": "updated",
        }

    async def process_metrics_batch(
        self, db: AsyncIOMotorDatabase, user_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Processes a metric payload or frame landmark snapshot sent from frontend.
        Computes real-time presentation scores strictly on observable physical data.
        """
        session_id = payload.get("session_id", "default_session")
        question_id = payload.get("question_id")
        timestamp_sec = float(payload.get("timestamp_sec", 0.0))

        existing = await db["facesense_sessions"].find_one({"session_id": session_id})
        if existing and str(existing.get("user_id")) != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FaceSense session not found")

        # 1. Base input metrics / landmarks from frontend
        pitch = float(payload.get("pitch") if payload.get("pitch") is not None else 0.0)
        yaw = float(payload.get("yaw") if payload.get("yaw") is not None else 0.0)
        roll = float(payload.get("roll") if payload.get("roll") is not None else 0.0)
        face_visible = bool(payload.get("face_visible") if payload.get("face_visible") is not None else True)
        eye_contact_in = payload.get("eye_contact_pct")
        blink_rate_in = payload.get("blink_rate_bpm")
        smile_pct = float(payload.get("smile_pct") if payload.get("smile_pct") is not None else 0.0)
        face_box = payload.get("face_box") or [0.2, 0.1, 0.6, 0.7]

        # Candidate control & contextual flags
        is_thinking_pause = bool(payload.get("is_thinking_pause", False))
        multiple_faces_detected = bool(payload.get("multiple_faces_detected", False))
        lighting_condition = str(payload.get("lighting_condition") or "adequate")
        visual_analysis_enabled = bool(payload.get("visual_analysis_enabled", True))

        # Emotion input or prediction
        emotion_label = payload.get("emotion_label") or "Neutral"
        emotion_conf = float(payload.get("emotion_confidence") if payload.get("emotion_confidence") is not None else 0.85)

        # 2. Sub-engine calculations
        eye_metrics = eye_contact_engine.analyze_gaze(
            yaw=yaw,
            pitch=pitch,
            eye_contact_input=eye_contact_in,
            looking_away_duration_sec=float(payload.get("looking_away_duration_sec") or 0.0),
            is_thinking_pause=is_thinking_pause,
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
            face_box=tuple(face_box) if face_box and len(face_box) == 4 else (0.2, 0.1, 0.6, 0.7),
            face_visible=face_visible,
            head_stability_score=head_metrics["head_stability_score"],
        )

        # Posture stability derived from framing poise and head orientation stability
        posture_stability_score = round(
            (presence_metrics["presence_score"] * 0.55) + (head_metrics["head_stability_score"] * 0.45),
            1,
        )

        conf_metrics = confidence_engine.compute_confidence(
            eye_contact_score=eye_metrics["eye_contact_score"],
            head_stability_score=head_metrics["head_stability_score"],
            posture_stability_score=posture_stability_score,
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
            "posture_stability_score": posture_stability_score,
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
            "is_thinking_pause": is_thinking_pause,
            "multiple_faces_detected": multiple_faces_detected,
            "lighting_condition": lighting_condition,
            "visual_analysis_enabled": visual_analysis_enabled,
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

    async def finish_session(
        self,
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: Optional[str] = None,
        is_admin: bool = False,
    ) -> Dict[str, Any]:
        """
        Finalizes FaceSense session, aggregating full timeline, physical non-verbal presentation,
        and spoken verbal attitude analysis without ever making unsupported psychological claims.
        """
        query = {"session_id": session_id}
        if not is_admin and user_id:
            query["user_id"] = user_id

        session_doc = await db["facesense_sessions"].find_one(query)
        if not session_doc:
            return {
                "session_id": session_id,
                "status": "completed",
                "data_quality_status": "insufficient_data",
                "data_quality_reason": "No FaceSense session record found.",
            }

        samples = session_doc.get("samples", [])
        visual_analysis_enabled = session_doc.get("visual_analysis_enabled", True)

        # Retrieve spoken answers to synthesize verbal attitude and communication style
        transcripts: List[Dict[str, Any]] = []
        try:
            answers_cursor = db["interview_answers"].find({"session_id": session_id}).sort("started_at", 1)
            transcripts = await answers_cursor.to_list(length=100)
        except Exception as e:
            logger.warning("Could not fetch interview answers for verbal attitude analysis", exc=str(e))

        timeline = timeline_engine.aggregate_timeline(samples)
        q_analytics = timeline_engine.correlate_questions(samples)

        # Determine data sufficiency
        if not visual_analysis_enabled:
            data_quality_status = "disabled"
            data_quality_reason = "Visual presentation analysis was disabled by the candidate."
        elif len(samples) < 5:
            data_quality_status = "insufficient_data"
            data_quality_reason = "Insufficient camera data collected (minimum 5 continuous samples required)."
        else:
            data_quality_status = "sufficient"
            data_quality_reason = None

        if data_quality_status == "sufficient":
            avg_conf = round(sum(s.get("confidence_score", 0) for s in samples) / len(samples), 1)
            avg_stress = round(sum(s.get("stress_score", 0) for s in samples) / len(samples), 1)
            avg_eye = round(sum(s.get("eye_contact_score", 0) for s in samples) / len(samples), 1)
            avg_att = round(sum(s.get("attention_score", 0) for s in samples) / len(samples), 1)
            avg_pres = round(sum(s.get("presence_score", 0) for s in samples) / len(samples), 1)
            overall_fs = int(round(sum(s.get("overall_facescore", 0) for s in samples) / len(samples)))

            # Observable presentation metrics
            camera_facing_count = sum(
                1 for s in samples
                if s.get("direction_status") in ("Direct Eye Contact", "Natural Thinking Pause (Gaze Shift)")
            )
            camera_facing_consistency = round((camera_facing_count / len(samples)) * 100.0, 1)
            posture_stability = round(
                sum(s.get("posture_stability_score", s.get("head_stability_score", 85.0)) for s in samples) / len(samples),
                1,
            )
            unique_emotions = len(set(s.get("emotion_label") for s in samples if s.get("emotion_label")))
            expression_variation = round(min(100.0, max(50.0, unique_emotions * 22.0 + 35.0)), 1)

            # Presentation stability combines camera orientation consistency, posture stability, and gaze focus
            pres_stability = round(
                (0.40 * avg_eye) + (0.35 * posture_stability) + (0.25 * camera_facing_consistency),
                1,
            )
            visual_score = int(round(pres_stability))
        else:
            avg_conf = None
            avg_stress = None
            avg_eye = None
            avg_att = None
            avg_pres = None
            overall_fs = None
            camera_facing_consistency = None
            posture_stability = None
            expression_variation = None
            pres_stability = None
            visual_score = None

        # Build non-verbal summary for verbal attitude synthesizer
        nv_summary = {
            "data_quality_status": data_quality_status,
            "presentation_stability_score": pres_stability or 80.0,
            "camera_facing_consistency_pct": camera_facing_consistency,
            "eye_contact_consistency_pct": avg_eye,
        }

        # Synthesize verbal communication style and attitude
        verbal_assessment = verbal_attitude_engine.evaluate_professional_presence(
            transcripts=transcripts,
            non_verbal_summary=nv_summary,
        )

        # Evidence-based strengths and growth points (strictly non-psychological)
        strengths: List[str] = list(verbal_assessment.get("strengths", []))
        growth_areas: List[str] = list(verbal_assessment.get("areas_for_growth", []))

        if data_quality_status == "sufficient":
            if camera_facing_consistency and camera_facing_consistency >= 80.0:
                strengths.append(f"Maintained steady camera-facing orientation for {camera_facing_consistency}% of the session.")
            if posture_stability and posture_stability >= 80.0:
                strengths.append(f"Demonstrated stable upper-body framing and posture poise ({posture_stability}% stability).")
            elif posture_stability and posture_stability < 65.0:
                growth_areas.append("Position webcam at eye-level to maintain balanced head alignment during longer answers.")
        elif data_quality_status == "insufficient_data":
            growth_areas.append("Keep webcam enabled throughout to receive visual framing and presentation feedback.")

        summary_data = {
            "session_id": session_id,
            "status": "completed",
            "completed_at": datetime.now(timezone.utc),
            "data_quality_status": data_quality_status,
            "data_quality_reason": data_quality_reason,
            "visual_analysis_enabled": visual_analysis_enabled,
            "total_frames_processed": len(samples),
            "overall_facescore": overall_fs,
            "visual_presentation_score": visual_score,
            "camera_facing_consistency_pct": camera_facing_consistency,
            "eye_contact_consistency_pct": avg_eye,
            "posture_stability_pct": posture_stability,
            "expression_variation_score": expression_variation,
            "presentation_stability_score": pres_stability,
            "avg_confidence": avg_conf,
            "avg_stress": avg_stress,
            "avg_eye_contact": avg_eye,
            "avg_attention": avg_att,
            "avg_presence": avg_pres,
            "verbal_attitude_assessment": verbal_assessment,
            "strengths": strengths[:4],
            "areas_for_improvement": growth_areas[:3],
            "constructive_summary": verbal_assessment.get("constructive_summary"),
            "timeline": timeline,
            "question_analytics": q_analytics,
        }

        sess_filter = {"session_id": session_id}
        if not is_admin and user_id:
            sess_filter["user_id"] = user_id

        await db["facesense_sessions"].update_one(sess_filter, {"$set": summary_data})
        logger.info(
            "FaceSense session finished",
            session_id=session_id,
            data_quality=data_quality_status,
            total_samples=len(samples),
        )
        return summary_data

    async def get_session_summary(
        self,
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: Optional[str] = None,
        is_admin: bool = False,
    ) -> Optional[Dict[str, Any]]:
        """Retrieves session summary analytics."""
        query = {"session_id": session_id}
        if not is_admin and user_id:
            query["user_id"] = user_id
        doc = await db["facesense_sessions"].find_one(query)
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        return doc


# Singleton instance
facesense_service = FaceSenseService()

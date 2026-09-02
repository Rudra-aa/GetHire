"""
app/services/facesense/event_engine.py
---------------------------------------
Behavioral Event Generation Engine for FaceSense.
Generates structured events (Eye Contact Lost, Stress Increased, Confidence Increased, etc.)
correlated with question IDs and timestamps.

LOC Constraint: < 300 LOC
Single Responsibility: Behavioral Event Detection & Classification
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


class EventEngine:
    """Detects state changes and generates behavioral events."""

    def evaluate_frame_events(
        self,
        curr_metrics: Dict[str, Any],
        prev_metrics: Optional[Dict[str, Any]] = None,
        question_id: Optional[str] = None,
        timestamp_sec: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """
        Compares current frame metrics against previous state and detects actionable events.
        """
        events: List[Dict[str, Any]] = []

        face_vis = curr_metrics.get("face_visible", True)
        prev_face_vis = prev_metrics.get("face_visible", True) if prev_metrics else True

        if not face_vis and prev_face_vis:
            events.append(self._build_event("Face Missing", "high", "Face not visible in camera frame", "presence", timestamp_sec, question_id))

        if face_vis and not prev_face_vis:
            events.append(self._build_event("Face Re-appeared", "info", "Face returned to camera frame", "presence", timestamp_sec, question_id))

        eye_contact = curr_metrics.get("eye_contact_score", 85.0)
        prev_eye_contact = prev_metrics.get("eye_contact_score", 85.0) if prev_metrics else 85.0

        if eye_contact < 50.0 and prev_eye_contact >= 60.0:
            events.append(self._build_event("Eye Contact Lost", "medium", "Candidate turned gaze away from interviewer", "eye_contact", timestamp_sec, question_id))
        elif eye_contact >= 75.0 and prev_eye_contact < 55.0:
            events.append(self._build_event("Recovered Eye Contact", "info", "Candidate re-established direct eye contact", "eye_contact", timestamp_sec, question_id))

        stress = curr_metrics.get("stress_score", 20.0)
        prev_stress = prev_metrics.get("stress_score", 20.0) if prev_metrics else 20.0

        if stress - prev_stress > 25.0 and stress > 50.0:
            events.append(self._build_event("Stress Increased", "high", "Noticeable spike in stress indicator metrics", "stress", timestamp_sec, question_id))
        elif prev_stress - stress > 20.0 and prev_stress > 50.0:
            events.append(self._build_event("Stress Reduced", "info", "Candidate composed stress levels", "stress", timestamp_sec, question_id))

        confidence = curr_metrics.get("confidence_score", 80.0)
        prev_confidence = prev_metrics.get("confidence_score", 80.0) if prev_metrics else 80.0

        if confidence - prev_confidence > 15.0 and confidence >= 75.0:
            events.append(self._build_event("Confidence Increased", "info", "Candidate posture & expression showed surge in confidence", "confidence", timestamp_sec, question_id))

        bpm = curr_metrics.get("blink_rate_bpm", 16.0)
        if bpm > 32.0 and (not prev_metrics or prev_metrics.get("blink_rate_bpm", 16.0) <= 32.0):
            events.append(self._build_event("High Blink Rate", "medium", f"Elevated blink rate detected ({round(bpm)} bpm)", "blink", timestamp_sec, question_id))

        direction = curr_metrics.get("direction_status", "Direct Eye Contact")
        if direction == "Looking Down" and (not prev_metrics or prev_metrics.get("direction_status") != "Looking Down"):
            events.append(self._build_event("Head Down", "low", "Candidate tilted head down away from camera", "head_pose", timestamp_sec, question_id))

        framing = curr_metrics.get("camera_framing", "Optimal Camera Framing")
        if framing != "Optimal Camera Framing" and (not prev_metrics or prev_metrics.get("camera_framing") == "Optimal Camera Framing"):
            events.append(self._build_event("Poor Framing", "low", f"Camera framing issue: {framing}", "presence", timestamp_sec, question_id))

        return events

    def _build_event(
        self,
        event_type: str,
        severity: str,
        description: str,
        metric: str,
        timestamp_sec: float,
        question_id: Optional[str],
    ) -> Dict[str, Any]:
        return {
            "event_type": event_type,
            "severity": severity,  # info, low, medium, high
            "description": description,
            "metric": metric,
            "timestamp_sec": round(timestamp_sec, 1),
            "question_id": question_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }


# Singleton instance
event_engine = EventEngine()

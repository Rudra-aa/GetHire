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
        direction = curr_metrics.get("direction_status", "Direct Eye Contact")

        if direction == "Natural Thinking Pause (Gaze Shift)":
            events.append(self._build_event("Thinking Gaze Shift", "info", "Natural cognitive reflection gaze break observed", "eye_contact", timestamp_sec, question_id))
        elif eye_contact < 50.0 and prev_eye_contact >= 60.0:
            events.append(self._build_event("Gaze Shift Away", "low", "Gaze shifted away from camera view", "eye_contact", timestamp_sec, question_id))
        elif eye_contact >= 75.0 and prev_eye_contact < 55.0:
            events.append(self._build_event("Direct Gaze Re-established", "info", "Direct visual alignment re-established with camera", "eye_contact", timestamp_sec, question_id))

        presentation = curr_metrics.get("confidence_score", 80.0)
        prev_presentation = prev_metrics.get("confidence_score", 80.0) if prev_metrics else 80.0

        if presentation - prev_presentation > 15.0 and presentation >= 75.0:
            events.append(self._build_event("High Presentation Poise", "info", "Upright posture & steady visual focus observed", "presentation", timestamp_sec, question_id))

        bpm = curr_metrics.get("blink_rate_bpm", 16.0)
        if bpm > 34.0 and (not prev_metrics or prev_metrics.get("blink_rate_bpm", 16.0) <= 34.0):
            events.append(self._build_event("Elevated Blink Rate", "low", f"Elevated blink frequency noted ({round(bpm)} bpm)", "blink", timestamp_sec, question_id))

        if "Looking Down" in direction and (not prev_metrics or "Looking Down" not in prev_metrics.get("direction_status", "")):
            events.append(self._build_event("Downward Gaze Observed", "low", "Downward visual orientation observed (reading notes or surface)", "head_pose", timestamp_sec, question_id))

        framing = curr_metrics.get("camera_framing", "Optimal Camera Framing")
        if framing != "Optimal Camera Framing" and (not prev_metrics or prev_metrics.get("camera_framing") == "Optimal Camera Framing"):
            events.append(self._build_event("Camera Framing Adjusted", "low", f"Camera framing: {framing}", "presence", timestamp_sec, question_id))

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

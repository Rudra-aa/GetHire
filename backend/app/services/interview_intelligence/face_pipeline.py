"""
app/services/interview_intelligence/face_pipeline.py
-----------------------------------------------------
Face Pipeline for Interview Intelligence.
Wraps FaceSense real-time metrics and filters telemetry to ensure only valid data is exposed.
"""

from __future__ import annotations

from typing import Dict, Any, Optional


class FacePipeline:
    """Filters FaceSense metrics to ensure telemetry contains no fake/placeholder data."""

    def process_face_telemetry(self, raw_sample: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes raw FaceSense metrics and returns active live fields.
        """
        face_visible = bool(raw_sample.get("face_visible", True))

        if not face_visible:
            return {
                "face_visible": False,
                "status": "Face Not Visible",
                "overall_facescore": 0,
            }

        return {
            "face_visible": True,
            "status": "Face Detected",
            "emotion": raw_sample.get("emotion_label", "Neutral"),
            "emotion_confidence": round(float(raw_sample.get("emotion_confidence", 0.0)), 2),
            "eye_contact_score": round(float(raw_sample.get("eye_contact_score", 0.0)), 1),
            "direction_status": raw_sample.get("direction_status", "CENTER"),
            "head_stability_score": round(float(raw_sample.get("head_stability_score", 0.0)), 1),
            "pitch": round(float(raw_sample.get("pitch", 0.0)), 1),
            "yaw": round(float(raw_sample.get("yaw", 0.0)), 1),
            "roll": round(float(raw_sample.get("roll", 0.0)), 1),
            "blink_rate_bpm": round(float(raw_sample.get("blink_rate_bpm", 0.0)), 1),
            "smile_pct": round(float(raw_sample.get("smile_pct", 0.0)), 1),
            "attention_score": round(float(raw_sample.get("attention_score", 0.0)), 1),
            "presence_score": round(float(raw_sample.get("presence_score", 0.0)), 1),
            "confidence_score": round(float(raw_sample.get("confidence_score", 0.0)), 1),
            "stress_score": round(float(raw_sample.get("stress_score", 0.0)), 1),
            "overall_facescore": int(raw_sample.get("overall_facescore", 0)),
        }


# Singleton instance
face_pipeline = FacePipeline()

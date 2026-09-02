"""
app/services/facesense/presence_engine.py
------------------------------------------
Presence & Camera Framing Analysis Engine for FaceSense.
Evaluates face framing, bounding box coverage, posture, and presence score.

LOC Constraint: < 300 LOC
Single Responsibility: Candidate Presence & Camera Framing Analysis
"""

from __future__ import annotations

from typing import Dict, Any, Tuple, Optional
import numpy as np


class PresenceEngine:
    """Evaluates candidate camera framing quality and executive presence score."""

    def evaluate_presence(
        self,
        face_box: Optional[Tuple[float, float, float, float]] = None,  # (x, y, w, h) normalized 0..1
        face_visible: bool = True,
        head_stability_score: float = 85.0,
    ) -> Dict[str, Any]:
        """
        Computes Presence Score (0-100) based on framing alignment and posture.
        """
        if not face_visible or face_box is None:
            return {
                "presence_score": 0.0,
                "camera_framing": "Face Not Detected",
                "face_coverage_pct": 0.0,
                "is_well_framed": False,
                "professional_posture_score": 0.0,
            }

        x, y, w, h = face_box
        center_x = x + w / 2.0
        center_y = y + h / 2.0
        face_area = w * h

        # Evaluate centering (ideal center_x ~ 0.5, center_y ~ 0.45)
        offset_x = abs(center_x - 0.5)
        offset_y = abs(center_y - 0.45)

        if offset_x > 0.25:
            framing = "Off-Center (Shifted Left/Right)"
        elif offset_y > 0.25:
            framing = "Off-Center (Too High/Low)"
        elif face_area < 0.04:
            framing = "Too Far From Camera"
        elif face_area > 0.40:
            framing = "Too Close To Camera"
        else:
            framing = "Optimal Camera Framing"

        framing_penalty = (offset_x * 120.0) + (offset_y * 80.0)
        area_penalty = 0.0
        if face_area < 0.06:
            area_penalty = (0.06 - face_area) * 500.0
        elif face_area > 0.35:
            area_penalty = (face_area - 0.35) * 300.0

        framing_score = max(30.0, 100.0 - framing_penalty - area_penalty)
        posture_score = (framing_score * 0.5) + (head_stability_score * 0.5)
        presence_score = float(np.clip(posture_score, 0.0, 100.0))

        return {
            "presence_score": round(presence_score, 1),
            "camera_framing": framing,
            "face_coverage_pct": round(face_area * 100.0, 1),
            "is_well_framed": framing == "Optimal Camera Framing",
            "professional_posture_score": round(posture_score, 1),
        }


# Singleton instance
presence_engine = PresenceEngine()

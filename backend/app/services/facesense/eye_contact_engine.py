"""
app/services/facesense/eye_contact_engine.py
--------------------------------------------
Eye Contact & Gaze Analysis Engine for FaceSense.
Calculates camera attention %, eye direction (Center, Left, Right, Down),
and looking away duration.

LOC Constraint: < 300 LOC
Single Responsibility: Eye Contact & Gaze Analytics
"""

from __future__ import annotations

from typing import Dict, Any, Optional, Tuple
import numpy as np


class EyeContactEngine:
    """Analyzes eye gaze vector, camera contact %, and direction trends."""

    def analyze_gaze(
        self,
        landmarks: Optional[Dict[str, Any]] = None,
        yaw: float = 0.0,
        pitch: float = 0.0,
        eye_contact_input: Optional[float] = None,
        looking_away_duration_sec: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Computes eye contact percentage, direction status, and looking away metrics.
        """
        # If eye contact score directly provided by client MediaPipe pipeline
        if eye_contact_input is not None:
            eye_contact_pct = float(np.clip(eye_contact_input, 0.0, 100.0))
        else:
            # Derived from head pose yaw and pitch angles
            abs_yaw = abs(yaw)
            abs_pitch = abs(pitch)

            if abs_yaw > 25 or abs_pitch > 20:
                eye_contact_pct = max(10.0, 100.0 - (abs_yaw * 2.5 + abs_pitch * 2.0))
            elif abs_yaw > 12 or abs_pitch > 10:
                eye_contact_pct = max(50.0, 100.0 - (abs_yaw * 2.0 + abs_pitch * 1.8))
            else:
                eye_contact_pct = min(100.0, 95.0 + (5.0 - abs_yaw * 0.5))

        # Determine eye direction status
        looking_left = yaw < -12.0
        looking_right = yaw > 12.0
        looking_down = pitch > 15.0
        looking_up = pitch < -15.0

        if looking_down:
            direction_status = "Looking Down"
        elif looking_left:
            direction_status = "Looking Left"
        elif looking_right:
            direction_status = "Looking Right"
        elif looking_up:
            direction_status = "Looking Up"
        else:
            direction_status = "Direct Eye Contact"

        is_looking_away = eye_contact_pct < 60.0 or direction_status != "Direct Eye Contact"
        updated_looking_away_dur = (looking_away_duration_sec + 0.1) if is_looking_away else max(0.0, looking_away_duration_sec - 0.2)

        return {
            "eye_contact_score": round(eye_contact_pct, 1),
            "camera_attention_pct": round(eye_contact_pct, 1),
            "direction_status": direction_status,
            "looking_left": looking_left,
            "looking_right": looking_right,
            "looking_down": looking_down,
            "looking_away_duration_sec": round(updated_looking_away_dur, 1),
            "is_looking_away": is_looking_away,
        }


# Singleton instance
eye_contact_engine = EyeContactEngine()

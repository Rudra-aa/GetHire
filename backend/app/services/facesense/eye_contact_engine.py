"""
app/services/facesense/eye_contact_engine.py
--------------------------------------------
Eye Contact & Gaze Analysis Engine for FaceSense.
Calculates camera attention %, eye direction (Center, Thinking Away, Down, Left, Right),
and looking away duration with natural cognitive reflection leeway.

Prompt Requirements:
- "Use face landmarks and gaze estimation to analyze: Approximate frequency of looking towards the camera,
  Looking away from the camera, Head orientation consistency, Changes in visual attention during answers."
- "Do not expect continuous eye contact. Candidates may naturally look away while thinking."
"""

from __future__ import annotations

from typing import Dict, Any, Optional
import numpy as np


class EyeContactEngine:
    """Analyzes eye gaze vector, camera contact %, and direction trends with thinking-pause awareness."""

    def analyze_gaze(
        self,
        landmarks: Optional[Dict[str, Any]] = None,
        yaw: float = 0.0,
        pitch: float = 0.0,
        eye_contact_input: Optional[float] = None,
        looking_away_duration_sec: float = 0.0,
        is_thinking_pause: bool = False,
    ) -> Dict[str, Any]:
        """
        Computes eye contact percentage, direction status, and looking away metrics.
        Accounts for natural cognitive reflection pauses when thinking.
        """
        abs_yaw = abs(yaw)
        abs_pitch = abs(pitch)

        # 1. Base eye contact percentage
        if eye_contact_input is not None:
            eye_contact_pct = float(np.clip(eye_contact_input, 0.0, 100.0))
        else:
            if abs_yaw > 25.0 or abs_pitch > 22.0:
                eye_contact_pct = max(15.0, 100.0 - (abs_yaw * 2.2 + abs_pitch * 2.0))
            elif abs_yaw > 12.0 or abs_pitch > 10.0:
                eye_contact_pct = max(55.0, 100.0 - (abs_yaw * 1.8 + abs_pitch * 1.5))
            else:
                eye_contact_pct = min(100.0, 95.0 + (5.0 - abs_yaw * 0.4))

        # 2. Determine eye direction status
        looking_left = yaw < -14.0
        looking_right = yaw > 14.0
        looking_down = pitch > 15.0
        looking_up = pitch < -14.0

        if is_thinking_pause and (looking_up or abs_yaw > 10.0):
            direction_status = "Natural Thinking Pause (Gaze Shift)"
            # Cognitive reflection leeway: do not penalize brief thinking gaze breaks
            eye_contact_pct = max(eye_contact_pct, 80.0)
        elif looking_down:
            direction_status = "Looking Down (Notes / Surface)"
        elif looking_left:
            direction_status = "Looking Left"
        elif looking_right:
            direction_status = "Looking Right"
        elif looking_up:
            direction_status = "Looking Up"
        else:
            direction_status = "Direct Eye Contact"

        is_looking_away = direction_status not in ["Direct Eye Contact", "Natural Thinking Pause (Gaze Shift)"]
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
            "is_thinking_pause": is_thinking_pause,
        }


# Singleton instance
eye_contact_engine = EyeContactEngine()

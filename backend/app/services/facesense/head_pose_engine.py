"""
app/services/facesense/head_pose_engine.py
-------------------------------------------
Head Pose & Movement Analysis Engine for FaceSense.
Estimates Pitch, Yaw, Roll head orientation angles and excessive movement.

LOC Constraint: < 300 LOC
Single Responsibility: Head Pose & Movement Stability
"""

from __future__ import annotations

from typing import Dict, Any, Optional, List
import numpy as np


class HeadPoseEngine:
    """Computes head orientation angles and movement stability metric."""

    def __init__(self, history_size: int = 15) -> None:
        self.history_size = history_size

    def analyze_head_pose(
        self,
        pitch: float = 0.0,
        yaw: float = 0.0,
        roll: float = 0.0,
        pose_history: Optional[List[Dict[str, float]]] = None,
    ) -> Dict[str, Any]:
        """
        Processes head pose angles (pitch, yaw, roll) and evaluates movement stability.
        """
        pitch = float(np.clip(pitch, -90.0, 90.0))
        yaw = float(np.clip(yaw, -90.0, 90.0))
        roll = float(np.clip(roll, -90.0, 90.0))

        # Evaluate excessive movement from history variance
        if pose_history and len(pose_history) > 2:
            pitches = [p.get("pitch", 0.0) for p in pose_history[-self.history_size:]]
            yaws = [p.get("yaw", 0.0) for p in pose_history[-self.history_size:]]
            rolls = [p.get("roll", 0.0) for p in pose_history[-self.history_size:]]

            p_var = float(np.var(pitches))
            y_var = float(np.var(yaws))
            r_var = float(np.var(rolls))
            total_variance = p_var + y_var + r_var

            movement_intensity = min(100.0, total_variance * 2.0)
            head_stability = max(0.0, 100.0 - movement_intensity)
            is_excessive_movement = movement_intensity > 45.0
        else:
            abs_sum = abs(pitch) + abs(yaw) + abs(roll)
            head_stability = max(40.0, 100.0 - (abs_sum * 1.2))
            is_excessive_movement = abs_sum > 35.0

        return {
            "pitch": round(pitch, 1),
            "yaw": round(yaw, 1),
            "roll": round(roll, 1),
            "head_stability_score": round(head_stability, 1),
            "excessive_movement": is_excessive_movement,
        }


# Singleton instance
head_pose_engine = HeadPoseEngine()

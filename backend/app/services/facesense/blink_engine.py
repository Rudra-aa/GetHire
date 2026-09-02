"""
app/services/facesense/blink_engine.py
---------------------------------------
Blink & Stress Analysis Engine for FaceSense.
Tracks Eye Aspect Ratio (EAR), blink frequency per minute, and stress indicator ranges.

LOC Constraint: < 300 LOC
Single Responsibility: Blink Analysis & Stress Detection
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
import numpy as np


class BlinkEngine:
    """Calculates blink rate (blinks/min), EAR thresholds, and blink stress indicators."""

    NATURAL_MIN_BPM = 10.0
    NATURAL_MAX_BPM = 24.0

    def analyze_blink_rate(
        self,
        current_ear: float = 0.28,
        recent_blinks: int = 0,
        elapsed_sec: float = 60.0,
        blink_rate_input: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates blink metrics and stress indicator based on blinks per minute (BPM).
        """
        if blink_rate_input is not None:
            bpm = float(np.clip(blink_rate_input, 0.0, 100.0))
        elif elapsed_sec > 5.0:
            bpm = (recent_blinks / elapsed_sec) * 60.0
        else:
            bpm = 16.0  # default baseline natural rate

        # Classify blink status & stress indication
        if bpm > 30.0:
            blink_status = "High Blink Rate (Elevated Anxiety/Stress)"
            stress_indicator = "High"
            blink_score = 55.0
        elif bpm > self.NATURAL_MAX_BPM:
            blink_status = "Slightly Elevated Blink Rate"
            stress_indicator = "Moderate"
            blink_score = 75.0
        elif bpm < 6.0:
            blink_status = "Low Blink Rate (Staring/Intense Focus)"
            stress_indicator = "Low"
            blink_score = 80.0
        else:
            blink_status = "Natural Blink Rate"
            stress_indicator = "Normal"
            blink_score = 95.0

        return {
            "blink_rate_bpm": round(bpm, 1),
            "current_ear": round(current_ear, 3),
            "blink_status": blink_status,
            "stress_indicator": stress_indicator,
            "blink_score": round(blink_score, 1),
            "is_in_natural_range": self.NATURAL_MIN_BPM <= bpm <= self.NATURAL_MAX_BPM,
        }


# Singleton instance
blink_engine = BlinkEngine()

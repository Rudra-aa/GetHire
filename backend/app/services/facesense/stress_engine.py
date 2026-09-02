"""
app/services/facesense/stress_engine.py
----------------------------------------
Stress & Anxiety Analysis Engine for FaceSense.
Derives composite Stress Score (0-100) from blink frequency, emotion shifts,
and micro-movement instability.

LOC Constraint: < 300 LOC
Single Responsibility: Candidate Stress & Anxiety Detection
"""

from __future__ import annotations

from typing import Dict, Any
import numpy as np


class StressEngine:
    """Computes candidate Stress Score (0-100) and anxiety indicators."""

    def compute_stress(
        self,
        blink_rate_bpm: float = 16.0,
        emotion_label: str = "Neutral",
        head_stability_score: float = 85.0,
        eye_contact_score: float = 85.0,
    ) -> Dict[str, Any]:
        """
        Derives Stress Score using blink rate, micro-movement, and emotional volatility.
        """
        # Blink rate stress contribution (normal 12-20 bpm)
        if blink_rate_bpm > 32.0:
            blink_stress = 85.0
        elif blink_rate_bpm > 24.0:
            blink_stress = 60.0
        elif blink_rate_bpm < 6.0:
            blink_stress = 40.0
        else:
            blink_stress = 15.0

        # Emotion stress contribution
        if emotion_label in ["Fear", "Angry"]:
            emotion_stress = 90.0
        elif emotion_label in ["Sad", "Disgust"]:
            emotion_stress = 70.0
        elif emotion_label in ["Surprise"]:
            emotion_stress = 40.0
        else:
            emotion_stress = 10.0

        # Movement instability contribution
        instability_stress = max(0.0, 100.0 - head_stability_score)
        eye_drift_stress = max(0.0, 100.0 - eye_contact_score)

        raw_stress = (
            (blink_stress * 0.35)
            + (emotion_stress * 0.30)
            + (instability_stress * 0.20)
            + (eye_drift_stress * 0.15)
        )

        stress_score = float(np.clip(raw_stress, 0.0, 100.0))

        if stress_score >= 70.0:
            level = "High Stress / Anxiety"
        elif stress_score >= 45.0:
            level = "Moderate Stress"
        elif stress_score >= 25.0:
            level = "Low Stress (Composed)"
        else:
            level = "Minimal Stress (Calm)"

        return {
            "stress_score": round(stress_score, 1),
            "stress_level": level,
            "blink_stress_contrib": round(blink_stress * 0.35, 1),
            "emotion_stress_contrib": round(emotion_stress * 0.30, 1),
        }


# Singleton instance
stress_engine = StressEngine()

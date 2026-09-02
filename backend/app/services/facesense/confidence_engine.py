"""
app/services/facesense/confidence_engine.py
--------------------------------------------
Confidence Analysis Engine for FaceSense.
Derives composite Confidence Score (0-100) from eye contact, posture stability,
smile engagement, and emotional stability.

LOC Constraint: < 300 LOC
Single Responsibility: Candidate Confidence Scoring
"""

from __future__ import annotations

from typing import Dict, Any
import numpy as np


class ConfidenceEngine:
    """Computes overall candidate Confidence Score (0-100)."""

    def compute_confidence(
        self,
        eye_contact_score: float = 85.0,
        head_stability_score: float = 85.0,
        smile_pct: float = 20.0,
        emotion_label: str = "Neutral",
        emotion_confidence: float = 0.85,
    ) -> Dict[str, Any]:
        """
        Derives Confidence Score using weighted metrics.
        """
        # Emotion stability bonus / penalty
        emotion_mod = 0.0
        if emotion_label in ["Happy", "Neutral"]:
            emotion_mod = 5.0
        elif emotion_label in ["Surprise"]:
            emotion_mod = 0.0
        elif emotion_label in ["Fear", "Sad", "Angry"]:
            emotion_mod = -15.0

        # Smile engagement bonus (natural smile is ~15-40%)
        smile_mod = 0.0
        if 10.0 <= smile_pct <= 55.0:
            smile_mod = 5.0
        elif smile_pct > 65.0:
            smile_mod = 2.0

        raw_score = (
            (eye_contact_score * 0.45)
            + (head_stability_score * 0.35)
            + (emotion_confidence * 100.0 * 0.20)
            + emotion_mod
            + smile_mod
        )

        confidence_score = float(np.clip(raw_score, 0.0, 100.0))

        if confidence_score >= 85.0:
            rating = "High Confidence"
        elif confidence_score >= 70.0:
            rating = "Moderate Confidence"
        elif confidence_score >= 50.0:
            rating = "Developing Confidence"
        else:
            rating = "Low Confidence / Nervous"

        return {
            "confidence_score": round(confidence_score, 1),
            "confidence_rating": rating,
            "eye_contact_contrib": round(eye_contact_score * 0.45, 1),
            "head_stability_contrib": round(head_stability_score * 0.35, 1),
        }


# Singleton instance
confidence_engine = ConfidenceEngine()

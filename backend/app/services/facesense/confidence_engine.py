"""
app/services/facesense/confidence_engine.py
--------------------------------------------
Confidence & Visual Presentation Analysis Engine for FaceSense.
Evaluates observable indicators associated with confident interview presentation:
- Camera-facing consistency
- Head orientation & stability
- Posture consistency & visual engagement
- Communicative openness (facial animation and conversational smile)

Prompt Requirements:
- "Provide constructive feedback rather than claiming to know the candidate's actual internal confidence."
- "Never automatically interpret a facial expression as proof of nervousness, dishonesty, arrogance, confidence or any other internal psychological state."
"""

from __future__ import annotations

from typing import Dict, Any
import numpy as np


class ConfidenceEngine:
    """Computes observable Confidence-Related Presentation Poise (0-100)."""

    def compute_confidence(
        self,
        eye_contact_score: float = 85.0,
        head_stability_score: float = 85.0,
        smile_pct: float = 20.0,
        emotion_label: str = "Neutral",
        emotion_confidence: float = 0.85,
        posture_stability_score: float = 85.0,
    ) -> Dict[str, Any]:
        """
        Derives an observable Presentation Poise Score (0-100) using physical metrics.
        Constructive evaluation based on observable visual indicators, not psychological speculation.
        """
        # Conversational warmth / communicative openness bonus (natural smile is ~15-45%)
        openness_bonus = 0.0
        if 10.0 <= smile_pct <= 50.0:
            openness_bonus = 6.0
        elif smile_pct > 50.0:
            openness_bonus = 3.0

        # Weighted observable visual indicators
        raw_score = (
            (eye_contact_score * 0.40)
            + (head_stability_score * 0.30)
            + (posture_stability_score * 0.20)
            + (min(100.0, emotion_confidence * 100.0) * 0.10)
            + openness_bonus
        )

        presentation_score = float(np.clip(raw_score, 0.0, 100.0))

        if presentation_score >= 85.0:
            rating = "Polished & Poised Presentation"
        elif presentation_score >= 70.0:
            rating = "Steady & Engaged Presentation"
        elif presentation_score >= 50.0:
            rating = "Developing Presentation Consistency"
        else:
            rating = "Variable Visual Demeanor"

        return {
            "confidence_score": round(presentation_score, 1),
            "presentation_stability_score": round(presentation_score, 1),
            "confidence_rating": rating,
            "eye_contact_contrib": round(eye_contact_score * 0.40, 1),
            "head_stability_contrib": round(head_stability_score * 0.30, 1),
            "posture_contrib": round(posture_stability_score * 0.20, 1),
        }


# Singleton instance
confidence_engine = ConfidenceEngine()

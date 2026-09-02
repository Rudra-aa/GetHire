"""
app/services/facesense/attention_engine.py
-------------------------------------------
Attention & Distraction Analysis Engine for FaceSense.
Tracks face presence, eye contact consistency, and distraction events.

LOC Constraint: < 300 LOC
Single Responsibility: Candidate Attention & Distraction Scoring
"""

from __future__ import annotations

from typing import Dict, Any, Optional
import numpy as np


class AttentionEngine:
    """Computes candidate overall Attention Score and distraction metrics."""

    def compute_attention(
        self,
        face_visible: bool = True,
        eye_contact_pct: float = 85.0,
        looking_away_duration_sec: float = 0.0,
        looking_away_count: int = 0,
        head_stability_score: float = 85.0,
    ) -> Dict[str, Any]:
        """
        Calculates normalized Attention Score (0-100) and flags distraction.
        """
        if not face_visible:
            return {
                "attention_score": 0.0,
                "face_visible": False,
                "is_distracted": True,
                "distraction_level": "High (Face Missing)",
                "looking_at_interviewer": False,
            }

        # Weighted calculation for candidate attention
        raw_score = (
            (eye_contact_pct * 0.55)
            + (head_stability_score * 0.30)
            + max(0.0, (100.0 - looking_away_duration_sec * 10.0)) * 0.15
        )

        attention_score = float(np.clip(raw_score, 0.0, 100.0))
        is_distracted = attention_score < 60.0 or looking_away_duration_sec > 3.0

        if attention_score >= 85.0:
            distraction_level = "None (Highly Focused)"
        elif attention_score >= 70.0:
            distraction_level = "Low"
        elif attention_score >= 50.0:
            distraction_level = "Moderate"
        else:
            distraction_level = "High"

        return {
            "attention_score": round(attention_score, 1),
            "face_visible": True,
            "is_distracted": is_distracted,
            "distraction_level": distraction_level,
            "looking_at_interviewer": eye_contact_pct >= 65.0,
            "looking_away_count": looking_away_count,
        }


# Singleton instance
attention_engine = AttentionEngine()

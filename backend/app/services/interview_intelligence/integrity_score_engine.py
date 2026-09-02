"""
app/services/interview_intelligence/integrity_score_engine.py
--------------------------------------------------------------
Dynamic Integrity Score Calculation Engine.
Calculates continuous Integrity Score (0-100, starting at 100) based on objective event severity.
Keeps Technical evaluation score strictly independent.

LOC Constraint: < 300 LOC
Single Responsibility: Integrity Score Calculation & Penalty Deduction
"""

from __future__ import annotations

from typing import Dict, Any, List
import numpy as np


class IntegrityScoreEngine:
    """Computes candidate Integrity Score starting at baseline 100."""

    INITIAL_INTEGRITY_SCORE = 100.0

    def compute_integrity_score(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates dynamic Integrity Score based on recorded events.
        """
        if not events:
            return {
                "integrity_score": 100,
                "rating": "No Violations (Optimal Integrity)",
                "total_deductions": 0.0,
                "event_counts": {},
            }

        total_deduction = 0.0
        event_counts: Dict[str, int] = {}

        for ev in events:
            severity = ev.get("severity", "low")
            etype = ev.get("event_type", "generic")
            event_counts[etype] = event_counts.get(etype, 0) + 1

            if severity == "high":
                deduction = 12.0
            elif severity == "medium":
                deduction = 5.0
            else:  # low
                deduction = 2.0

            # Override specific penalty points if calculated by pipeline
            if "penalty_points" in ev:
                deduction = float(ev["penalty_points"])

            total_deduction += deduction

        calculated_score = max(0.0, self.INITIAL_INTEGRITY_SCORE - total_deduction)
        final_score = int(round(calculated_score))

        if final_score >= 90:
            rating = "Optimal Integrity"
        elif final_score >= 75:
            rating = "Good Integrity"
        elif final_score >= 60:
            rating = "Moderate Integrity Risk"
        else:
            rating = "High Integrity Risk"

        return {
            "integrity_score": final_score,
            "rating": rating,
            "total_deductions": round(total_deduction, 1),
            "event_counts": event_counts,
        }


# Singleton instance
integrity_score_engine = IntegrityScoreEngine()

"""
app/services/facesense/verbal_attitude_engine.py
-------------------------------------------------
Attitude & Professional Presence Evaluation Engine.
Synthesizes communication style from actual spoken answers, respectful/professional
language, responsiveness, clarity, and constructive handling of follow-up questions
with observable non-verbal presentation indicators.

Prompt Requirement 4:
"Attitude-related feedback must primarily come from actual verbal behaviour
and interaction, not facial appearance."
"""

from __future__ import annotations

import re
from typing import Dict, Any, List, Optional


class VerbalAttitudeEngine:
    """Evaluates professional presence and communication attitude primarily from verbal transcripts."""

    POLITE_MARKERS = [
        r"\bthank\s+you\b",
        r"\bgreat\s+question\b",
        r"\bgood\s+question\b",
        r"\bcertainly\b",
        r"\babsolutely\b",
        r"\bpleased\s+to\b",
        r"\bhappily\b",
        r"\bappreciate\b",
        r"\bin\s+my\s+experience\b",
        r"\bcollaborated\s+with\b",
        r"\bmy\s+team\s+and\s+i\b",
        r"\bwe\s+worked\s+together\b",
        r"\bpartnered\s+with\b",
    ]

    STRUCTURE_MARKERS = [
        r"\bfirstly\b",
        r"\bfirst\s+of\s+all\b",
        r"\bsecondly\b",
        r"\bto\s+begin\s+with\b",
        r"\bfor\s+example\b",
        r"\bfor\s+instance\b",
        r"\bspecifically\b",
        r"\bas\s+a\s+result\b",
        r"\bthe\s+outcome\s+was\b",
        r"\bultimately\b",
        r"\bin\s+summary\b",
        r"\bin\s+conclusion\b",
        r"\bthe\s+challenge\s+was\b",
        r"\bthe\s+action\s+i\s+took\b",
    ]

    FOLLOW_UP_RECEPTIVE_MARKERS = [
        r"\bto\s+elaborate\b",
        r"\bto\s+clarify\b",
        r"\bbuilding\s+on\s+that\b",
        r"\bexpanding\s+on\s+that\b",
        r"\bthat's\s+a\s+fair\s+point\b",
        r"\blooking\s+deeper\s+into\b",
        r"\bto\s+address\s+that\s+specifically\b",
        r"\banother\s+aspect\s+is\b",
    ]

    def evaluate_professional_presence(
        self,
        transcripts: List[Dict[str, Any]],
        non_verbal_summary: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Synthesizes spoken verbal answers with observable non-verbal presentation indicators.
        Attitude feedback is anchored in actual spoken words and interaction style.
        """
        if not transcripts:
            return self._build_empty_assessment(non_verbal_summary)

        # Collect candidate answer texts and follow-up turns
        candidate_answers: List[str] = []
        follow_up_answers: List[str] = []
        evidence_quotes: List[str] = []

        for turn in transcripts:
            text = (turn.get("answer_text") or turn.get("text") or turn.get("candidate_text") or "").strip()
            if not text or len(text) < 10:
                continue

            candidate_answers.append(text)
            if turn.get("is_follow_up") or turn.get("question_type") == "follow_up":
                follow_up_answers.append(text)

        if not candidate_answers:
            return self._build_empty_assessment(non_verbal_summary)

        combined_text = " ".join(candidate_answers).lower()

        # 1. Respectful & Professional Language Analysis
        polite_count = 0
        for pat in self.POLITE_MARKERS:
            matches = re.findall(pat, combined_text)
            polite_count += len(matches)

        respectful_observed = polite_count > 0 or len(candidate_answers) >= 2
        politeness_score = min(100.0, 75.0 + (polite_count * 6.0))

        # 2. Clarity & Structural Organization Analysis
        structure_count = 0
        for pat in self.STRUCTURE_MARKERS:
            matches = re.findall(pat, combined_text)
            structure_count += len(matches)

        # Average words per answer (brevity vs substance)
        avg_word_count = sum(len(a.split()) for a in candidate_answers) / max(1, len(candidate_answers))
        length_score = 90.0 if 40 <= avg_word_count <= 250 else (75.0 if avg_word_count > 250 else 65.0)
        clarity_score = min(100.0, (structure_count * 5.0) + (length_score * 0.7))

        # 3. Constructive Follow-Up Reception Analysis
        follow_up_score = 80.0
        if follow_up_answers:
            fu_text = " ".join(follow_up_answers).lower()
            fu_matches = sum(len(re.findall(pat, fu_text)) for pat in self.FOLLOW_UP_RECEPTIVE_MARKERS)
            follow_up_score = min(100.0, 75.0 + (fu_matches * 10.0))
            receptive_status = "Collaborative & Receptive" if follow_up_score >= 85 else "Direct & Constructive"
        else:
            receptive_status = "Constructive & Adaptable"

        # 4. Extract 1-3 concrete excerpt quotes showing professional communication
        for ans in candidate_answers:
            sentences = [s.strip() for s in re.split(r"[.!?]", ans) if len(s.strip().split()) >= 6]
            for s in sentences:
                s_lower = s.lower()
                if any(re.search(pat, s_lower) for pat in self.POLITE_MARKERS + self.STRUCTURE_MARKERS):
                    clean_quote = s[:120].strip() + ("..." if len(s) > 120 else "")
                    if clean_quote not in evidence_quotes:
                        evidence_quotes.append(f'"{clean_quote}"')
                        if len(evidence_quotes) >= 3:
                            break
            if len(evidence_quotes) >= 3:
                break

        # If no explicit markers found, extract first coherent substantive sentence
        if not evidence_quotes and candidate_answers:
            first_ans = candidate_answers[0]
            first_sent = [s.strip() for s in re.split(r"[.!?]", first_ans) if len(s.strip().split()) >= 6]
            if first_sent:
                evidence_quotes.append(f'"{first_sent[0][:120]}..."')

        # 5. Verbal Attitude Score (70% weight)
        verbal_score = (politeness_score * 0.35) + (clarity_score * 0.35) + (follow_up_score * 0.30)

        # 6. Non-Verbal Synthesis (30% weight from camera observations)
        nv_score = 80.0
        if non_verbal_summary and non_verbal_summary.get("data_quality_status") == "sufficient":
            nv_score = float(non_verbal_summary.get("presentation_stability_score") or 80.0)

        composite_presence = round((verbal_score * 0.70) + (nv_score * 0.30))

        # Qualitative Strengths and Areas for Growth
        strengths: List[str] = []
        growth_areas: List[str] = []

        if polite_count >= 2:
            strengths.append("Maintained collaborative, respectful phrasing across interview turns.")
        else:
            strengths.append("Communicated with direct professional focus throughout the exchange.")

        if structure_count >= 2:
            strengths.append("Demonstrated organized thought progression with structured transitions.")
        elif avg_word_count < 35:
            growth_areas.append("Consider expanding on technical trade-offs with concrete examples to demonstrate breadth.")

        if follow_up_answers:
            strengths.append("Handled clarifying questions constructively, building upon earlier technical statements.")

        if nv_score >= 82.0 and non_verbal_summary:
            strengths.append("Exhibited consistent camera-facing presence and poised visual engagement while articulating solutions.")
        elif nv_score < 70.0 and non_verbal_summary:
            growth_areas.append("Keep head positioning centered toward the camera while speaking to reinforce engagement.")

        summary_text = (
            f"Candidate demonstrated a {self._rating_band(composite_presence).lower()} communication style. "
            f"Responses were articulated with professional decorum, constructive problem-solving phrasing, "
            f"and attentive engagement with the interviewer."
        )

        return {
            "professional_presence_score": composite_presence,
            "rating_band": self._rating_band(composite_presence),
            "verbal_communication_score": round(verbal_score, 1),
            "respectful_language_observed": respectful_observed,
            "clarity_organization_level": "High" if clarity_score >= 80 else ("Moderate" if clarity_score >= 65 else "Developing"),
            "follow_up_receptiveness": receptive_status,
            "evidence_quotes": evidence_quotes,
            "strengths": strengths[:3],
            "areas_for_growth": growth_areas[:2],
            "constructive_summary": summary_text,
        }

    def _build_empty_assessment(self, non_verbal_summary: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides neutral baseline when no verbal answers are available."""
        return {
            "professional_presence_score": 75,
            "rating_band": "Adequate Professional Presence",
            "verbal_communication_score": 75.0,
            "respectful_language_observed": True,
            "clarity_organization_level": "Moderate",
            "follow_up_receptiveness": "Constructive",
            "evidence_quotes": [],
            "strengths": ["Demonstrated professional demeanor during session initialization."],
            "areas_for_growth": ["Ensure complete answers are recorded to provide detailed communication analysis."],
            "constructive_summary": "Initial professional demeanor observed. Complete interview turns to generate in-depth verbal communication feedback.",
        }

    def _rating_band(self, score: int) -> str:
        if score >= 85:
            return "Polished Professional Presence"
        if score >= 75:
            return "Solid Professional Demeanor"
        if score >= 60:
            return "Developing Professional Communication"
        return "Needs Professional Polish"


# Singleton instance
verbal_attitude_engine = VerbalAttitudeEngine()

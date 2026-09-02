"""
app/services/communication_engine.py
------------------------------------
Communication & Linguistic Analysis Engine for GetHire.
Evaluates answer clarity, structured reasoning, STAR methodology markers,
and filler phrase density with explainable feedback.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List


FILLER_PATTERNS: List[str] = [
    r"\bum\b", r"\buh\b", r"\byou know\b", r"\bkind of\b", r"\bsort of\b",
    r"\bbasically\b", r"\blike,\b", r"\bstuff like that\b", r"\bi mean\b",
]

REASONING_MARKERS: List[str] = [
    "because", "therefore", "consequently", "for example", "specifically",
    "as a result", "in order to", "on the other hand", "tradeoff", "firstly",
    "secondly", "finally", "in production", "architected", "implemented",
]

STAR_MARKERS: List[str] = [
    "situation", "task", "action", "result", "my role was", "the outcome was",
    "we delivered", "improved by", "reduced by", "increased by",
]


@dataclass
class CommunicationAnalysisResult:
    """Detailed linguistic metrics and communication score."""
    score: int
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    filler_count: int = 0
    structure_rating: str = "Adequate"  # "Exemplary" | "Well Structured" | "Adequate" | "Needs Improvement"
    explanation: str = ""


def analyze_communication(answer_text: str) -> CommunicationAnalysisResult:
    """
    Score the candidate's communication quality and return explainable feedback.
    """
    if not answer_text or not answer_text.strip():
        return CommunicationAnalysisResult(
            score=0,
            weaknesses=["No answer provided."],
            structure_rating="Needs Improvement",
            explanation="Empty response submitted.",
        )

    words = answer_text.strip().split()
    word_count = len(words)
    lower_text = answer_text.lower()

    # 1. Filler Phrase Detection
    filler_count = 0
    for pat in FILLER_PATTERNS:
        matches = re.findall(pat, lower_text)
        filler_count += len(matches)

    # 2. Reasoning & Structure Marker Density
    matched_reasoning = [m for m in REASONING_MARKERS if m in lower_text]
    matched_star = [s for s in STAR_MARKERS if s in lower_text]

    # 3. Base Score Calculation
    base = 70  # starting baseline for complete response

    # Reward word length depth (up to +15)
    if word_count >= 80:
        base += 15
    elif word_count >= 40:
        base += 10
    elif word_count < 20:
        base -= 25

    # Reward structured transitions (+5 per unique reasoning marker, up to +15)
    structure_bonus = min(15, len(matched_reasoning) * 5)
    base += structure_bonus

    # Reward STAR markers (+5 each, up to +10)
    star_bonus = min(10, len(matched_star) * 5)
    base += star_bonus

    # Penalty for high filler density (-4 per filler, max -20)
    filler_penalty = min(20, filler_count * 4)
    base -= filler_penalty

    final_score = int(round(min(100, max(15, base))))

    # 4. Generate Explainable Feedback
    strengths: List[str] = []
    weaknesses: List[str] = []

    if len(matched_reasoning) >= 2:
        strengths.append(f"Clear logical transitions using reasoning markers ({', '.join(matched_reasoning[:3])})")

    if matched_star:
        strengths.append("Demonstrated outcome-driven framing with measurable or action-oriented phrasing")

    if filler_count == 0 and word_count >= 40:
        strengths.append("Articulate delivery with zero filler phrase distractions")
    elif filler_count >= 3:
        weaknesses.append(f"Observed {filler_count} filler phrases; practice deliberate pauses over verbal crutches")

    if word_count < 35:
        weaknesses.append("Response is overly concise; elaborate further on your decision-making process")

    # Determine Rating
    if final_score >= 88:
        rating = "Exemplary"
    elif final_score >= 75:
        rating = "Well Structured"
    elif final_score >= 60:
        rating = "Adequate"
    else:
        rating = "Needs Improvement"

    explanation = (
        f"Communication scored at {final_score}/100 ({rating}) based on clarity, "
        f"{len(matched_reasoning)} logical markers, and {filler_count} filler words."
    )

    return CommunicationAnalysisResult(
        score=final_score,
        strengths=strengths,
        weaknesses=weaknesses,
        filler_count=filler_count,
        structure_rating=rating,
        explanation=explanation,
    )

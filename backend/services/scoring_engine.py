"""
scoring_engine.py
-----------------
Final Weighted Score Calculator for GetHire.

Implements the TRD scoring formula:
    Overall Score = 0.50 × Technical + 0.20 × Communication
                  + 0.15 × Face + 0.15 × Voice

Recommendation thresholds:
    ≥ 80 → Strong Hire  (green)
    65–79 → Hire        (blue)
    50–64 → Maybe       (yellow)
    < 50  → No Hire     (red)
"""

from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Weights (from TRD Module 6)
# ---------------------------------------------------------------------------

WEIGHT_TECHNICAL: float = 0.50
WEIGHT_COMMUNICATION: float = 0.20
WEIGHT_FACE: float = 0.15
WEIGHT_VOICE: float = 0.15


# ---------------------------------------------------------------------------
# Recommendation thresholds
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Recommendation:
    label: str
    color: str       # hex color for UI
    min_score: float


RECOMMENDATIONS: list[Recommendation] = [
    Recommendation("Strong Hire", "#22c55e", 80.0),   # green
    Recommendation("Hire",        "#3b82f6", 65.0),   # blue
    Recommendation("Maybe",       "#f59e0b", 50.0),   # amber
    Recommendation("No Hire",     "#ef4444", 0.0),    # red
]


# ---------------------------------------------------------------------------
# Result model
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ScoreResult:
    technical_score: float
    communication_score: float
    face_score: float
    voice_score: float
    overall_score: float
    recommendation: str
    recommendation_color: str
    component_breakdown: dict[str, float]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_overall_score(
    technical_score: float,
    communication_score: float,
    face_score: float = 75.0,
    voice_score: float = 70.0,
) -> ScoreResult:
    """
    Compute the final weighted interview score and hiring recommendation.

    Args:
        technical_score:    0–100 from answer evaluation
        communication_score: 0–100 from communication analysis
        face_score:         0–100 from face emotion model (mock: default 75)
        voice_score:        0–100 from voice emotion model (mock: default 70)

    Returns:
        ScoreResult with overall score, recommendation, and breakdown.
    """
    # Clamp inputs to [0, 100]
    t = max(0.0, min(100.0, technical_score))
    c = max(0.0, min(100.0, communication_score))
    f = max(0.0, min(100.0, face_score))
    v = max(0.0, min(100.0, voice_score))

    overall = (
        t * WEIGHT_TECHNICAL
        + c * WEIGHT_COMMUNICATION
        + f * WEIGHT_FACE
        + v * WEIGHT_VOICE
    )
    overall = round(overall, 1)

    # Select recommendation
    rec = RECOMMENDATIONS[-1]  # default: No Hire
    for r in RECOMMENDATIONS:
        if overall >= r.min_score:
            rec = r
            break

    return ScoreResult(
        technical_score=round(t, 1),
        communication_score=round(c, 1),
        face_score=round(f, 1),
        voice_score=round(v, 1),
        overall_score=overall,
        recommendation=rec.label,
        recommendation_color=rec.color,
        component_breakdown={
            "Technical (50%)": round(t * WEIGHT_TECHNICAL, 1),
            "Communication (20%)": round(c * WEIGHT_COMMUNICATION, 1),
            "Face Emotion (15%)": round(f * WEIGHT_FACE, 1),
            "Voice Emotion (15%)": round(v * WEIGHT_VOICE, 1),
        },
    )


def aggregate_answer_scores(answers: list[dict]) -> tuple[float, float]:
    """
    Average technical and communication scores across all interview answers.

    Args:
        answers: List of answer dicts with 'technical_score' and 'communication_score'.

    Returns:
        (avg_technical, avg_communication) tuple.
    """
    if not answers:
        return 0.0, 0.0

    tech_scores = [a.get("technical_score", 0) for a in answers]
    comm_scores = [a.get("communication_score", 0) for a in answers]

    avg_tech = sum(tech_scores) / len(tech_scores)
    avg_comm = sum(comm_scores) / len(comm_scores)

    return round(avg_tech, 1), round(avg_comm, 1)


def generate_mock_emotion_scores(answers: list[dict]) -> tuple[float, float]:
    """
    Generate realistic mock emotion scores based on answer quality.
    
    In production, these come from:
    - Face score: EfficientNetB0 model on FER-2013
    - Voice score: CNN+BiLSTM on RAVDESS/CREMA-D/TESS/SAVEE
    
    This mock approximates confidence as proportional to answer quality,
    with realistic variance to simulate real emotion detection.

    Args:
        answers: List of scored answer dicts.

    Returns:
        (face_score, voice_score) tuple — both 0–100.
    """
    if not answers:
        return 68.0, 65.0

    tech_scores = [a.get("technical_score", 50) for a in answers]
    avg_tech = sum(tech_scores) / len(tech_scores)

    import random
    rng = random.Random(42)  # Fixed seed for determinism per session

    # Face confidence correlates with technical competence (±10 variance)
    face_base = avg_tech * 0.85 + 12
    face_score = face_base + rng.uniform(-8, 8)

    # Voice confidence slightly lower (nervousness factor)
    voice_base = avg_tech * 0.75 + 15
    voice_score = voice_base + rng.uniform(-10, 6)

    return (
        round(max(30.0, min(100.0, face_score)), 1),
        round(max(25.0, min(100.0, voice_score)), 1),
    )

"""
backend/tests/test_visual_presentation.py
-------------------------------------------
Tests for Prompt 3: Visual Presentation, Confidence Poise, Gaze Reflection,
and Verbal Demeanor Synthesis.
"""

import pytest
from app.services.facesense.verbal_attitude_engine import verbal_attitude_engine
from app.services.facesense.confidence_engine import confidence_engine
from app.services.facesense.eye_contact_engine import eye_contact_engine
from app.services.facesense.event_engine import event_engine
from app.services.facesense.facesense_service import facesense_service


def test_verbal_attitude_engine_respectful_and_structured():
    """Verify verbal attitude engine extracts respectful markers, STAR structure, and quotes."""
    transcripts = [
        {
            "answer_text": "Thank you for the question. In my experience, to begin with, our team collaborated on a distributed caching system. As a result, latency dropped 40%."
        },
        {
            "answer_text": "Great question. To clarify, the challenge was cache invalidation race conditions. Specifically, the action I took was implementing versioned leases."
        },
        {
            "answer_text": "Building on that, we worked together to establish rigorous telemetry. In summary, our outcome was 99.99% cache consistency.",
            "is_follow_up": True,
        },
    ]

    result = verbal_attitude_engine.evaluate_professional_presence(transcripts, None)

    assert result["professional_presence_score"] >= 80
    assert result["respectful_language_observed"] is True
    assert result["clarity_organization_level"] in ("High", "Moderate")
    assert "Receptive" in result["follow_up_receptiveness"]
    assert len(result["evidence_quotes"]) >= 2
    assert len(result["strengths"]) >= 1
    # Ensure feedback contains constructive professional wording rather than psychological labels
    assert "Candidate demonstrated a" in result["constructive_summary"]
    for forbidden in ["nervous", "dishonest", "arrogant", "lying"]:
        assert forbidden not in result["constructive_summary"].lower()


def test_verbal_attitude_engine_empty_or_sparse():
    """Verify verbal attitude engine returns neutral, constructive baseline when transcripts are missing."""
    result = verbal_attitude_engine.evaluate_professional_presence([])
    assert result["professional_presence_score"] == 75
    assert result["rating_band"] == "Adequate Professional Presence"
    assert "Complete interview turns" in result["constructive_summary"]


def test_confidence_engine_purely_physical_metrics():
    """Verify confidence is derived strictly from physical poise (eye contact, posture, head stability)."""
    # High physical poise
    res_high = confidence_engine.compute_confidence(
        eye_contact_score=90.0,
        head_stability_score=92.0,
        posture_stability_score=95.0,
        smile_pct=15.0,
        emotion_label="Neutral",
        emotion_confidence=0.9,
    )
    assert res_high["confidence_score"] >= 85
    assert res_high["confidence_rating"] == "Polished & Poised Presentation"

    # Verify no emotional penalty is applied for expressions
    res_serious = confidence_engine.compute_confidence(
        eye_contact_score=90.0,
        head_stability_score=90.0,
        posture_stability_score=90.0,
        smile_pct=0.0,
        emotion_label="Serious",
        emotion_confidence=0.95,
    )
    assert res_serious["confidence_score"] >= 80


def test_eye_contact_engine_cognitive_reflection_leeway():
    """Verify thinking pause gaze shifts are accommodated as natural reflection rather than disengagement."""
    # During thinking pause: candidate looking away slightly (yaw = 18 degrees)
    thinking_gaze = eye_contact_engine.analyze_gaze(
        yaw=18.0,
        pitch=5.0,
        eye_contact_input=None,
        looking_away_duration_sec=1.5,
        is_thinking_pause=True,
    )
    assert thinking_gaze["direction_status"] == "Natural Thinking Pause (Gaze Shift)"
    assert thinking_gaze["eye_contact_score"] >= 80.0

    # Outside thinking pause: candidate looking away for 5 seconds
    distracted_gaze = eye_contact_engine.analyze_gaze(
        yaw=25.0,
        pitch=10.0,
        eye_contact_input=None,
        looking_away_duration_sec=5.0,
        is_thinking_pause=False,
    )
    assert distracted_gaze["direction_status"] in ("Looking Right", "Looking Left")
    assert distracted_gaze["eye_contact_score"] < 70.0


def test_eye_contact_downward_surface_notes():
    """Verify looking down at notes or desk is correctly distinguished."""
    downward = eye_contact_engine.analyze_gaze(
        yaw=2.0,
        pitch=22.0,
        looking_away_duration_sec=2.0,
        is_thinking_pause=False,
    )
    assert downward["direction_status"] == "Looking Down (Notes / Surface)"


def test_event_engine_objective_behavioral_labels():
    """Verify event engine outputs objective behavioral observations without psychological assumptions."""
    sample_thinking = {
        "timestamp_sec": 4.0,
        "direction_status": "Natural Thinking Pause (Gaze Shift)",
        "eye_contact_score": 82.0,
        "head_stability_score": 85.0,
        "overall_facescore": 85,
    }
    events = event_engine.evaluate_frame_events(sample_thinking, None, "q1", 4.0)
    assert any(ev["event_type"] == "Thinking Gaze Shift" for ev in events)
    for ev in events:
        for forbidden in ["nervous", "lying", "dishonest", "arrogant"]:
            assert forbidden not in ev["description"].lower()


@pytest.mark.asyncio
async def test_facesense_finish_insufficient_data():
    """Verify finish_session reports 'insufficient_data' when fewer than 5 samples exist."""
    class FakeDb:
        def __init__(self):
            self.docs = {
                "facesense_sessions": {
                    "session_id": "test_sess_sparse",
                    "user_id": "user_1",
                    "visual_analysis_enabled": True,
                    "samples": [
                        {"timestamp_sec": 1.0, "eye_contact_score": 85.0, "direction_status": "Direct Eye Contact"}
                    ],
                }
            }

        def __getitem__(self, item):
            parent = self
            class FakeCol:
                async def find_one(self, query):
                    if item == "facesense_sessions":
                        return parent.docs.get("facesense_sessions")
                    return None

                async def update_one(self, filter_q, update_q):
                    pass

                def find(self, query):
                    class FakeCursor:
                        def sort(self, *args):
                            return self
                        async def to_list(self, length):
                            return []
                    return FakeCursor()
            return FakeCol()

    fake_db = FakeDb()
    res = await facesense_service.finish_session(fake_db, "test_sess_sparse", "user_1")
    assert res["data_quality_status"] == "insufficient_data"
    assert res["visual_presentation_score"] is None
    assert "minimum 5 continuous samples" in res["data_quality_reason"]


@pytest.mark.asyncio
async def test_facesense_finish_candidate_disabled():
    """Verify finish_session reports 'disabled' when candidate opted out."""
    class FakeDb:
        def __init__(self):
            self.docs = {
                "facesense_sessions": {
                    "session_id": "test_sess_disabled",
                    "user_id": "user_1",
                    "visual_analysis_enabled": False,
                    "samples": [],
                }
            }

        def __getitem__(self, item):
            parent = self
            class FakeCol:
                async def find_one(self, query):
                    if item == "facesense_sessions":
                        return parent.docs.get("facesense_sessions")
                    return None

                async def update_one(self, filter_q, update_q):
                    pass

                def find(self, query):
                    class FakeCursor:
                        def sort(self, *args):
                            return self
                        async def to_list(self, length):
                            return []
                    return FakeCursor()
            return FakeCol()

    fake_db = FakeDb()
    res = await facesense_service.finish_session(fake_db, "test_sess_disabled", "user_1")
    assert res["data_quality_status"] == "disabled"
    assert "disabled by the candidate" in res["data_quality_reason"]


@pytest.mark.asyncio
async def test_facesense_finish_sufficient_data():
    """Verify finish_session computes presentation poise, eye contact, and posture stability when data is sufficient."""
    samples = [
        {
            "timestamp_sec": i * 1.0,
            "eye_contact_score": 85.0,
            "direction_status": "Direct Eye Contact" if i != 2 else "Natural Thinking Pause (Gaze Shift)",
            "head_stability_score": 88.0,
            "posture_stability_score": 87.0,
            "overall_facescore": 86,
            "confidence_score": 85.0,
            "stress_score": 15.0,
            "attention_score": 88.0,
            "presence_score": 90.0,
            "emotion_label": "Neutral" if i < 4 else "Focused",
        }
        for i in range(8)
    ]

    class FakeDb:
        def __init__(self):
            self.docs = {
                "facesense_sessions": {
                    "session_id": "test_sess_sufficient",
                    "user_id": "user_1",
                    "visual_analysis_enabled": True,
                    "samples": samples,
                }
            }

        def __getitem__(self, item):
            parent = self
            class FakeCol:
                async def find_one(self, query):
                    if item == "facesense_sessions":
                        return parent.docs.get("facesense_sessions")
                    return None

                async def update_one(self, filter_q, update_q):
                    pass

                def find(self, query):
                    class FakeCursor:
                        def sort(self, *args):
                            return self
                        async def to_list(self, length):
                            return [
                                {
                                    "answer_text": "Thank you. In my experience, we designed the cache using Redis clusters. As a result, throughput doubled."
                                }
                            ]
                    return FakeCursor()
            return FakeCol()

    fake_db = FakeDb()
    res = await facesense_service.finish_session(fake_db, "test_sess_sufficient", "user_1")
    assert res["data_quality_status"] == "sufficient"
    assert res["visual_presentation_score"] >= 80
    assert res["camera_facing_consistency_pct"] == 100.0  # All samples were Direct or Thinking Pause
    assert res["posture_stability_pct"] == 87.0
    assert len(res["strengths"]) >= 1
    assert res["verbal_attitude_assessment"] is not None

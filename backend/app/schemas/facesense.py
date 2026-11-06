"""
app/schemas/facesense.py
-------------------------
Pydantic v2 validation schemas for FaceSense Intelligence Engine REST endpoints.
Includes Visual Presentation and Non-Verbal Communication Analysis schemas.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class StartFaceSenseRequest(BaseModel):
    """Payload to initialize FaceSense monitoring for an interview session."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")
    visual_analysis_enabled: bool = Field(default=True, description="Whether candidate opted into visual analysis")


class FinishFaceSenseRequest(BaseModel):
    """Payload to finalize FaceSense session and compute overall analytics."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")


class ToggleVisualAnalysisRequest(BaseModel):
    """Payload to toggle visual presentation analysis on or off mid-interview."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")
    enabled: bool = Field(..., description="Whether visual presentation analysis should be enabled")


class FaceSenseMetricsBatchRequest(BaseModel):
    """Payload for periodic physical landmark and visual presentation metrics feed."""
    session_id: str = Field(default="default_session", min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")
    question_id: Optional[str] = Field(default=None, max_length=100, description="Optional question ID")
    timestamp_sec: float = Field(default=0.0, ge=0.0, le=86400.0, description="Timestamp in seconds")
    pitch: Optional[float] = Field(default=0.0, ge=-180.0, le=180.0, description="Head pitch angle in degrees")
    yaw: Optional[float] = Field(default=0.0, ge=-180.0, le=180.0, description="Head yaw angle in degrees")
    roll: Optional[float] = Field(default=0.0, ge=-180.0, le=180.0, description="Head roll angle in degrees")
    face_visible: bool = Field(default=True, description="Whether face is detected in frame")
    eye_contact_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Instant eye contact percent")
    blink_rate_bpm: Optional[float] = Field(default=None, ge=0.0, le=300.0, description="Estimated blink rate in BPM")
    smile_pct: Optional[float] = Field(default=0.0, ge=0.0, le=100.0, description="Smile intensity percentage")
    emotion_label: Optional[str] = Field(default="Neutral", max_length=50, description="Observable facial expression classification label")
    emotion_confidence: Optional[float] = Field(default=0.85, ge=0.0, le=1.0, description="Expression detection confidence")
    face_box: Optional[List[float]] = Field(default_factory=lambda: [0.2, 0.1, 0.6, 0.7], description="Normalized bounding box [x, y, w, h]")
    is_thinking_pause: Optional[bool] = Field(default=False, description="Whether turn is in initial cognitive reflection phase")
    multiple_faces_detected: Optional[bool] = Field(default=False, description="Whether more than one face was seen")
    lighting_condition: Optional[str] = Field(default="adequate", description="Lighting check: adequate | low_light | overexposed")
    visual_analysis_enabled: Optional[bool] = Field(default=True, description="Whether candidate has visual analysis enabled")


class VisualPresentationSummaryOut(BaseModel):
    """Structured evaluation report model for Visual and Non-Verbal Presentation."""
    session_id: str
    status: str
    data_quality_status: str = Field(description="sufficient | insufficient_data | disabled")
    data_quality_reason: Optional[str] = None
    visual_presentation_score: Optional[int] = None
    camera_facing_consistency_pct: Optional[float] = None
    eye_contact_consistency_pct: Optional[float] = None
    posture_stability_pct: Optional[float] = None
    expression_variation_score: Optional[float] = None
    presentation_stability_score: Optional[float] = None
    verbal_attitude_assessment: Optional[Dict[str, Any]] = None
    strengths: List[str] = Field(default_factory=list)
    areas_for_improvement: List[str] = Field(default_factory=list)
    constructive_summary: Optional[str] = None
    timeline: Optional[Dict[str, Any]] = None
    question_analytics: Optional[List[Dict[str, Any]]] = None

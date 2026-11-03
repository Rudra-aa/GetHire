"""
app/schemas/facesense.py
-------------------------
Pydantic v2 validation schemas for FaceSense Intelligence Engine REST endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class StartFaceSenseRequest(BaseModel):
    """Payload to initialize FaceSense monitoring for an interview session."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")


class FinishFaceSenseRequest(BaseModel):
    """Payload to finalize FaceSense session and compute overall analytics."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")


class FaceSenseMetricsBatchRequest(BaseModel):
    """Payload for 1-second batched physical landmark and metrics feed."""
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
    emotion_label: Optional[str] = Field(default="Neutral", max_length=50, description="Emotion classification label")
    face_box: Optional[List[float]] = Field(default_factory=lambda: [0.2, 0.1, 0.6, 0.7], description="Normalized bounding box [x, y, w, h]")

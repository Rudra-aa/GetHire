"""
app/schemas/integrity.py
-------------------------
Pydantic v2 validation schemas for Interview Intelligence & Integrity Engine endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class StartIntegritySessionRequest(BaseModel):
    """Payload to initialize Interview Intelligence telemetry session."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")


class FinishIntegritySessionRequest(BaseModel):
    """Payload to finalize Interview Intelligence session and generate integrity report."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")


class LogIntegrityEventRequest(BaseModel):
    """Payload to log browser or behavioral integrity events."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")
    event_type: Optional[str] = Field(default=None, max_length=50, description="Event type identifier")
    question_id: Optional[str] = Field(default=None, max_length=100, description="Associated question ID")
    timestamp_sec: float = Field(default=0.0, ge=0.0, le=86400.0, description="Event timestamp in seconds")
    duration_sec: Optional[float] = Field(default=0.0, ge=0.0, le=86400.0, description="Duration in seconds")
    details: Optional[str] = Field(default=None, max_length=1000, description="Event details or context")


class IntegrityTelemetryRequest(BaseModel):
    """Payload for real-time 1-second telemetry samples."""
    session_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[0-9a-zA-Z_\-]+$", description="Interview Session ID")
    mic_level: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Mic audio amplitude level 0-100")
    fps: Optional[float] = Field(default=None, ge=0.0, le=240.0, description="Camera feed FPS")
    latency_ms: Optional[float] = Field(default=None, ge=0.0, le=10000.0, description="Network round-trip latency in ms")
    face_count: Optional[int] = Field(default=None, ge=0, le=20, description="Detected faces count")

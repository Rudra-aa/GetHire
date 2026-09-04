"""
app/models/facesense.py
-----------------------
MongoDB Pydantic schemas for FaceSense session metrics and behavioral events.
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class FaceSenseSample(BaseModel):
    timestamp_sec: float = 0.0
    question_id: Optional[str] = None
    emotion_label: str = "Neutral"
    emotion_confidence: float = 0.85
    eye_contact_score: float = 85.0
    direction_status: str = "Direct Eye Contact"
    head_stability_score: float = 85.0
    pitch: float = 0.0
    yaw: float = 0.0
    roll: float = 0.0
    blink_rate_bpm: float = 16.0
    smile_pct: float = 20.0
    attention_score: float = 85.0
    presence_score: float = 85.0
    confidence_score: float = 80.0
    stress_score: float = 20.0
    overall_facescore: int = 85
    face_visible: bool = True


class FaceSenseEventModel(BaseModel):
    session_id: str
    user_id: str
    event_type: str
    severity: str = "info"
    description: str
    metric: str
    timestamp_sec: float
    question_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FaceSenseSessionModel(BaseModel):
    session_id: str
    user_id: str
    status: str = "active"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    total_frames_processed: int = 0
    overall_facescore: int = 85
    avg_confidence: float = 80.0
    avg_stress: float = 20.0
    avg_eye_contact: float = 85.0
    avg_attention: float = 85.0
    avg_presence: float = 85.0
    samples: List[FaceSenseSample] = Field(default_factory=list)

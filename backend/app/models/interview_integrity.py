"""
app/models/interview_integrity.py
----------------------------------
MongoDB Pydantic schemas for Interview Intelligence sessions and integrity events.
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class InterviewIntegrityEventModel(BaseModel):
    session_id: str
    user_id: str
    event_type: str
    title: str
    severity: str = "low"
    description: str
    timestamp_sec: float
    duration_sec: float = 0.0
    question_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewIntegritySessionModel(BaseModel):
    session_id: str
    user_id: str
    status: str = "active"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    integrity_score: int = 100
    events_count: int = 0
    telemetry_samples_count: int = 0
    latest_telemetry: Optional[Dict[str, Any]] = None

"""
app/services/interview_intelligence/timeline_engine.py
-------------------------------------------------------
Timeline Aggregation Engine for Interview Intelligence.
Maintains structured, clickable chronological event logs correlated with question windows.

LOC Constraint: < 300 LOC
Single Responsibility: Chronological Telemetry & Event Timeline Formatting
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


class IntelligenceTimelineEngine:
    """Formats and sorts chronological event logs."""

    def format_event_log(
        self,
        event_type: str,
        title: str,
        severity: str,
        description: str,
        timestamp_sec: float,
        duration_sec: float = 0.0,
        question_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Builds a structured event record.
        """
        return {
            "event_type": event_type,
            "title": title,
            "severity": severity,  # info, low, medium, high
            "description": description,
            "timestamp_sec": round(timestamp_sec, 1),
            "duration_sec": round(duration_sec, 1),
            "question_id": question_id,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def aggregate_timeline(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sorts events chronologically for visual rendering.
        """
        return sorted(events, key=lambda x: x.get("timestamp_sec", 0.0))


# Singleton instance
intelligence_timeline_engine = IntelligenceTimelineEngine()

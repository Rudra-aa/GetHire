"""
app/services/interview_intelligence/session_health.py
------------------------------------------------------
Session Health & Network Performance Engine for Interview Intelligence.
Tracks FPS, processing latency, network latency, dropped frames, and connection state.

LOC Constraint: < 300 LOC
Single Responsibility: Telemetry Performance & Connection Diagnostics
"""

from __future__ import annotations

from typing import Dict, Any


class SessionHealthEngine:
    """Evaluates client-server connection performance and processing latency."""

    def evaluate_session_health(self, health_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates session health metrics.
        """
        fps = int(health_data.get("fps", 30))
        latency_ms = int(health_data.get("latency_ms", 25))
        dropped_frames = int(health_data.get("dropped_frames", 0))
        connection_status = health_data.get("connection_status", "Optimal")

        if fps < 10 or latency_ms > 400:
            status = "Degraded Connection / Low FPS"
        elif latency_ms > 180:
            status = "Moderate Latency"
        else:
            status = "Optimal Connection"

        return {
            "fps": fps,
            "latency_ms": latency_ms,
            "dropped_frames": dropped_frames,
            "connection_status": connection_status,
            "health_summary": status,
        }


# Singleton instance
session_health_engine = SessionHealthEngine()

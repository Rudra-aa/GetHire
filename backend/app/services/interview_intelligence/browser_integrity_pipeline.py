"""
app/services/interview_intelligence/browser_integrity_pipeline.py
-------------------------------------------------------------------
Browser Integrity Pipeline for Interview Intelligence.
Evaluates browser events (tab switches, window blur, fullscreen exits, copy/paste attempts, devtools).

LOC Constraint: < 300 LOC
Single Responsibility: Browser Event Processing & Severity Evaluation
"""

from __future__ import annotations

from typing import Dict, Any, Optional


class BrowserIntegrityPipeline:
    """Evaluates objective browser integrity events."""

    def evaluate_browser_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes client-side browser event and assigns severity & penalty weight.
        """
        event_type = event_data.get("event_type", "unknown")
        duration_sec = float(event_data.get("duration_sec", 0.0))
        details = event_data.get("details", "")

        severity = "low"
        penalty = 2.0
        title = "Browser Event Logged"

        if event_type == "tab_switched":
            title = "Tab Switched"
            if duration_sec > 10.0:
                severity = "high"
                penalty = 10.0
            elif duration_sec > 3.0:
                severity = "medium"
                penalty = 6.0
            else:
                severity = "low"
                penalty = 3.0

        elif event_type == "fullscreen_exited":
            title = "Fullscreen Exited"
            severity = "medium"
            penalty = 5.0

        elif event_type in ["copy_attempt", "paste_attempt", "cut_attempt"]:
            title = f"{event_type.replace('_', ' ').title()}"
            severity = "medium"
            penalty = 4.0

        elif event_type == "devtools_opened":
            title = "Developer Tools Opened"
            severity = "high"
            penalty = 12.0

        elif event_type == "window_blur":
            title = "Window Focus Lost"
            severity = "low"
            penalty = 2.0

        return {
            "event_type": event_type,
            "title": title,
            "severity": severity,  # low, medium, high
            "duration_sec": round(duration_sec, 1),
            "penalty_points": penalty,
            "details": details or f"{title} (duration: {round(duration_sec, 1)}s)",
        }


# Singleton instance
browser_integrity_pipeline = BrowserIntegrityPipeline()

"""
app/services/interview_intelligence/camera_monitor.py
------------------------------------------------------
Camera & Video Feed Monitoring Engine for Interview Intelligence.
Tracks camera connectivity, face count (0, 1, 2+ faces), and stream health.

LOC Constraint: < 300 LOC
Single Responsibility: Camera Stream & Face Count Telemetry
"""

from __future__ import annotations

from typing import Dict, Any, Optional


class CameraMonitor:
    """Monitors webcam stream health, multi-face presence, and camera loss."""

    def evaluate_camera_telemetry(self, camera_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates camera connectivity, face count, and stream status.
        """
        connected = bool(camera_data.get("camera_connected", True))
        face_count = int(camera_data.get("face_count", 1 if camera_data.get("face_visible", True) else 0))

        if not connected:
            status = "Camera Disconnected"
            severity = "high"
            is_valid = False
        elif face_count == 0:
            status = "Face Not Visible"
            severity = "medium"
            is_valid = False
        elif face_count >= 2:
            status = f"Multiple Faces Detected ({face_count} faces)"
            severity = "high"
            is_valid = True
        else:
            status = "Camera Active & Single Face Clear"
            severity = "info"
            is_valid = True

        return {
            "camera_connected": connected,
            "face_count": face_count,
            "status": status,
            "severity": severity,
            "is_valid": is_valid,
            "fps": int(camera_data.get("fps", 30)),
        }


# Singleton instance
camera_monitor = CameraMonitor()

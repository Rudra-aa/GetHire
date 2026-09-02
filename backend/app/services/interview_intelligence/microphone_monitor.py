"""
app/services/interview_intelligence/microphone_monitor.py
----------------------------------------------------------
Microphone & Ambient Noise Monitoring Engine for Interview Intelligence.
Measures audio level, background noise, silence, and sudden noise spikes.

LOC Constraint: < 300 LOC
Single Responsibility: Microphone Telemetry & Ambient Noise Evaluation
"""

from __future__ import annotations

from typing import Dict, Any, Optional


class MicrophoneMonitor:
    """Evaluates microphone connection, audio input levels, and noise events."""

    def evaluate_audio_telemetry(self, audio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes microphone input volume level (0-100) and detects noise spikes.
        """
        connected = bool(audio_data.get("mic_connected", True))
        volume_level = float(audio_data.get("volume_level", 45.0))  # 0 to 100
        noise_spike = bool(audio_data.get("noise_spike", False))

        if not connected:
            status = "Microphone Muted / Disconnected"
            severity = "medium"
        elif noise_spike or volume_level > 85.0:
            status = "Sudden High Noise Spike Detected"
            severity = "medium"
        elif volume_level < 5.0:
            status = "Audio Silent / Unusually Low"
            severity = "low"
        else:
            status = "Microphone Active (Normal Speech Level)"
            severity = "info"

        return {
            "mic_connected": connected,
            "volume_level": round(volume_level, 1),
            "status": status,
            "severity": severity,
            "noise_spike": noise_spike,
        }


# Singleton instance
microphone_monitor = MicrophoneMonitor()

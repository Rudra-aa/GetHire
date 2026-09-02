"""
app/services/facesense/timeline_engine.py
------------------------------------------
Timeline & Question Correlation Engine for FaceSense.
Correlates behavioral events, trends, and real-time metrics per interview question window.

LOC Constraint: < 300 LOC
Single Responsibility: Behavioral Timeline & Question Correlation
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
import numpy as np


class TimelineEngine:
    """Aggregates timestamped metrics into visual timeline series and question correlation."""

    def aggregate_timeline(self, metric_samples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates time series trends (Confidence, Stress, Eye Contact, Emotion) over full session.
        """
        if not metric_samples:
            return {"timeline_series": [], "emotion_distribution": {}, "overall_trends": {}}

        timestamps = []
        confidence_trend = []
        stress_trend = []
        eye_contact_trend = []
        attention_trend = []
        emotions_count: Dict[str, int] = {}

        for sample in metric_samples:
            t = sample.get("timestamp_sec", 0.0)
            timestamps.append(t)
            confidence_trend.append(sample.get("confidence_score", 80.0))
            stress_trend.append(sample.get("stress_score", 20.0))
            eye_contact_trend.append(sample.get("eye_contact_score", 85.0))
            attention_trend.append(sample.get("attention_score", 85.0))

            emo = sample.get("emotion_label", "Neutral")
            emotions_count[emo] = emotions_count.get(emo, 0) + 1

        total_samples = len(metric_samples)
        emotion_dist = {emo: round((cnt / total_samples) * 100.0, 1) for emo, cnt in emotions_count.items()}

        timeline_series = []
        # Sample or stride for clean chart rendering
        step = max(1, total_samples // 40)
        for i in range(0, total_samples, step):
            s = metric_samples[i]
            timeline_series.append({
                "timestamp_sec": s.get("timestamp_sec", 0.0),
                "question_id": s.get("question_id"),
                "confidence_score": s.get("confidence_score", 80.0),
                "stress_score": s.get("stress_score", 20.0),
                "eye_contact_score": s.get("eye_contact_score", 85.0),
                "attention_score": s.get("attention_score", 85.0),
                "emotion_label": s.get("emotion_label", "Neutral"),
            })

        return {
            "timeline_series": timeline_series,
            "emotion_distribution": emotion_dist,
            "overall_trends": {
                "avg_confidence": round(float(np.mean(confidence_trend)), 1),
                "avg_stress": round(float(np.mean(stress_trend)), 1),
                "avg_eye_contact": round(float(np.mean(eye_contact_trend)), 1),
                "avg_attention": round(float(np.mean(attention_trend)), 1),
            },
        }

    def correlate_questions(self, metric_samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups metrics by question_id to provide question-wise behavioral intelligence.
        """
        q_groups: Dict[str, List[Dict[str, Any]]] = {}
        for sample in metric_samples:
            q_id = sample.get("question_id") or "general"
            if q_id not in q_groups:
                q_groups[q_id] = []
            q_groups[q_id].append(sample)

        question_analytics = []
        for q_id, samples in q_groups.items():
            conf_list = [s.get("confidence_score", 80.0) for s in samples]
            stress_list = [s.get("stress_score", 20.0) for s in samples]
            eye_list = [s.get("eye_contact_score", 85.0) for s in samples]
            att_list = [s.get("attention_score", 85.0) for s in samples]

            emo_counts: Dict[str, int] = {}
            for s in samples:
                e = s.get("emotion_label", "Neutral")
                emo_counts[e] = emo_counts.get(e, 0) + 1
            top_emotion = max(emo_counts, key=emo_counts.get) if emo_counts else "Neutral"

            question_analytics.append({
                "question_id": q_id,
                "sample_count": len(samples),
                "avg_confidence": round(float(np.mean(conf_list)), 1),
                "avg_stress": round(float(np.mean(stress_list)), 1),
                "avg_eye_contact": round(float(np.mean(eye_list)), 1),
                "avg_attention": round(float(np.mean(att_list)), 1),
                "primary_emotion": top_emotion,
            })

        return question_analytics


# Singleton instance
timeline_engine = TimelineEngine()

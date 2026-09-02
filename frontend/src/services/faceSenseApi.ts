import apiClient from "@/services/api";

const API_BASE_URL = "/api/v1/facesense";

export interface FaceSenseMetricPayload {
  session_id: string;
  question_id?: string | undefined;
  timestamp_sec: number;
  pitch?: number | undefined;
  yaw?: number | undefined;
  roll?: number | undefined;
  face_visible?: boolean | undefined;
  eye_contact_pct?: number | undefined;
  blink_rate_bpm?: number | undefined;
  smile_pct?: number | undefined;
  face_box?: [number, number, number, number] | undefined;
  emotion_label?: string | undefined;
  emotion_confidence?: number | undefined;
  looking_away_duration_sec?: number | undefined;
}

export interface FaceSenseMetricSample {
  timestamp_sec: number;
  question_id?: string | undefined;
  emotion_label: string;
  emotion_confidence: number;
  eye_contact_score: number;
  direction_status: string;
  head_stability_score: number;
  pitch: number;
  yaw: number;
  roll: number;
  blink_rate_bpm: number;
  smile_pct: number;
  attention_score: number;
  presence_score: number;
  confidence_score: number;
  stress_score: number;
  overall_facescore: number;
  face_visible: boolean;
}

export interface FaceSenseSessionSummary {
  session_id: string;
  user_id: string;
  status: string;
  total_frames_processed: number;
  overall_facescore: number;
  avg_confidence: number;
  avg_stress: number;
  avg_eye_contact: number;
  avg_attention: number;
  avg_presence: number;
  timeline?: {
    timeline_series: FaceSenseMetricSample[];
    emotion_distribution: Record<string, number>;
    overall_trends: {
      avg_confidence: number;
      avg_stress: number;
      avg_eye_contact: number;
      avg_attention: number;
    };
  };
  question_analytics?: Array<{
    question_id: string;
    sample_count: number;
    avg_confidence: number;
    avg_stress: number;
    avg_eye_contact: number;
    avg_attention: number;
    primary_emotion: string;
  }>;
}

export interface FaceSenseEvent {
  id?: string;
  event_type: string;
  severity: "info" | "low" | "medium" | "high";
  description: string;
  metric: string;
  timestamp_sec: number;
  question_id?: string;
  created_at: string;
}

export const faceSenseApi = {
  startSession: async (sessionId: string): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/start`,
      { session_id: sessionId }
    );
    return res.data;
  },

  sendMetricsBatch: async (payload: FaceSenseMetricSample): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/metrics`,
      payload
    );
    return res.data;
  },

  finishSession: async (sessionId: string): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/finish`,
      { session_id: sessionId }
    );
    return res.data;
  },

  getSessionSummary: async (sessionId: string): Promise<FaceSenseSessionSummary> => {
    const res = await apiClient.get(
      `${API_BASE_URL}/session/${sessionId}`
    );
    return res.data;
  },

  getSessionTimeline: async (
    sessionId: string
  ): Promise<{ session_id: string; timeline: any; events: FaceSenseEvent[] }> => {
    const res = await apiClient.get(
      `${API_BASE_URL}/session/${sessionId}/timeline`
    );
    return res.data;
  },

  getEmotionTrend: async (sessionId: string, questionId: string): Promise<any[]> => {
    const res = await apiClient.get(
      `${API_BASE_URL}/session/${sessionId}/question/${questionId}/emotion`
    );
    return res.data;
  },
};

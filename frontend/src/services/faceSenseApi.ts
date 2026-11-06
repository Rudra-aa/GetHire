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
  is_thinking_pause?: boolean | undefined;
  multiple_faces_detected?: boolean | undefined;
  lighting_condition?: "adequate" | "low_light" | "overexposed" | string | undefined;
  visual_analysis_enabled?: boolean | undefined;
}

export interface FaceSenseMetricSample {
  timestamp_sec: number;
  question_id?: string | undefined;
  emotion_label: string;
  emotion_confidence: number;
  eye_contact_score: number;
  direction_status: string;
  head_stability_score: number;
  posture_stability_score?: number;
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
  is_thinking_pause?: boolean;
  multiple_faces_detected?: boolean;
  lighting_condition?: string;
  visual_analysis_enabled?: boolean;
}

export interface VerbalAttitudeAssessment {
  professional_presence_score: number;
  rating_band: string;
  verbal_communication_score: number;
  respectful_language_observed: boolean;
  clarity_organization_level: string;
  follow_up_receptiveness: string;
  evidence_quotes: string[];
  strengths: string[];
  areas_for_growth: string[];
  constructive_summary: string;
}

export interface FaceSenseSessionSummary {
  session_id: string;
  user_id?: string;
  status: string;
  data_quality_status?: "sufficient" | "insufficient_data" | "disabled";
  data_quality_reason?: string;
  visual_analysis_enabled?: boolean;
  total_frames_processed: number;
  overall_facescore?: number;
  visual_presentation_score?: number;
  camera_facing_consistency_pct?: number;
  eye_contact_consistency_pct?: number;
  posture_stability_pct?: number;
  expression_variation_score?: number;
  presentation_stability_score?: number;
  avg_confidence?: number;
  avg_stress?: number;
  avg_eye_contact?: number;
  avg_attention?: number;
  avg_presence?: number;
  verbal_attitude_assessment?: VerbalAttitudeAssessment;
  strengths?: string[];
  areas_for_improvement?: string[];
  constructive_summary?: string;
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
  startSession: async (sessionId: string, visualAnalysisEnabled: boolean = true): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/start`,
      { session_id: sessionId, visual_analysis_enabled: visualAnalysisEnabled }
    );
    return res.data;
  },

  toggleVisualAnalysis: async (sessionId: string, enabled: boolean): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/toggle`,
      { session_id: sessionId, enabled }
    );
    return res.data;
  },

  sendMetricsBatch: async (payload: FaceSenseMetricSample | FaceSenseMetricPayload): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/metrics`,
      payload
    );
    return res.data;
  },

  finishSession: async (sessionId: string): Promise<FaceSenseSessionSummary> => {
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

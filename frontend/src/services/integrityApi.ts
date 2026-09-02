import apiClient from "@/services/api";

const API_BASE_URL = "/api/v1/integrity";

export interface IntegrityEventPayload {
  session_id: string;
  question_id?: string | undefined;
  timestamp_sec: number;
  event_type: string;
  details?: string | undefined;
  duration_sec?: number | undefined;
}

export interface TelemetryPayload {
  session_id: string;
  timestamp_sec: number;
  camera_connected?: boolean | undefined;
  face_count?: number | undefined;
  mic_connected?: boolean | undefined;
  volume_level?: number | undefined;
  noise_spike?: boolean | undefined;
  fps?: number | undefined;
  latency_ms?: number | undefined;
}

export interface IntegritySessionSummary {
  session_id: string;
  status: string;
  integrity_score: number;
  integrity_rating: string;
  total_events: number;
  events: Array<{
    id?: string;
    event_type: string;
    title: string;
    severity: "info" | "low" | "medium" | "high";
    description: string;
    timestamp_sec: number;
    duration_sec: number;
    question_id?: string;
  }>;
  event_counts: Record<string, number>;
}

export const integrityApi = {
  startSession: async (sessionId: string): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/start`,
      { session_id: sessionId }
    );
    return res.data;
  },

  logEvent: async (payload: IntegrityEventPayload): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/event`,
      payload
    );
    return res.data;
  },

  sendTelemetryBatch: async (payload: TelemetryPayload): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/telemetry`,
      payload
    );
    return res.data;
  },

  finishSession: async (sessionId: string): Promise<IntegritySessionSummary> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/finish`,
      { session_id: sessionId }
    );
    return res.data;
  },

  getSessionReport: async (sessionId: string): Promise<IntegritySessionSummary> => {
    const res = await apiClient.get(
      `${API_BASE_URL}/session/${sessionId}/report`
    );
    return res.data;
  },
};

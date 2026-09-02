import apiClient from "@/services/api";

const API_BASE_URL = "/api/v1/career";

export interface EvolutionPoint {
  month: string;
  hirescore: number;
  technical: number;
  integrity: number;
  readiness_pct: number;
  session_id?: string;
}

export interface EvolutionTimelineResponse {
  user_id: string;
  has_sufficient_history?: boolean;
  starting_score: number;
  current_score: number;
  total_growth_points: number;
  growth_trajectory: string;
  evolution_points: EvolutionPoint[];
}

export const careerApi = {
  getEvolutionTimeline: async (): Promise<EvolutionTimelineResponse> => {
    const res = await apiClient.get(
      `${API_BASE_URL}/evolution`
    );
    return res.data;
  },

  createShareLink: async (): Promise<{ share_token: string; share_url: string }> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/share-link`
    );
    return res.data;
  },
};

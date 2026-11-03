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

export interface ShareSettings {
  configured: boolean;
  public_base_url?: string | null;
  share_token?: string | null;
  share_url?: string | null;
  is_public: boolean;
  include_assessment: boolean;
  include_interview: boolean;
  recordings_available: boolean;
  has_assessment: boolean;
  access_count?: number | null;
}

export interface PublicPortfolioData {
  candidate_name: string;
  target_role: string;
  experience_level: string;
  overall_hirescore: number;
  hiring_verdict: string;
  skills: string[];
  assessment_score?: number | null;
  assessment_concepts?: {
    strong_concepts?: string[];
    weak_concepts?: string[];
    category_breakdown?: Record<string, number>;
  } | null;
  components: Record<string, any>;
  verified: boolean;
}

export const careerApi = {
  getEvolutionTimeline: async (): Promise<EvolutionTimelineResponse> => {
    const res = await apiClient.get(`${API_BASE_URL}/evolution`);
    return res.data;
  },

  getShareSettings: async (): Promise<ShareSettings> => {
    const res = await apiClient.get(`${API_BASE_URL}/share-settings`);
    return res.data;
  },

  updateShareSettings: async (data: {
    is_public?: boolean;
    include_assessment?: boolean;
    include_interview?: boolean;
  }): Promise<ShareSettings> => {
    const res = await apiClient.patch(`${API_BASE_URL}/share-settings`, data);
    return res.data;
  },

  createShareLink: async (): Promise<{ share_token: string; share_url: string }> => {
    const res = await apiClient.post(`${API_BASE_URL}/share-link`);
    return res.data;
  },

  getPublicPortfolio: async (token: string): Promise<PublicPortfolioData> => {
    const res = await apiClient.get(`${API_BASE_URL}/portfolio/${token}`);
    return res.data;
  },
};

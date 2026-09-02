/**
 * src/services/hireScoreApi.ts
 * ----------------------------
 * Type-safe API client for Phase 5: HireScore Engine & Career Intelligence Platform.
 */

import apiClient from "@/services/api";

export interface HireScoreComponents {
  resume_quality: number;
  technical_accuracy: number;
  communication: number;
  problem_solving: number;
  concept_coverage: number;
  star_structure: number;
  interview_consistency: number;
  voicesense_score?: number | null;
  facesense_score?: number | null;
  confidence_score?: number | null;
  eye_contact_score?: number | null;
  speech_clarity_score?: number | null;
}

export interface ReadinessDetails {
  readiness_percentage: number;
  verdict: "Offer Ready" | "Hire" | "Borderline" | "Needs Improvement" | "Early Stage" | string;
  confidence_level: "High" | "Medium" | "Low" | string;
  summary: string;
}

export interface BenchmarkDetails {
  target_level: "Junior" | "Mid" | "Senior" | "Staff" | string;
  percentile: number;
  band: "Top Tier" | "Above Average" | "Average" | "Below Average" | string;
  relative_position: string;
  peer_averages: Record<string, number>;
}

export interface SkillGapItem {
  skill: string;
  severity: "Critical" | "High" | "Medium" | "Low" | string;
  reason: string;
  impact_score: number;
  learning_hours: number;
  recommended_resources: string[];
}

export interface RecommendationDetails {
  daily_tasks: string[];
  weekly_goals: string[];
  practice_questions: string[];
  resume_improvements: string[];
  project_suggestions: string[];
}

export interface RoadmapMilestone {
  week: number;
  title: string;
  focus_area: string;
  status: "completed" | "active" | "upcoming";
  deliverables: string[];
}

export interface HireScoreSummary {
  id: string;
  user_id: string;
  session_id?: string | null;
  resume_id?: string | null;
  overall_score: number;
  components: HireScoreComponents;
  readiness: ReadinessDetails;
  benchmark: BenchmarkDetails;
  gaps: SkillGapItem[];
  recommendations: RecommendationDetails;
  career_roadmap: RoadmapMilestone[];
  created_at: string;
  updated_at: string;
}

export interface HireScoreHistoryItem {
  id: string;
  overall_score: number;
  readiness_percentage: number;
  verdict: string;
  target_level: string;
  created_at: string;
}

export const hireScoreApi = {
  /**
   * Fetch the latest computed candidate HireScore and full intelligence summary.
   */
  async getLatestHireScore(sessionId?: string): Promise<HireScoreSummary> {
    const params = sessionId ? { session_id: sessionId } : undefined;
    const response = await apiClient.get("/api/v1/hirescore/latest", { params });
    return response.data.data;
  },

  /**
   * Force recalculation of candidate HireScore from newest evaluations and resume.
   */
  async recomputeHireScore(sessionId?: string): Promise<HireScoreSummary> {
    const payload = sessionId ? { session_id: sessionId } : {};
    const response = await apiClient.post("/api/v1/hirescore/recompute", payload);
    return response.data.data;
  },

  /**
   * Retrieve historical snapshots of HireScore over time.
   */
  async getHireScoreHistory(limit = 10): Promise<HireScoreHistoryItem[]> {
    const response = await apiClient.get("/api/v1/hirescore/history", { params: { limit } });
    return response.data.data;
  },

  /**
   * Get candidate industry level benchmark calibration.
   */
  async getBenchmark(): Promise<BenchmarkDetails> {
    const response = await apiClient.get("/api/v1/hirescore/benchmark");
    return response.data.data;
  },

  /**
   * Get ranked skill gap analysis and remediation paths.
   */
  async getGapAnalysis(): Promise<SkillGapItem[]> {
    const response = await apiClient.get("/api/v1/hirescore/gap-analysis");
    return response.data.data;
  },

  /**
   * Get personalized actionable recommendations.
   */
  async getRecommendations(): Promise<RecommendationDetails> {
    const response = await apiClient.get("/api/v1/hirescore/recommendations");
    return response.data.data;
  },

  /**
   * Get the adaptive 6-week career roadmap.
   */
  async getCareerRoadmap(): Promise<RoadmapMilestone[]> {
    const response = await apiClient.get("/api/v1/hirescore/career-roadmap");
    return response.data.data;
  },
};

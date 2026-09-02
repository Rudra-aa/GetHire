/**
 * src/services/evaluationApi.ts
 * -----------------------------
 * Client API for Phase 4: Evaluation Engine.
 */

import apiClient from "@/services/api";

export interface DimensionScore {
  score: number;
  strengths: string[];
  weaknesses: string[];
  explanation: string;
}

export interface EvaluationScores {
  overall: number;
  technical_accuracy: DimensionScore;
  concept_coverage: DimensionScore;
  problem_solving: DimensionScore;
  communication: DimensionScore;
  completeness: DimensionScore;
  confidence?: DimensionScore;
  presence?: DimensionScore;
}

export interface FollowUpRecommendation {
  follow_up_required: boolean;
  follow_up_reason?: string;
  suggested_follow_up?: string;
}

export interface EvaluationDetail {
  id: string;
  session_id: string;
  question_id: string;
  answer_id?: string;
  user_id: string;
  overall_score: number;
  scores: EvaluationScores;
  strengths: string[];
  weaknesses: string[];
  recommended_improvements: string[];
  follow_up: FollowUpRecommendation;
  rubric_snapshot: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BatchEvaluationResponse {
  session_id: string;
  overall_interview_score: number;
  total_evaluated: number;
  average_dimensions: {
    technical_accuracy: number;
    concept_coverage: number;
    problem_solving: number;
    communication: number;
    completeness: number;
  };
  evaluations: EvaluationDetail[];
}

export interface EvaluateAnswerPayload {
  session_id: string;
  question_id: string;
  answer_text?: string;
}

export const evaluationApi = {
  async evaluateAnswer(payload: EvaluateAnswerPayload): Promise<EvaluationDetail> {
    const response = await apiClient.post("/api/v1/evaluations", payload);
    return response.data.data;
  },

  async evaluateSessionAll(sessionId: string): Promise<BatchEvaluationResponse> {
    const response = await apiClient.post(`/api/v1/evaluations/session/${sessionId}/evaluate-all`);
    return response.data.data;
  },

  async getEvaluationById(evaluationId: string): Promise<EvaluationDetail> {
    const response = await apiClient.get(`/api/v1/evaluations/${evaluationId}`);
    return response.data.data;
  },

  async getSessionEvaluations(sessionId: string): Promise<BatchEvaluationResponse> {
    const response = await apiClient.get(`/api/v1/evaluations/session/${sessionId}`);
    return response.data.data;
  },
};

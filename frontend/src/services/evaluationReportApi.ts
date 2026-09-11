/**
 * src/services/evaluationReportApi.ts
 * -----------------------------------
 * Client API for Immutable Evaluation History.
 */

import apiClient from "@/services/api";
import { ReadinessDetails } from "@/services/hireScoreApi";

export interface EvaluationReportDetail {
  id: string;
  candidate_id: string;
  evaluation_number: number;
  assessment_session_id: string;
  interview_session_id: string;
  
  assessment_score: number;
  interview_score: number;
  
  technical_accuracy: number;
  concept_coverage: number;
  problem_solving: number;
  communication: number;
  completeness: number;
  
  facesense_score?: number;
  voicesense_score?: number;
  
  hirescore: number;
  readiness: ReadinessDetails;
  
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  created_at: string;
  updated_at: string;
}

export const evaluationReportApi = {
  async generateReport(): Promise<EvaluationReportDetail> {
    const response = await apiClient.post("/api/v1/evaluation-reports/generate");
    return response.data.data;
  },

  async getHistory(): Promise<EvaluationReportDetail[]> {
    const response = await apiClient.get("/api/v1/evaluation-reports/history");
    return response.data.data;
  },

  async getReportById(reportId: string): Promise<EvaluationReportDetail> {
    const response = await apiClient.get(`/api/v1/evaluation-reports/${reportId}`);
    return response.data.data;
  }
};

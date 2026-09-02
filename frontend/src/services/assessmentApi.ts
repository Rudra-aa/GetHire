import apiClient from "@/services/api";

const API_BASE_URL = "/api/v1/assessment";

export interface MCQQuestion {
  id: string;
  category: string;
  skill: string;
  question: string;
  options: string[];
  explanation?: string;
}

export interface AssessmentSession {
  id: string;
  user_id: string;
  target_role: string;
  experience_level: string;
  status: string;
  questions: MCQQuestion[];
  score?: number;
  strong_concepts?: string[];
  weak_concepts?: string[];
  knowledge_graph?: any;
}

export const assessmentApi = {
  startAssessment: async (targetRole?: string, experienceLevel?: string): Promise<AssessmentSession> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/start`,
      { target_role: targetRole, experience_level: experienceLevel }
    );
    return res.data;
  },

  submitAssessment: async (assessmentId: string, answers: Array<{ question_id: string; selected_option: number }>): Promise<any> => {
    const res = await apiClient.post(
      `${API_BASE_URL}/submit`,
      { assessment_id: assessmentId, answers }
    );
    return res.data;
  },

  getLatestAssessment: async (): Promise<AssessmentSession> => {
    const res = await apiClient.get(
      `${API_BASE_URL}/latest`
    );
    return res.data;
  },
};

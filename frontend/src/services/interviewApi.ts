/**
 * src/services/interviewApi.ts
 * ----------------------------
 * Client API for Phase 3 AI Interview Engine.
 */

import apiClient from "@/services/api";

export interface InterviewQuestion {
  id: string;
  position: number;
  category: string;
  difficulty: string;
  question_text: string;
  context_snippet?: string;
  skill_targeted?: string;
  expected_concepts: string[];
  source: string;
}

export interface InterviewAnswer {
  id: string;
  session_id: string;
  question_id: string;
  answer_text: string;
  is_draft: boolean;
  word_count: number;
  time_taken_seconds: number;
  started_at: string;
  submitted_at?: string;
  evaluation_result?: Record<string, any>;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  resume_id?: string;
  target_role: string;
  experience_level: string;
  interview_type: string;
  status: string;
  total_questions: number;
  current_question_index: number;
  overall_progress: number;
  elapsed_seconds: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  started_at: string;
  paused_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewHistoryItem {
  id: string;
  target_role: string;
  experience_level: string;
  interview_type: string;
  status: string;
  total_questions: number;
  answers_count: number;
  overall_progress: number;
  elapsed_seconds: number;
  started_at: string;
  completed_at?: string;
}

export interface StartSessionPayload {
  resume_id?: string;
  target_role?: string;
  experience_level?: string;
  interview_type?: string;
  total_questions?: number;
}

export interface UpdateStatePayload {
  status?: string;
  current_question_index?: number;
  elapsed_seconds?: number;
}

export interface SubmitAnswerPayload {
  question_id: string;
  answer_text: string;
  time_taken_seconds?: number;
  is_draft?: boolean;
}

export const interviewApi = {
  async startSession(payload: StartSessionPayload = {}): Promise<InterviewSession> {
    const response = await apiClient.post("/api/v1/interview/sessions", payload);
    return response.data.data;
  },

  async getSession(sessionId: string): Promise<InterviewSession> {
    const response = await apiClient.get(`/api/v1/interview/sessions/${sessionId}`);
    return response.data.data;
  },

  async updateSessionState(sessionId: string, payload: UpdateStatePayload): Promise<InterviewSession> {
    const response = await apiClient.patch(`/api/v1/interview/sessions/${sessionId}`, payload);
    return response.data.data;
  },

  async submitAnswer(sessionId: string, payload: SubmitAnswerPayload): Promise<InterviewAnswer> {
    const response = await apiClient.post(`/api/v1/interview/sessions/${sessionId}/answers`, payload);
    return response.data.data;
  },

  async getAnswers(sessionId: string): Promise<InterviewAnswer[]> {
    const response = await apiClient.get(`/api/v1/interview/sessions/${sessionId}/answers`);
    return response.data.data.answers;
  },

  async completeSession(sessionId: string): Promise<InterviewSession> {
    const response = await apiClient.post(`/api/v1/interview/sessions/${sessionId}/complete`);
    return response.data.data;
  },

  async getHistory(limit = 20, skip = 0): Promise<{ sessions: InterviewHistoryItem[]; total: number }> {
    const response = await apiClient.get("/api/v1/interview/sessions/history", {
      params: { limit, skip },
    });
    return response.data.data;
  },

  async processTurn(sessionId: string, candidateTranscript: string): Promise<any> {
    const response = await apiClient.post(`/api/v1/interview/sessions/${sessionId}/turn`, null, {
      params: { candidate_transcript: candidateTranscript }
    });
    return response.data.data;
  },
};

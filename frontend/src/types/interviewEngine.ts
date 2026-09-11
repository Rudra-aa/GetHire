/**
 * src/types/interviewEngine.ts
 * ----------------------------
 * Unified Type Definitions for GetHire Interview Engine & UI Components.
 */

export type InterviewState =
  | "WAITING"
  | "INITIALIZING"
  | "INTRODUCTION"
  | "QUESTION"
  | "AI_SPEAKING"
  | "WAITING_FOR_MIC"
  | "LISTENING"
  | "USER_SPEAKING"
  | "SILENCE_DETECTED"
  | "AUTO_SUBMITTING"
  | "TRANSCRIBING"
  | "THINKING"
  | "AI_THINKING"
  | "FOLLOW_UP_DECISION"
  | "FOLLOW_UP"
  | "NEXT_QUESTION"
  | "INTERVIEW_COMPLETE"
  | "AI_PROCESSING"
  | "EVALUATION"
  | "PAUSED"
  | "ERROR";

export interface RecruiterPersona {
  id: string;
  name: string;
  role: string;
  company: string;
  greeting: string;
  speakingStyle: string;
  challengeLevel: "Medium" | "High" | "Adaptive";
}

export interface TranscriptEntry {
  id: string;
  speaker: "ai" | "candidate";
  text: string;
  timestamp: string;
  isFollowUp?: boolean | undefined;
  isStreaming?: boolean | undefined;
}

export interface AnswerEvaluation {
  qualityScore: number; // 0 - 100
  verdict: "High" | "Average" | "Weak" | "Very Weak";
  followUpPrompt?: string | undefined;
}

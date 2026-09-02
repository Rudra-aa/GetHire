export type InterviewState =
  | "WAITING"
  | "INTRODUCTION"
  | "QUESTION"
  | "LISTENING"
  | "TRANSCRIBING"
  | "THINKING"
  | "FOLLOW_UP_DECISION"
  | "FOLLOW_UP"
  | "NEXT_QUESTION"
  | "INTERVIEW_COMPLETE"
  | "AI_PROCESSING"
  | "EVALUATION"
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
  isFollowUp?: boolean;
  isStreaming?: boolean;
}

export interface AnswerEvaluation {
  qualityScore: number; // 0 - 100
  verdict: "High" | "Average" | "Weak" | "Very Weak";
  followUpPrompt?: string;
}

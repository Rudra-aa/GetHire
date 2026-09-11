/**
 * src/engines/voice/types.ts
 * --------------------------
 * Core types, interfaces, and schemas for the GetHire Voice AI Engine.
 */

export type InterviewFSMState =
  | "INITIALIZING"
  | "AI_SPEAKING"
  | "WAITING_FOR_MIC"
  | "LISTENING"
  | "USER_SPEAKING"
  | "SILENCE_DETECTED"
  | "AUTO_SUBMITTING"
  | "AI_THINKING"
  | "INTERVIEW_COMPLETE"
  | "ERROR"
  | "PAUSED";

export type InterviewErrorCategory =
  | "MICROPHONE_ERROR"
  | "SPEECH_RECOGNITION_ERROR"
  | "GEMINI_CONNECTION_ERROR"
  | "INTERVIEW_API_ERROR"
  | "TTS_ERROR"
  | "SESSION_ERROR";

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

export interface TurnTelemetry {
  turnIndex: number;
  questionId?: string | undefined;
  turnStartTime: number;
  micActivatedTime?: number | undefined;
  speechStartTime?: number | undefined;
  speechEndTime?: number | undefined;
  silenceConfirmedTime?: number | undefined;
  requestSentTime?: number | undefined;
  llmResponseTime?: number | undefined;
  ttsStartTime?: number | undefined;
  ttsEndTime?: number | undefined;
  turnLatencyMs?: number | undefined;
  llmLatencyMs?: number | undefined;
  ttsLatencyMs?: number | undefined;
  totalDurationMs?: number | undefined;
  wordCount?: number | undefined;
  confidence?: number | undefined;
}

export interface LiveSpeechAnalytics {
  wordsPerMinute: number;
  totalWords: number;
  hesitationCount: number;
  fillerWordCount: number;
  fillerWords: string[];
  averageVolume: number;
  durationSeconds: number;
  confidenceScore: number;
}

export interface SpeechRecognitionResultPayload {
  interimTranscript: string;
  finalTranscript: string;
  combinedTranscript: string;
  isFinal: boolean;
  confidence: number;
}

export interface InterviewEventMap {
  STATE_CHANGED: { from: InterviewFSMState; to: InterviewFSMState; reason?: string | undefined };
  MIC_READY: { stream: MediaStream };
  MIC_MUTED_CHANGED: { isMuted: boolean };
  AUDIO_ENERGY_UPDATED: { volume: number; rms: number; isVoice: boolean };
  USER_STARTED_SPEAKING: { timestamp: number };
  USER_STOPPED_SPEAKING: { timestamp: number; durationMs: number };
  TRANSCRIPT_UPDATED: SpeechRecognitionResultPayload;
  SILENCE_DETECTED: { silenceDurationMs: number; finalTranscript: string };
  SILENCE_COUNTDOWN: { remainingMs: number; totalMs: number };
  ANSWER_SUBMITTED: { transcript: string; turnIndex: number; isAuto: boolean };
  LLM_REQUEST_STARTED: { prompt: string; turnIndex: number };
  LLM_RESPONSE_RECEIVED: { text: string; decision?: any; turnIndex: number; latencyMs: number };
  TTS_STARTED: { text: string };
  TTS_CHUNK_PLAYED: { chunkText: string; chunkIndex: number; totalChunks: number };
  TTS_FINISHED: { durationMs: number };
  INTERRUPTION_TRIGGERED: { reason: "click" | "typing" | "voice" };
  SESSION_COMPLETED: { sessionId: string };
  ERROR_OCCURRED: { category: InterviewErrorCategory; message: string; fatal: boolean };
  ANALYTICS_UPDATED: LiveSpeechAnalytics;
}

export type EventCallback<T> = (data: T) => void;

/**
 * Speech Recognition Provider Abstraction
 */
export interface ISpeechRecognitionProvider {
  isSupported(): boolean;
  start(): void;
  stop(): void;
  abort(): void;
  isListening(): boolean;
  onResult(callback: (result: SpeechRecognitionResultPayload) => void): void;
  onError(callback: (category: InterviewErrorCategory, error: any) => void): void;
  onEnd(callback: () => void): void;
  onStart(callback: () => void): void;
  destroy(): void;
}

/**
 * Speech Synthesis Provider Abstraction
 */
export interface ISpeechSynthesisProvider {
  isSupported(): boolean;
  speak(text: string, onEnded?: () => void): Promise<void>;
  enqueue(text: string): void;
  cancel(): void;
  isSpeaking(): boolean;
  onStart(callback: (text: string) => void): void;
  onEnd(callback: () => void): void;
  onError(callback: (err: any) => void): void;
  destroy(): void;
}

/**
 * LLM Provider Interface
 */
export interface ILLMProvider {
  generateTurnResponse(
    sessionId: string,
    candidateTranscript: string,
    options?: Record<string, any>
  ): Promise<{ aiResponse: string; decision?: any; evaluation?: any }>;
}

/**
 * src/engines/voice/VoiceInterviewEngine.ts
 * -----------------------------------------
 * Central Production-Grade Voice AI Interview Engine for GetHire.
 * Orchestrates Finite State Machine, Event Bus, Speech Providers,
 * Adaptive Silence Detector, Audio Energy Meter, Telemetry, and API Client.
 */

import { InterviewEventBus } from "./EventBus";
import { InterviewStateMachine } from "./StateMachine";
import { BrowserSpeechRecognitionProvider } from "./speech/BrowserSpeechRecognitionProvider";
import { BrowserSpeechSynthesisProvider } from "./speech/BrowserSpeechSynthesisProvider";
import { AudioEnergyMeter } from "./detectors/AudioEnergyMeter";
import { AdaptiveSilenceDetector } from "./detectors/AdaptiveSilenceDetector";
import { LiveSpeechAnalyticsEngine } from "./intelligence/LiveSpeechAnalytics";
import { TurnTelemetryTracker } from "./intelligence/TurnTelemetryTracker";
import { RecruiterPersona, TranscriptEntry } from "./types";
import { interviewApi, type InterviewQuestion, type InterviewSession } from "@/services/interviewApi";

export const DEFAULT_PERSONA: RecruiterPersona = {
  id: "persona-alex",
  name: "Alex",
  role: "Lead Software Architect",
  company: "GetHire",
  greeting: "Hello! Welcome to your technical interview.",
  speakingStyle: "Direct, technical, inquisitive",
  challengeLevel: "Adaptive",
};

export interface EngineConfig {
  sessionId?: string;
  persona?: RecruiterPersona;
  targetRole?: string;
  totalQuestions?: number;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation "${operationName}" timed out after ${timeoutMs / 1000}s.`));
    }, timeoutMs);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export class VoiceInterviewEngine {
  // Core Subsystems
  public eventBus: InterviewEventBus;
  public stateMachine: InterviewStateMachine;
  public speechRecognition: BrowserSpeechRecognitionProvider;
  public speechSynthesis: BrowserSpeechSynthesisProvider;
  public audioMeter: AudioEnergyMeter;
  public silenceDetector: AdaptiveSilenceDetector;
  public analyticsEngine: LiveSpeechAnalyticsEngine;
  public telemetryTracker: TurnTelemetryTracker;

  // Session State
  public sessionId: string | null = null;
  public persona: RecruiterPersona = DEFAULT_PERSONA;
  public questions: InterviewQuestion[] = [];
  public currentQuestionIndex = 0;
  public activeQuestionPrompt = "";
  public transcripts: TranscriptEntry[] = [];
  public liveCandidateText = "";
  public elapsedSeconds = 0;
  public isMicMuted = false;
  public isTextFallbackMode = false;
  public initError: { step: string; message: string } | null = null;

  // Concurrency & Guard Mutexes
  private isSubmitting = false;
  private isInitializing = false;
  private submissionRequestId = 0;
  private timerInterval: any = null;
  private stabilizationTimer: any = null;

  constructor(config?: EngineConfig) {
    this.eventBus = new InterviewEventBus();
    this.stateMachine = new InterviewStateMachine(this.eventBus, "INITIALIZING");
    this.speechRecognition = new BrowserSpeechRecognitionProvider();
    this.speechSynthesis = new BrowserSpeechSynthesisProvider();
    this.audioMeter = new AudioEnergyMeter(this.eventBus);
    this.silenceDetector = new AdaptiveSilenceDetector(this.eventBus);
    this.analyticsEngine = new LiveSpeechAnalyticsEngine(this.eventBus);
    this.telemetryTracker = new TurnTelemetryTracker(this.eventBus);

    if (config?.sessionId) this.sessionId = config.sessionId;
    if (config?.persona) this.persona = config.persona;

    this.wireEventHandlers();
  }

  private wireEventHandlers() {
    // 1. Speech Recognition callbacks
    this.speechRecognition.onResult((payload) => {
      this.liveCandidateText = payload.combinedTranscript;
      this.eventBus.emit("TRANSCRIPT_UPDATED", payload);

      // If user is speaking, update state if currently listening
      if (this.stateMachine.getState() === "LISTENING" && payload.combinedTranscript.trim().length > 0) {
        this.stateMachine.transition("USER_SPEAKING", "candidate transcript received");
      }
    });

    this.speechRecognition.onError((category, err) => {
      this.eventBus.emit("ERROR_OCCURRED", {
        category,
        message:
          err?.error === "not-allowed"
            ? "Microphone access was denied. Please allow microphone permissions."
            : "Speech recognition encountered an issue.",
        fatal: false,
      });
    });

    // 2. Silence Detector trigger -> Auto Submit Answer
    this.eventBus.on("SILENCE_DETECTED", ({ finalTranscript }) => {
      if (
        this.stateMachine.getState() === "USER_SPEAKING" ||
        this.stateMachine.getState() === "LISTENING" ||
        this.stateMachine.getState() === "SILENCE_DETECTED"
      ) {
        this.stateMachine.transition("SILENCE_DETECTED", "adaptive silence confirmed");
        void this.submitAnswer(finalTranscript, true);
      }
    });

    // 3. Speech Synthesis lifecycle
    this.speechSynthesis.onStart(() => {
      this.eventBus.emit("TTS_STARTED", { text: this.activeQuestionPrompt });
      // Guarantee mic is paused during AI speech
      this.speechRecognition.stop();
      this.silenceDetector.setEnabled(false);
    });

    this.speechSynthesis.onEnd(() => {
      this.eventBus.emit("TTS_FINISHED", { durationMs: 0 });
      this.onAiSpeechFinished();
    });

    // 4. Timer for elapsed seconds
    this.timerInterval = setInterval(() => {
      const state = this.stateMachine.getState();
      if (state !== "INITIALIZING" && state !== "INTERVIEW_COMPLETE" && state !== "PAUSED") {
        this.elapsedSeconds += 1;
      }
    }, 1000);
  }

  /**
   * Start or resume interview session with distinct phases:
   * INITIALIZING -> GENERATING_FIRST_QUESTION -> READY
   */
  async startInterview(targetRole = "Senior Full-Stack Engineer"): Promise<void> {
    if (this.isInitializing) {
      console.warn("[VoiceInterviewEngine] startInterview called while already initializing — ignored.");
      return;
    }
    this.isInitializing = true;
    this.initError = null;

    // Phase 1: INITIALIZING (Session creation & non-blocking mic setup)
    this.stateMachine.transition("INITIALIZING", "creating or loading interview session");
    console.log("[VoiceInterviewEngine] State: INITIALIZING - setting up session and audio");

    // Non-blocking microphone initialization with 3.5s timeout boundary
    // Microphone denial or delay MUST NOT block Alex from generating and displaying the question
    void (async () => {
      try {
        const stream = await withTimeout(this.audioMeter.start(), 3500, "Microphone Initialization");
        if (!stream) {
          console.warn("[VoiceInterviewEngine] Microphone stream null; activating text fallback mode.");
          this.isTextFallbackMode = true;
          this.eventBus.emit("MIC_STATUS_CHANGED", { available: false, textFallback: true });
        }
      } catch (micErr: any) {
        console.warn("[VoiceInterviewEngine] Microphone initialization notice:", micErr?.message || micErr);
        this.isTextFallbackMode = true;
        this.eventBus.emit("MIC_STATUS_CHANGED", { available: false, textFallback: true });
        this.eventBus.emit("ERROR_OCCURRED", {
          category: "MICROPHONE_ERROR",
          message: "Microphone access unavailable or timed out. Text-answer fallback mode is active.",
          fatal: false,
        });
      }
    })();

    try {
      // 1. Retrieve or Start Backend Session with explicit 10s timeout
      let session: InterviewSession;
      if (this.sessionId) {
        try {
          session = await withTimeout(
            interviewApi.getSession(this.sessionId),
            10000,
            "Retrieving existing session"
          );
        } catch (fetchErr: any) {
          console.warn("[VoiceInterviewEngine] Failed to retrieve existing session, creating new:", fetchErr);
          session = await withTimeout(
            interviewApi.startSession({
              target_role: targetRole,
              interview_type: "technical",
              total_questions: 5,
            }),
            10000,
            "Creating new session"
          );
        }
      } else {
        session = await withTimeout(
          interviewApi.startSession({
            target_role: targetRole,
            interview_type: "technical",
            total_questions: 5,
          }),
          10000,
          "Creating new session"
        );
      }

      this.sessionId = session.id;
      this.questions = session.questions || [];
      this.currentQuestionIndex = session.current_question_index || 0;
      console.log("[VoiceInterviewEngine] Session ready:", this.sessionId);

      // Phase 2: GENERATING_FIRST_QUESTION with explicit 15s timeout
      this.stateMachine.transition("GENERATING_FIRST_QUESTION", "calling Gemini for opening question");
      console.log("[VoiceInterviewEngine] State: GENERATING_FIRST_QUESTION - awaiting Gemini prompt");

      const initRes = await withTimeout(
        interviewApi.processTurn(
          this.sessionId,
          "[Candidate has joined the interview. Please greet them and ask the first question.]"
        ),
        15000,
        "Gemini first-question generation"
      );

      const aiGreeting = initRes?.ai_response?.trim();
      if (!aiGreeting) {
        throw new Error("The interview service did not return an opening question. Please retry initialization.");
      }

      this.activeQuestionPrompt = aiGreeting;
      this.transcripts = [
        {
          id: `t-ai-intro-${Date.now()}`,
          speaker: "ai",
          text: aiGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ];

      // Phase 3: READY (Question displayed immediately on screen)
      this.stateMachine.transition("READY", "first question loaded and recruiter ready");
      console.log("[VoiceInterviewEngine] State: READY - prompt presented to candidate");

      // Trigger speech synthesis asynchronously without blocking startInterview completion
      this.stateMachine.transition("AI_SPEAKING", "speaking initial question");
      void this.speechSynthesis.speak(aiGreeting).catch((ttsErr) => {
        console.warn("[VoiceInterviewEngine] Speech synthesis error (non-fatal):", ttsErr);
        this.onAiSpeechFinished();
      });

    } catch (err: any) {
      const failingOp = this.stateMachine.getState();
      console.error(`[VoiceInterviewEngine] Initialization failed during "${failingOp}":`, err);
      this.initError = {
        step: failingOp,
        message: err?.response?.data?.message || err?.message || "Failed to initialize interview.",
      };
      this.stateMachine.transition("ERROR", `initialization failed at ${failingOp}`);
      this.eventBus.emit("ERROR_OCCURRED", {
        category: "INITIALIZATION_ERROR",
        message: `${this.initError.message} Please click 'Retry Initialization'.`,
        fatal: true,
      });
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Handle completion of AI voice playback.
   * Only transitions if currently in AI_SPEAKING — prevents double-fire when
   * both the onEnd callback and an awaited speak() promise complete.
   */
  private onAiSpeechFinished() {
    const currentState = this.stateMachine.getState();
    // Only proceed if we are still in AI_SPEAKING; any other state means
    // the transition has already been handled (e.g., via interrupt or error).
    if (currentState !== "AI_SPEAKING") return;

    this.stateMachine.transition("WAITING_FOR_MIC", "stabilizing audio buffer");

    // 350ms stabilization delay before activating candidate mic
    if (this.stabilizationTimer) clearTimeout(this.stabilizationTimer);
    this.stabilizationTimer = setTimeout(() => {
      // Re-check state; another path may have changed it during the delay.
      if (this.stateMachine.getState() !== "WAITING_FOR_MIC") return;
      this.stateMachine.transition("LISTENING", "mic activated");
      this.liveCandidateText = "";
      // Clear recognition buffers so the new turn starts with a clean slate.
      this.speechRecognition.clearBuffers();
      this.silenceDetector.reset();
      this.silenceDetector.setEnabled(true);
      if (!this.isMicMuted) {
        this.speechRecognition.start();
      }
    }, 350);
  }

  /**
   * Submit candidate answer turn (voice auto-detected or manual submit)
   */
  async submitAnswer(textToSubmit?: string, isAuto = false): Promise<void> {
    const answer = (textToSubmit || this.liveCandidateText).trim();

    if (!answer) {
      return;
    }

    // Guard: if Alex is still speaking, interrupt first, then submit.
    // This prevents the invalid AI_SPEAKING -> AUTO_SUBMITTING transition.
    const curState = this.stateMachine.getState();
    if (curState === "AI_SPEAKING") {
      console.log("[VoiceInterviewEngine] submitAnswer called during AI_SPEAKING — interrupting first.");
      this.speechSynthesis.cancel();
      // onAiSpeechFinished will NOT fire (state check guards it); manually go to LISTENING.
      this.stateMachine.transition("LISTENING", "user submitted answer during AI speech");
    }

    // Guard against duplicate / overlapping submissions
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const reqId = ++this.submissionRequestId;

    // Pause speech recognition & silence countdown during submission
    this.speechRecognition.stop();
    this.silenceDetector.clearTimers();
    this.silenceDetector.setEnabled(false);

    this.stateMachine.transition("AUTO_SUBMITTING", isAuto ? "auto-silence" : "manual-click");

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.transcripts.push({
      id: `t-cand-${Date.now()}`,
      speaker: "candidate",
      text: answer,
      timestamp: timeStr,
    });
    this.liveCandidateText = "";

    this.eventBus.emit("ANSWER_SUBMITTED", {
      transcript: answer,
      turnIndex: this.currentQuestionIndex,
      isAuto,
    });

    this.stateMachine.transition("AI_THINKING", "calling Gemini orchestrator");
    this.eventBus.emit("LLM_REQUEST_STARTED", { prompt: answer, turnIndex: this.currentQuestionIndex });

    const sessId = this.sessionId;
    if (!sessId) {
      this.isSubmitting = false;
      this.stateMachine.transition("ERROR", "missing session id");
      return;
    }

    const t0 = Date.now();

    try {
      // 1. Process turn through Orchestrator
      const res = await interviewApi.processTurn(sessId, answer);
      const latencyMs = Date.now() - t0;

      // Abort if a newer submission took over
      if (reqId !== this.submissionRequestId) return;

      this.eventBus.emit("LLM_RESPONSE_RECEIVED", {
        text: res.ai_response || "",
        decision: res.decision,
        turnIndex: this.currentQuestionIndex,
        latencyMs,
      });

      const aiText = res.ai_response?.trim();
      if (!aiText) {
        throw new Error("The interview service did not return a follow-up question. Please retry the turn.");
      }
      const decision = res.decision?.action;
      const nextIdx = res.decision?.next_question_index ?? this.currentQuestionIndex + 1;

      this.activeQuestionPrompt = aiText;

      // 2. Submit answer record in background
      const currQ = this.questions[this.currentQuestionIndex];
      void interviewApi
        .submitAnswer(sessId, {
          question_id: currQ?.id || `q_${this.currentQuestionIndex + 1}`,
          answer_text: answer,
          time_taken_seconds: this.elapsedSeconds,
          is_draft: false,
        })
        .catch(() => null);

      // 3. Evaluate next step
      // "complete_interview" from backend, or exhausted all questions
      const isComplete =
        decision === "complete_interview" ||
        (nextIdx >= this.questions.length && this.questions.length > 0 && decision !== "request_clarification" && decision !== "challenge_answer" && decision !== "probe_deeper");

      // Follow-up/clarification: backend keeps same question index
      // Covers: "request_clarification", "challenge_answer", "probe_deeper", "follow_up"
      const isFollowUp =
        !isComplete &&
        (decision === "request_clarification" ||
          decision === "challenge_answer" ||
          decision === "probe_deeper" ||
          decision === "follow_up" ||
          nextIdx === this.currentQuestionIndex);

      if (isComplete) {
        this.transcripts.push({
          id: `t-ai-end-${Date.now()}`,
          speaker: "ai",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        void interviewApi.completeSession(sessId).catch(() => null);
        this.stateMachine.transition("AI_SPEAKING", "final wrap-up statement");
        // Await final statement — after it completes, transition to INTERVIEW_COMPLETE.
        // We do NOT rely on onAiSpeechFinished here (it guards for AI_SPEAKING only and
        // INTERVIEW_COMPLETE is set immediately after, so the guard will skip it).
        try {
          await this.speechSynthesis.speak(aiText);
        } catch {
          // Ignore TTS error for closing statement
        }
        this.stateMachine.transition("INTERVIEW_COMPLETE", "all turns finished");
        this.eventBus.emit("SESSION_COMPLETED", { sessionId: sessId });
      } else if (isFollowUp) {
        this.transcripts.push({
          id: `t-ai-fu-${Date.now()}`,
          speaker: "ai",
          text: aiText,
          isFollowUp: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        // Fire-and-forget: onAiSpeechFinished (via onEnd callback) will handle
        // AI_SPEAKING -> WAITING_FOR_MIC -> LISTENING when playback ends.
        this.stateMachine.transition("AI_SPEAKING", "speaking follow-up/clarification");
        void this.speechSynthesis.speak(aiText).catch((e) => {
          console.warn("[VoiceInterviewEngine] TTS error on follow-up:", e);
          this.onAiSpeechFinished();
        });
      } else {
        // Advance to next question
        this.currentQuestionIndex = nextIdx;
        this.transcripts.push({
          id: `t-ai-q-${nextIdx}-${Date.now()}`,
          speaker: "ai",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });

        // Fire-and-forget: onAiSpeechFinished (via onEnd callback) will handle
        // AI_SPEAKING -> WAITING_FOR_MIC -> LISTENING when playback ends.
        this.stateMachine.transition("AI_SPEAKING", "speaking next turn");
        void this.speechSynthesis.speak(aiText).catch((e) => {
          console.warn("[VoiceInterviewEngine] TTS error on next question:", e);
          this.onAiSpeechFinished();
        });
      }
    } catch (err: any) {
      console.error("[VoiceInterviewEngine] Turn error:", err);
      this.stateMachine.transition("ERROR", "Gemini turn failed");
      this.eventBus.emit("ERROR_OCCURRED", {
        category: "GEMINI_CONNECTION_ERROR",
        message: "AI turn generation encountered an issue. Click 'Retry Turn' to continue.",
        fatal: false,
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Interrupt AI speech (barge-in) and immediately allow candidate to answer
   */
  interrupt(reason: "click" | "typing" | "voice" = "click"): void {
    this.speechSynthesis.cancel();
    this.eventBus.emit("INTERRUPTION_TRIGGERED", { reason });
    this.stateMachine.transition("LISTENING", "user interrupted AI");
    this.liveCandidateText = "";
    // Clear buffers so any residual transcript from before the interrupt doesn't bleed in.
    this.speechRecognition.clearBuffers();
    this.silenceDetector.reset();
    this.silenceDetector.setEnabled(true);
    if (!this.isMicMuted) {
      this.speechRecognition.start();
    }
  }

  /**
   * Repeat active question via TTS
   */
  repeatQuestion(): void {
    if (this.activeQuestionPrompt) {
      this.stateMachine.transition("AI_SPEAKING", "repeating question");
      void this.speechSynthesis.speak(this.activeQuestionPrompt);
    }
  }

  /**
   * Ask Alex for technical clarification
   */
  async requestClarification(): Promise<void> {
    this.speechRecognition.stop();
    this.silenceDetector.clearTimers();
    this.stateMachine.transition("AI_THINKING", "requesting clarification");

    const sessId = this.sessionId;
    if (!sessId) return;

    try {
      const res = await interviewApi.processTurn(
        sessId,
        "[Candidate asks for clarification on the architectural requirements.]"
      );
      const text = res.ai_response?.trim();
      if (!text) {
        throw new Error("The interview service did not return a clarification. Please retry the turn.");
      }
      this.activeQuestionPrompt = text;
      this.transcripts.push({
        id: `t-clarify-${Date.now()}`,
        speaker: "ai",
        text,
        isFollowUp: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      this.stateMachine.transition("AI_SPEAKING", "speaking clarification");
      // Fire-and-forget: onAiSpeechFinished will handle WAITING_FOR_MIC -> LISTENING.
      void this.speechSynthesis.speak(text).catch(() => {
        this.onAiSpeechFinished();
      });
    } catch {
      this.stateMachine.transition("LISTENING", "clarification failed");
    }
  }

  /**
   * Skip current question
   */
  skipQuestion(): void {
    void this.submitAnswer("I am not familiar with this specific topic, let's proceed to the next question.");
  }

  /**
   * Retry failed turn
   */
  async retryTurn(): Promise<void> {
    let lastCandidateText = "";
    for (let i = this.transcripts.length - 1; i >= 0; i--) {
      if (this.transcripts[i]?.speaker === "candidate") {
        lastCandidateText = this.transcripts[i]!.text;
        break;
      }
    }

    if (!lastCandidateText) {
      if (this.transcripts.length === 0) {
        void this.startInterview();
      } else {
        this.stateMachine.transition("LISTENING", "retry with empty candidate turn");
        this.speechRecognition.start();
      }
      return;
    }

    void this.submitAnswer(lastCandidateText);
  }

  /**
   * Toggle mute
   */
  toggleMic(): void {
    this.isMicMuted = !this.isMicMuted;
    this.audioMeter.setMuted(this.isMicMuted);
    if (this.isMicMuted) {
      this.speechRecognition.stop();
      this.silenceDetector.clearTimers();
    } else {
      if (this.stateMachine.getState() === "LISTENING") {
        this.speechRecognition.start();
      }
    }
  }

  /**
   * End interview session and finalize evaluation
   */
  async endInterview(): Promise<void> {
    this.speechRecognition.stop();
    this.speechSynthesis.cancel();
    this.silenceDetector.clearTimers();
    this.audioMeter.stop();

    this.stateMachine.transition("INTERVIEW_COMPLETE", "user ended interview");

    if (this.sessionId && this.sessionId !== "sess-ai-demo") {
      try {
        await interviewApi.completeSession(this.sessionId);
      } catch {
        // Ignore complete error
      }
    }
  }

  /**
   * Teardown engine resources
   */
  destroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.stabilizationTimer) clearTimeout(this.stabilizationTimer);
    this.speechRecognition.destroy();
    this.speechSynthesis.destroy();
    this.audioMeter.stop();
    this.silenceDetector.clearTimers();
    this.eventBus.clear();
  }
}

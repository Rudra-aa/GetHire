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
  public activeQuestionPrompt = "Welcome to GetHire AI Interview Studio. Initializing session...";
  public transcripts: TranscriptEntry[] = [];
  public liveCandidateText = "";
  public elapsedSeconds = 0;
  public isMicMuted = false;

  // Concurrency & Guard Mutexes
  private isSubmitting = false;
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
   * Start or resume interview session
   */
  async startInterview(targetRole = "Senior Full-Stack Engineer"): Promise<void> {
    this.stateMachine.transition("INITIALIZING", "starting session");

    try {
      // 1. Initialize Audio Meter & Mic
      await this.audioMeter.start();

      // 2. Retrieve or Start Backend Session
      let session: InterviewSession;
      if (this.sessionId && this.sessionId !== "sess-ai-demo") {
        try {
          session = await interviewApi.getSession(this.sessionId);
        } catch {
          session = await interviewApi.startSession({
            target_role: targetRole,
            interview_type: "technical",
            total_questions: 5,
          });
        }
      } else {
        session = await interviewApi.startSession({
          target_role: targetRole,
          interview_type: "technical",
          total_questions: 5,
        });
      }

      this.sessionId = session.id;
      this.questions = session.questions || [];
      this.currentQuestionIndex = session.current_question_index || 0;

      // 3. Request initial greeting/question from Gemini
      this.stateMachine.transition("AI_THINKING", "generating initial turn");
      const initRes = await interviewApi.processTurn(
        this.sessionId,
        "[Candidate has joined the interview. Please greet them and ask the first question.]"
      );

      const aiGreeting =
        initRes.ai_response ||
        "Hello! I'm Alex, Lead Software Architect at GetHire. Let's begin your technical interview. Could you start by introducing yourself and sharing your core technical experience?";

      this.activeQuestionPrompt = aiGreeting;
      this.transcripts.push({
        id: `t-ai-intro-${Date.now()}`,
        speaker: "ai",
        text: aiGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      // 4. Speak initial question
      this.stateMachine.transition("AI_SPEAKING", "speaking initial question");
      await this.speechSynthesis.speak(aiGreeting);
    } catch (err: any) {
      console.error("[VoiceInterviewEngine] Failed to start:", err);
      this.stateMachine.transition("ERROR", "session start failed");
      this.eventBus.emit("ERROR_OCCURRED", {
        category: "GEMINI_CONNECTION_ERROR",
        message: "Failed to connect to AI Interview Orchestrator. Click 'Retry Connection' below.",
        fatal: false,
      });
    }
  }

  /**
   * Handle completion of AI voice playback
   */
  private onAiSpeechFinished() {
    const currentState = this.stateMachine.getState();
    if (currentState === "INTERVIEW_COMPLETE") return;

    this.stateMachine.transition("WAITING_FOR_MIC", "stabilizing audio buffer");

    // 350ms stabilization delay before activating candidate mic
    if (this.stabilizationTimer) clearTimeout(this.stabilizationTimer);
    this.stabilizationTimer = setTimeout(() => {
      this.stateMachine.transition("LISTENING", "mic activated");
      this.liveCandidateText = "";
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

      const aiText =
        res.ai_response || "Thank you for that response. Let's continue exploring your technical experience.";
      const decision = res.decision?.action;
      const nextIdx = res.decision?.next_question_index ?? this.currentQuestionIndex;

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
      const isComplete =
        decision === "complete_interview" ||
        (nextIdx >= this.questions.length && this.questions.length > 0 && decision !== "follow_up");

      if (isComplete) {
        this.transcripts.push({
          id: `t-ai-end-${Date.now()}`,
          speaker: "ai",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        void interviewApi.completeSession(sessId).catch(() => null);
        this.stateMachine.transition("AI_SPEAKING", "final wrap-up statement");
        await this.speechSynthesis.speak(aiText, () => {
          this.stateMachine.transition("INTERVIEW_COMPLETE", "all turns finished");
          this.eventBus.emit("SESSION_COMPLETED", { sessionId: sessId });
        });
      } else {
        if (decision === "follow_up" || nextIdx === this.currentQuestionIndex) {
          this.transcripts.push({
            id: `t-ai-fu-${Date.now()}`,
            speaker: "ai",
            text: aiText,
            isFollowUp: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        } else {
          this.currentQuestionIndex = nextIdx;
          this.transcripts.push({
            id: `t-ai-q-${nextIdx}-${Date.now()}`,
            speaker: "ai",
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }

        this.stateMachine.transition("AI_SPEAKING", "speaking next turn");
        await this.speechSynthesis.speak(aiText);
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
      const text = res.ai_response || "Certainly. Let me clarify the architectural scope.";
      this.activeQuestionPrompt = text;
      this.transcripts.push({
        id: `t-clarify-${Date.now()}`,
        speaker: "ai",
        text,
        isFollowUp: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      this.stateMachine.transition("AI_SPEAKING", "speaking clarification");
      await this.speechSynthesis.speak(text);
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

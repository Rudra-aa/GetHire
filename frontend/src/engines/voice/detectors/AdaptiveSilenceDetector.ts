/**
 * src/engines/voice/detectors/AdaptiveSilenceDetector.ts
 * -----------------------------------------------------
 * Adaptive silence detection engine for GetHire Voice AI.
 * Calculates dynamic silence windows based on word count, speech duration,
 * and audio energy to accurately trigger auto-submission without interrupting speech pauses.
 */

import { InterviewEventBus } from "../EventBus";
import { SpeechRecognitionResultPayload } from "../types";

export class AdaptiveSilenceDetector {
  private eventBus: InterviewEventBus;
  private silenceTimer: any = null;
  private countdownInterval: any = null;
  private isEnabled = true;
  private isSpeaking = false;
  private currentTranscript = "";
  private speechStartTime = 0;

  // Adaptive threshold bounds (ms)
  private readonly SHORT_ANSWER_SILENCE_MS = 1200; // < 8 words
  private readonly MEDIUM_ANSWER_SILENCE_MS = 1800; // 8 - 25 words
  private readonly LONG_ANSWER_SILENCE_MS = 2500; // > 25 words
  private readonly MIN_WORDS_FOR_SUBMIT = 2;
  private readonly MIN_CHARS_FOR_SUBMIT = 6;

  constructor(eventBus: InterviewEventBus) {
    this.eventBus = eventBus;
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.on("TRANSCRIPT_UPDATED", (payload) => {
      this.onTranscriptActivity(payload);
    });

    this.eventBus.on("AUDIO_ENERGY_UPDATED", ({ isVoice }) => {
      if (isVoice && this.isEnabled) {
        this.onVoiceActivity();
      }
    });

    this.eventBus.on("STATE_CHANGED", ({ to }) => {
      if (to === "AI_SPEAKING" || to === "AI_THINKING" || to === "AUTO_SUBMITTING" || to === "INTERVIEW_COMPLETE") {
        this.clearTimers();
        this.isSpeaking = false;
        this.currentTranscript = "";
      }
    });
  }

  /**
   * Calculates dynamic silence threshold in milliseconds based on transcript richness
   */
  public calculateAdaptiveSilenceThreshold(transcript: string): number {
    const clean = transcript.trim();
    if (!clean) return this.MEDIUM_ANSWER_SILENCE_MS;

    const words = clean.split(/\s+/).filter(Boolean).length;

    if (words < 8) {
      return this.SHORT_ANSWER_SILENCE_MS;
    } else if (words <= 25) {
      return this.MEDIUM_ANSWER_SILENCE_MS;
    } else {
      return this.LONG_ANSWER_SILENCE_MS;
    }
  }

  private onTranscriptActivity(payload: SpeechRecognitionResultPayload) {
    if (!this.isEnabled) return;

    const text = payload.combinedTranscript.trim();
    if (!text) return;

    this.currentTranscript = text;

    if (!this.isSpeaking) {
      this.isSpeaking = true;
      this.speechStartTime = Date.now();
      this.eventBus.emit("USER_STARTED_SPEAKING", { timestamp: this.speechStartTime });
    }

    // Reset silence timer on every new speech / interim token
    this.resetSilenceCountdown();
  }

  private onVoiceActivity() {
    if (!this.isEnabled) return;
    // Delay silence countdown if candidate voice is detected by mic analyser
    if (this.isSpeaking) {
      this.resetSilenceCountdown();
    }
  }

  private resetSilenceCountdown() {
    this.clearTimers();

    const requiredSilenceMs = this.calculateAdaptiveSilenceThreshold(this.currentTranscript);
    let remainingMs = requiredSilenceMs;

    // Periodic countdown tick for visual feedback
    this.countdownInterval = setInterval(() => {
      remainingMs -= 200;
      if (remainingMs > 0) {
        this.eventBus.emit("SILENCE_COUNTDOWN", {
          remainingMs: Math.max(0, remainingMs),
          totalMs: requiredSilenceMs,
        });
      } else {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }
    }, 200);

    // Final trigger
    this.silenceTimer = setTimeout(() => {
      this.triggerSilenceConfirmed();
    }, requiredSilenceMs);
  }

  private triggerSilenceConfirmed() {
    this.clearTimers();

    const clean = this.currentTranscript.trim();
    const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;

    // Guard against empty / accidental triggers
    if (words < this.MIN_WORDS_FOR_SUBMIT && clean.length < this.MIN_CHARS_FOR_SUBMIT) {
      return;
    }

    const durationMs = this.speechStartTime ? Date.now() - this.speechStartTime : 0;
    this.isSpeaking = false;

    this.eventBus.emit("USER_STOPPED_SPEAKING", {
      timestamp: Date.now(),
      durationMs,
    });

    this.eventBus.emit("SILENCE_DETECTED", {
      silenceDurationMs: this.calculateAdaptiveSilenceThreshold(clean),
      finalTranscript: clean,
    });
  }

  public clearTimers() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearTimers();
    }
  }

  public reset() {
    this.clearTimers();
    this.currentTranscript = "";
    this.isSpeaking = false;
    this.speechStartTime = 0;
  }
}

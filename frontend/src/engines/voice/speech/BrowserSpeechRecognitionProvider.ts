/**
 * src/engines/voice/speech/BrowserSpeechRecognitionProvider.ts
 * -----------------------------------------------------------
 * Browser Speech Recognition Provider implementing ISpeechRecognitionProvider.
 * Wraps SpeechRecognition / webkitSpeechRecognition with robust event handlers,
 * interim token aggregation, and error classification.
 */

import {
  ISpeechRecognitionProvider,
  SpeechRecognitionResultPayload,
  InterviewErrorCategory,
} from "../types";

export class BrowserSpeechRecognitionProvider implements ISpeechRecognitionProvider {
  private recognition: any = null;
  private isListeningActive = false;
  private shouldRestart = false;
  private restartTimer: any = null;

  // Transcript state buffers
  private finalTranscriptBuffer = "";
  private interimTranscriptBuffer = "";
  private accumulatedFinalText = "";

  // Callbacks
  private resultCallback: ((result: SpeechRecognitionResultPayload) => void) | null = null;
  private errorCallback: ((category: InterviewErrorCategory, error: any) => void) | null = null;
  private endCallback: (() => void) | null = null;
  private startCallback: (() => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  private initRecognition() {
    if (!this.isSupported()) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListeningActive = true;
        if (this.startCallback) this.startCallback();
      };

      this.recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        // IMPORTANT: Start from event.resultIndex, not 0.
        // In continuous mode after a restart, Chrome re-delivers all prior
        // results from index 0. Reading only from resultIndex ensures we
        // only process NEW results, preventing silent transcript duplication.
        const startIdx = event.resultIndex ?? 0;
        for (let i = startIdx; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res && res[0]) {
            if (res.isFinal) {
              final += res[0].transcript + " ";
            } else {
              interim += res[0].transcript;
            }
          }
        }

        // Only update buffers if we actually got new content
        if (final) this.finalTranscriptBuffer = final.trim();
        if (interim !== undefined) this.interimTranscriptBuffer = interim.trim();

        const fullFinal = (
          (this.accumulatedFinalText ? this.accumulatedFinalText + " " : "") +
          (this.finalTranscriptBuffer ? this.finalTranscriptBuffer + " " : "")
        ).trim();
        const combined = (
          (fullFinal ? fullFinal + " " : "") + this.interimTranscriptBuffer
        ).trim();

        const payload: SpeechRecognitionResultPayload = {
          interimTranscript: this.interimTranscriptBuffer,
          finalTranscript: fullFinal,
          combinedTranscript: combined,
          isFinal: event.results[event.results.length - 1]?.isFinal || false,
          confidence: event.results[0]?.[0]?.confidence || 0.9,
        };

        if (this.resultCallback) {
          this.resultCallback(payload);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorStr = event?.error || "unknown";
        console.warn("[BrowserSpeechRecognition] Notice:", errorStr);

        let category: InterviewErrorCategory = "SPEECH_RECOGNITION_ERROR";
        if (errorStr === "not-allowed" || errorStr === "service-not-allowed") {
          category = "MICROPHONE_ERROR";
        }

        // Ignore no-speech non-fatal error
        if (errorStr === "no-speech") {
          return;
        }

        if (this.errorCallback) {
          this.errorCallback(category, event);
        }
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;

        // Commit current session's final transcript into accumulated buffer across restarts
        if (this.finalTranscriptBuffer) {
          this.accumulatedFinalText = (
            (this.accumulatedFinalText ? this.accumulatedFinalText + " " : "") + this.finalTranscriptBuffer
          ).trim();
          this.finalTranscriptBuffer = "";
        }

        if (this.endCallback) {
          this.endCallback();
        }

        // Auto restart if continuous listening is requested and not explicitly stopped
        if (this.shouldRestart) {
          if (this.restartTimer) clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (this.shouldRestart) {
              this.safeStart();
            }
          }, 250);
        }
      };
    } catch (err) {
      console.warn("[BrowserSpeechRecognition] Initialization failed:", err);
    }
  }

  public start(): void {
    this.shouldRestart = true;
    this.safeStart();
  }

  private safeStart(): void {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) return;

    try {
      this.recognition.start();
    } catch (err: any) {
      // If already started, ignore collision
      if (err?.name !== "InvalidStateError") {
        console.warn("[BrowserSpeechRecognition] start error:", err);
      }
    }
  }

  public stop(): void {
    this.shouldRestart = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
    this.isListeningActive = false;
    // Do NOT clear buffers here — the engine may read liveCandidateText
    // after calling stop(), and clearing would lose the transcript.
  }

  public abort(): void {
    this.shouldRestart = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
    }
    this.isListeningActive = false;
    // Do NOT clear buffers automatically — use resetForNewTurn() explicitly.
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public onResult(callback: (result: SpeechRecognitionResultPayload) => void): void {
    this.resultCallback = callback;
  }

  public onError(callback: (category: InterviewErrorCategory, error: any) => void): void {
    this.errorCallback = callback;
  }

  public onEnd(callback: () => void): void {
    this.endCallback = callback;
  }

  public onStart(callback: () => void): void {
    this.startCallback = callback;
  }

  /**
   * Clear all transcript buffers. Call this explicitly when starting a new
   * listening turn (not on stop/abort, to avoid losing mid-speech transcripts).
   */
  public clearBuffers(): void {
    this.finalTranscriptBuffer = "";
    this.interimTranscriptBuffer = "";
    this.accumulatedFinalText = "";
  }

  public destroy(): void {
    this.stop();
    this.resultCallback = null;
    this.errorCallback = null;
    this.endCallback = null;
    this.startCallback = null;
    this.recognition = null;
  }
}

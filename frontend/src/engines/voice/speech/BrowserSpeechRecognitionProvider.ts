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

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res && res[0]) {
            if (res.isFinal) {
              final += res[0].transcript + " ";
            } else {
              interim += res[0].transcript;
            }
          }
        }

        this.finalTranscriptBuffer = final.trim();
        this.interimTranscriptBuffer = interim.trim();

        const combined = (final + interim).trim();
        const payload: SpeechRecognitionResultPayload = {
          interimTranscript: this.interimTranscriptBuffer,
          finalTranscript: this.finalTranscriptBuffer,
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

  public clearBuffers(): void {
    this.finalTranscriptBuffer = "";
    this.interimTranscriptBuffer = "";
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

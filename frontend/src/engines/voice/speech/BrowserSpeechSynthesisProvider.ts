/**
 * src/engines/voice/speech/BrowserSpeechSynthesisProvider.ts
 * ---------------------------------------------------------
 * Browser Speech Synthesis Provider implementing ISpeechSynthesisProvider.
 * Features a dedicated speech queue, natural voice selector, sentence chunking,
 * Chrome GC watchdog, and instant interrupt capability.
 */

import { ISpeechSynthesisProvider } from "../types";

export class BrowserSpeechSynthesisProvider implements ISpeechSynthesisProvider {
  private queue: string[] = [];
  private isProcessingQueue = false;
  private keepaliveInterval: any = null;
  private watchdogTimeout: any = null;

  // Callbacks
  private startCallback: ((text: string) => void) | null = null;
  private endCallback: (() => void) | null = null;
  private errorCallback: ((err: any) => void) | null = null;

  constructor() {
    this.preloadVoices();
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window;
  }

  private preloadVoices() {
    if (!this.isSupported()) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  /**
   * Split long text into natural sentence chunks for streaming playback
   */
  public splitIntoSentences(text: string): string[] {
    const clean = text
      .replace(/[*_`#]/g, "")
      .replace(/\n+/g, " ")
      .trim();

    if (!clean) return [];

    // Split by sentence boundaries (. ! ?) while preserving flow
    const regex = /[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g;
    const matches = clean.match(regex);
    if (!matches || matches.length === 0) return [clean];

    return matches.map((s) => s.trim()).filter(Boolean);
  }

  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const preferred = [
      "Google US English",
      "Samantha",
      "Alex",
      "Daniel",
      "Karen",
      "Fred",
      "Victoria",
      "en-US",
      "en-GB",
    ];

    for (const name of preferred) {
      const v = voices.find(
        (vox) =>
          vox.name.toLowerCase().includes(name.toLowerCase()) ||
          vox.lang.toLowerCase().includes(name.toLowerCase())
      );
      if (v) return v;
    }

    return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  }

  /**
   * Speak a complete text or sentence block
   */
  public speak(text: string, onEnded?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      const chunks = this.splitIntoSentences(text);
      if (chunks.length === 0) {
        if (onEnded) onEnded();
        resolve();
        return;
      }

      this.queue = [...chunks];
      this.processQueue(() => {
        if (onEnded) onEnded();
        resolve();
      });
    });
  }

  /**
   * Enqueue additional text chunk for continuous streaming playback
   */
  public enqueue(text: string): void {
    const chunks = this.splitIntoSentences(text);
    if (chunks.length === 0) return;

    this.queue.push(...chunks);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private processQueue(onCompleteAll?: () => void) {
    if (!this.isSupported() || this.queue.length === 0) {
      this.isProcessingQueue = false;
      (window as any).__activeUtterance = null;
      if (onCompleteAll) onCompleteAll();
      if (this.endCallback) this.endCallback();
      return;
    }

    this.isProcessingQueue = true;
    const currentChunk = this.queue.shift()!;

    try {
      const utterance = new SpeechSynthesisUtterance(currentChunk);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      const voice = this.getBestVoice();
      if (voice) utterance.voice = voice;

      let hasEnded = false;
      const finishChunk = () => {
        if (!hasEnded) {
          hasEnded = true;
          this.clearWatchdogs();
          // Process next chunk in queue
          this.processQueue(onCompleteAll);
        }
      };

      utterance.onstart = () => {
        if (this.startCallback) this.startCallback(currentChunk);
      };

      utterance.onend = finishChunk;
      utterance.onerror = (e) => {
        console.warn("[BrowserSpeechSynthesis] Chunk error:", e);
        if (this.errorCallback) this.errorCallback(e);
        finishChunk();
      };

      (window as any).__activeUtterance = utterance;

      // Chrome GC Watchdog: Poll speaking state every 350ms
      let startDetected = false;
      this.keepaliveInterval = setInterval(() => {
        if (hasEnded) {
          this.clearWatchdogs();
          return;
        }
        if (window.speechSynthesis.speaking) {
          startDetected = true;
        } else if (
          startDetected &&
          !window.speechSynthesis.speaking &&
          !window.speechSynthesis.pending
        ) {
          finishChunk();
        }
      }, 350);

      // Word count based timeout boundary (~2.5 words/sec + 2s buffer)
      const wordCount = currentChunk.split(/\s+/).length;
      const estimatedSec = Math.max(2.5, wordCount / 2.5 + 2);
      const maxMs = Math.min(14000, estimatedSec * 1000);

      this.watchdogTimeout = setTimeout(() => {
        if (!hasEnded) {
          finishChunk();
        }
      }, maxMs);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("[BrowserSpeechSynthesis] Speak error:", err);
      if (this.errorCallback) this.errorCallback(err);
      this.clearWatchdogs();
      this.processQueue(onCompleteAll);
    }
  }

  private clearWatchdogs() {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = null;
    }
    if (this.watchdogTimeout) {
      clearTimeout(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
  }

  public cancel(): void {
    this.queue = [];
    this.isProcessingQueue = false;
    this.clearWatchdogs();
    (window as any).__activeUtterance = null;

    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }

  public isSpeaking(): boolean {
    if (!this.isSupported()) return false;
    return this.isProcessingQueue || window.speechSynthesis.speaking;
  }

  public onStart(callback: (text: string) => void): void {
    this.startCallback = callback;
  }

  public onEnd(callback: () => void): void {
    this.endCallback = callback;
  }

  public onError(callback: (err: any) => void): void {
    this.errorCallback = callback;
  }

  public destroy(): void {
    this.cancel();
    this.startCallback = null;
    this.endCallback = null;
    this.errorCallback = null;
  }
}

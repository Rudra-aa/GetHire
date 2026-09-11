/**
 * src/engines/voice/intelligence/LiveSpeechAnalytics.ts
 * -----------------------------------------------------
 * Real-time voice intelligence and speech telemetry analyzer.
 * Tracks speaking rate (WPM), hesitation pauses, filler words, and vocal confidence.
 */

import { LiveSpeechAnalytics } from "../types";
import { InterviewEventBus } from "../EventBus";

const FILLER_WORDS_REGEX = /\b(um|uh|like|you know|basically|actually|literally|so yeah|kind of|sort of)\b/gi;

export class LiveSpeechAnalyticsEngine {
  private eventBus: InterviewEventBus;
  private currentAnalytics: LiveSpeechAnalytics = {
    wordsPerMinute: 0,
    totalWords: 0,
    hesitationCount: 0,
    fillerWordCount: 0,
    fillerWords: [],
    averageVolume: 0,
    durationSeconds: 0,
    confidenceScore: 85,
  };

  private speechStartTime = 0;
  private volumes: number[] = [];

  constructor(eventBus: InterviewEventBus) {
    this.eventBus = eventBus;
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.on("USER_STARTED_SPEAKING", () => {
      if (!this.speechStartTime) {
        this.speechStartTime = Date.now();
      }
    });

    this.eventBus.on("TRANSCRIPT_UPDATED", (payload) => {
      this.analyzeTranscript(payload.combinedTranscript);
    });

    this.eventBus.on("AUDIO_ENERGY_UPDATED", ({ volume }) => {
      if (volume > 0) {
        this.volumes.push(volume);
        if (this.volumes.length > 50) this.volumes.shift();
      }
    });

    this.eventBus.on("STATE_CHANGED", ({ to }) => {
      if (to === "AI_THINKING" || to === "AI_SPEAKING") {
        this.speechStartTime = 0;
        this.volumes = [];
      }
    });
  }

  private analyzeTranscript(transcript: string) {
    const clean = transcript.trim();
    if (!clean) return;

    const words = clean.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // 1. Duration & WPM
    const durationSeconds = this.speechStartTime
      ? Math.max(1, (Date.now() - this.speechStartTime) / 1000)
      : 1;
    const wpm = Math.round((totalWords / durationSeconds) * 60);

    // 2. Filler words analysis
    const fillerMatches = clean.match(FILLER_WORDS_REGEX) || [];
    const uniqueFillers = Array.from(new Set(fillerMatches.map((m) => m.toLowerCase())));

    // 3. Average Volume
    const avgVol =
      this.volumes.length > 0
        ? Math.round(this.volumes.reduce((a, b) => a + b, 0) / this.volumes.length)
        : 50;

    // 4. Confidence Score heuristic (Base 85 - fillers penalty + steady WPM reward)
    let confidence = 85;
    if (fillerMatches.length > 3) confidence -= Math.min(20, (fillerMatches.length - 3) * 3);
    if (wpm >= 110 && wpm <= 160) confidence += 5;
    if (wpm < 70) confidence -= 10;
    confidence = Math.max(40, Math.min(98, confidence));

    this.currentAnalytics = {
      wordsPerMinute: wpm,
      totalWords,
      hesitationCount: Math.floor(fillerMatches.length / 2),
      fillerWordCount: fillerMatches.length,
      fillerWords: uniqueFillers,
      averageVolume: avgVol,
      durationSeconds: Math.round(durationSeconds),
      confidenceScore: confidence,
    };

    this.eventBus.emit("ANALYTICS_UPDATED", this.currentAnalytics);
  }

  public getAnalytics(): LiveSpeechAnalytics {
    return { ...this.currentAnalytics };
  }

  public reset() {
    this.speechStartTime = 0;
    this.volumes = [];
    this.currentAnalytics = {
      wordsPerMinute: 0,
      totalWords: 0,
      hesitationCount: 0,
      fillerWordCount: 0,
      fillerWords: [],
      averageVolume: 0,
      durationSeconds: 0,
      confidenceScore: 85,
    };
  }
}

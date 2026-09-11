/**
 * src/engines/voice/intelligence/TurnTelemetryTracker.ts
 * -----------------------------------------------------
 * High-precision timestamp & latency logger for conversational turns.
 * Measures end-to-end performance: speech-to-backend, backend LLM, and TTS latencies.
 */

import { TurnTelemetry } from "../types";
import { InterviewEventBus } from "../EventBus";

export class TurnTelemetryTracker {
  private eventBus: InterviewEventBus;
  private currentTelemetry: Partial<TurnTelemetry> = {};
  private history: TurnTelemetry[] = [];
  private currentTurnIndex = 0;

  constructor(eventBus: InterviewEventBus) {
    this.eventBus = eventBus;
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.on("STATE_CHANGED", ({ from, to }) => {
      if (to === "LISTENING" && from !== "USER_SPEAKING") {
        this.currentTelemetry.micActivatedTime = Date.now();
      }
    });

    this.eventBus.on("USER_STARTED_SPEAKING", ({ timestamp }) => {
      this.currentTelemetry.speechStartTime = timestamp;
    });

    this.eventBus.on("USER_STOPPED_SPEAKING", ({ timestamp }) => {
      this.currentTelemetry.speechEndTime = timestamp;
    });

    this.eventBus.on("SILENCE_DETECTED", () => {
      this.currentTelemetry.silenceConfirmedTime = Date.now();
    });

    this.eventBus.on("LLM_REQUEST_STARTED", ({ turnIndex }) => {
      this.currentTurnIndex = turnIndex;
      this.currentTelemetry.turnIndex = turnIndex;
      this.currentTelemetry.requestSentTime = Date.now();
      if (!this.currentTelemetry.turnStartTime) {
        this.currentTelemetry.turnStartTime = Date.now();
      }
    });

    this.eventBus.on("LLM_RESPONSE_RECEIVED", ({ latencyMs }) => {
      this.currentTelemetry.llmResponseTime = Date.now();
      this.currentTelemetry.llmLatencyMs = latencyMs;
    });

    this.eventBus.on("TTS_STARTED", () => {
      this.currentTelemetry.ttsStartTime = Date.now();
    });

    this.eventBus.on("TTS_FINISHED", ({ durationMs }) => {
      this.currentTelemetry.ttsEndTime = Date.now();
      this.currentTelemetry.ttsLatencyMs = durationMs;

      // Finalize turn telemetry record
      if (this.currentTelemetry.turnStartTime) {
        const fullRecord: TurnTelemetry = {
          turnIndex: this.currentTurnIndex,
          turnStartTime: this.currentTelemetry.turnStartTime,
          micActivatedTime: this.currentTelemetry.micActivatedTime,
          speechStartTime: this.currentTelemetry.speechStartTime,
          speechEndTime: this.currentTelemetry.speechEndTime,
          silenceConfirmedTime: this.currentTelemetry.silenceConfirmedTime,
          requestSentTime: this.currentTelemetry.requestSentTime,
          llmResponseTime: this.currentTelemetry.llmResponseTime,
          ttsStartTime: this.currentTelemetry.ttsStartTime,
          ttsEndTime: this.currentTelemetry.ttsEndTime,
          turnLatencyMs:
            this.currentTelemetry.llmResponseTime && this.currentTelemetry.requestSentTime
              ? this.currentTelemetry.llmResponseTime - this.currentTelemetry.requestSentTime
              : undefined,
          llmLatencyMs: this.currentTelemetry.llmLatencyMs,
          ttsLatencyMs: durationMs,
          totalDurationMs: Date.now() - this.currentTelemetry.turnStartTime,
        };

        this.history.push(fullRecord);
        console.info(
          `[TELEMETRY] Turn ${this.currentTurnIndex} complete | LLM Latency: ${fullRecord.turnLatencyMs ?? 0}ms | TTS: ${durationMs}ms | Total: ${fullRecord.totalDurationMs}ms`
        );
      }

      // Reset for next turn
      this.currentTelemetry = {};
    });
  }

  public getHistory(): TurnTelemetry[] {
    return [...this.history];
  }

  public getLatestTurn(): TurnTelemetry | null {
    if (this.history.length > 0 && this.history[this.history.length - 1]) {
      return this.history[this.history.length - 1]!;
    }
    return null;
  }

  public reset() {
    this.currentTelemetry = {};
    this.history = [];
    this.currentTurnIndex = 0;
  }
}

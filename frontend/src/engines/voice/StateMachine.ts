/**
 * src/engines/voice/StateMachine.ts
 * ---------------------------------
 * Finite State Machine for GetHire Voice AI Engine.
 * Enforces valid state transitions and broadcasts state changes via EventBus.
 */

import { InterviewFSMState } from "./types";
import { InterviewEventBus } from "./EventBus";

const VALID_TRANSITIONS: Record<InterviewFSMState, InterviewFSMState[]> = {
  INITIALIZING: ["AI_SPEAKING", "WAITING_FOR_MIC", "LISTENING", "AI_THINKING", "ERROR", "PAUSED"],
  AI_SPEAKING: ["WAITING_FOR_MIC", "LISTENING", "AI_THINKING", "ERROR", "PAUSED", "INTERVIEW_COMPLETE"],
  WAITING_FOR_MIC: ["LISTENING", "USER_SPEAKING", "ERROR", "PAUSED"],
  LISTENING: [
    "USER_SPEAKING",
    "SILENCE_DETECTED",
    "AUTO_SUBMITTING",
    "AI_THINKING",
    "AI_SPEAKING",
    "ERROR",
    "PAUSED",
    "INTERVIEW_COMPLETE",
  ],
  USER_SPEAKING: [
    "SILENCE_DETECTED",
    "AUTO_SUBMITTING",
    "LISTENING",
    "AI_THINKING",
    "ERROR",
    "PAUSED",
    "INTERVIEW_COMPLETE",
  ],
  SILENCE_DETECTED: [
    "AUTO_SUBMITTING",
    "USER_SPEAKING",
    "LISTENING",
    "AI_THINKING",
    "ERROR",
    "PAUSED",
    "INTERVIEW_COMPLETE",
  ],
  AUTO_SUBMITTING: ["AI_THINKING", "AI_SPEAKING", "ERROR", "INTERVIEW_COMPLETE", "LISTENING"],
  AI_THINKING: ["AI_SPEAKING", "INTERVIEW_COMPLETE", "ERROR", "LISTENING"],
  PAUSED: ["LISTENING", "AI_SPEAKING", "AI_THINKING", "INTERVIEW_COMPLETE", "ERROR"],
  ERROR: ["INITIALIZING", "LISTENING", "AI_THINKING", "AI_SPEAKING", "PAUSED"],
  INTERVIEW_COMPLETE: [],
};

export class InterviewStateMachine {
  private currentState: InterviewFSMState = "INITIALIZING";
  private eventBus: InterviewEventBus;
  private stateHistory: { state: InterviewFSMState; timestamp: number; reason?: string | undefined }[] = [];

  constructor(eventBus: InterviewEventBus, initialState: InterviewFSMState = "INITIALIZING") {
    this.eventBus = eventBus;
    this.currentState = initialState;
    this.stateHistory.push({ state: initialState, timestamp: Date.now(), reason: "init" });
  }

  /**
   * Get current FSM state
   */
  getState(): InterviewFSMState {
    return this.currentState;
  }

  /**
   * Check if transition to target state is legally permissible
   */
  canTransition(to: InterviewFSMState): boolean {
    if (this.currentState === to) return true;
    const allowed = VALID_TRANSITIONS[this.currentState] || [];
    return allowed.includes(to);
  }

  /**
   * Transition to new state with validation and event broadcast
   */
  transition(to: InterviewFSMState, reason?: string | undefined): boolean {
    if (this.currentState === to) {
      return true;
    }

    if (!this.canTransition(to)) {
      console.warn(
        `[StateMachine] Invalid transition attempted: ${this.currentState} -> ${to} (reason: ${reason || "none"})`
      );
    }

    const from = this.currentState;
    this.currentState = to;
    this.stateHistory.push({ state: to, timestamp: Date.now(), reason });

    // Broadcast change
    this.eventBus.emit("STATE_CHANGED", { from, to, reason });
    return true;
  }

  /**
   * Get history of state transitions
   */
  getHistory() {
    return [...this.stateHistory];
  }

  /**
   * Reset FSM to initial state
   */
  reset(initialState: InterviewFSMState = "INITIALIZING") {
    const from = this.currentState;
    this.currentState = initialState;
    this.stateHistory = [{ state: initialState, timestamp: Date.now(), reason: "reset" }];
    this.eventBus.emit("STATE_CHANGED", { from, to: initialState, reason: "reset" });
  }
}

/**
 * src/engines/voice/EventBus.ts
 * -----------------------------
 * Type-safe, decoupled event bus for GetHire Voice AI Engine.
 */

import { InterviewEventMap, EventCallback } from "./types";

export class InterviewEventBus {
  private listeners: { [K in keyof InterviewEventMap]?: Set<EventCallback<any>> } = {};

  /**
   * Subscribe to an engine event
   */
  on<K extends keyof InterviewEventMap>(
    event: K,
    callback: EventCallback<InterviewEventMap[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(callback);

    // Return unsubscription function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Subscribe to an engine event once
   */
  once<K extends keyof InterviewEventMap>(
    event: K,
    callback: EventCallback<InterviewEventMap[K]>
  ): () => void {
    const wrapper: EventCallback<InterviewEventMap[K]> = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an engine event
   */
  off<K extends keyof InterviewEventMap>(
    event: K,
    callback: EventCallback<InterviewEventMap[K]>
  ): void {
    const set = this.listeners[event];
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        delete this.listeners[event];
      }
    }
  }

  /**
   * Emit an engine event to all registered listeners
   */
  emit<K extends keyof InterviewEventMap>(event: K, data: InterviewEventMap[K]): void {
    const set = this.listeners[event];
    if (set && set.size > 0) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event "${String(event)}":`, err);
        }
      });
    }
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners = {};
  }
}

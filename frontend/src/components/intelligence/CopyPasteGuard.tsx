import React, { useEffect } from "react";
import { integrityApi } from "@/services/integrityApi";

interface CopyPasteGuardProps {
  sessionId: string;
  currentQuestionId?: string | undefined;
  isPaused?: boolean | undefined;
  onWarningTriggered?: ((message: string) => void) | undefined;
  onIntegrityScoreUpdated?: ((score: number) => void) | undefined;
}

export const CopyPasteGuard: React.FC<CopyPasteGuardProps> = ({
  sessionId,
  currentQuestionId,
  isPaused = false,
  onWarningTriggered,
  onIntegrityScoreUpdated,
}) => {
  useEffect(() => {
    const handleCopyPaste = async (e: Event) => {
      if (isPaused) return;
      e.preventDefault();

      const eventType = e.type === "copy" ? "copy_attempt" : e.type === "paste" ? "paste_attempt" : "cut_attempt";

      if (onWarningTriggered) {
        onWarningTriggered(`${e.type.toUpperCase()} action blocked. Clipboard interaction is disabled.`);
      }

      try {
        const res = await integrityApi.logEvent({
          session_id: sessionId,
          question_id: currentQuestionId,
          timestamp_sec: Math.round(performance.now() / 1000),
          event_type: eventType,
          details: `Candidate attempted to ${e.type} text in answer editor`,
        });
        if (res?.updated_integrity_score !== undefined && onIntegrityScoreUpdated) {
          onIntegrityScoreUpdated(res.updated_integrity_score);
        }
      } catch (err) {
        console.warn("Copy/paste log warning:", err);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isPaused) return;
      e.preventDefault();
    };

    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [sessionId, currentQuestionId, isPaused, onWarningTriggered, onIntegrityScoreUpdated]);

  return null; // Invisible guard component
};

export default CopyPasteGuard;

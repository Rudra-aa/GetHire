import React, { useEffect, useRef } from "react";
import { integrityApi } from "@/services/integrityApi";

interface BrowserIntegrityGuardProps {
  sessionId: string;
  currentQuestionId?: string | undefined;
  isPaused?: boolean | undefined;
  onWarningTriggered?: ((warningMessage: string) => void) | undefined;
  onIntegrityScoreUpdated?: ((newScore: number) => void) | undefined;
}

export const BrowserIntegrityGuard: React.FC<BrowserIntegrityGuardProps> = ({
  sessionId,
  currentQuestionId,
  isPaused = false,
  onWarningTriggered,
  onIntegrityScoreUpdated,
}) => {
  const tabAwayStartRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) elapsedRef.current += 1;
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // 1. Fullscreen Request & Listener
  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (isPaused) return;
      if (!document.fullscreenElement) {
        if (onWarningTriggered) {
          onWarningTriggered("Fullscreen exited. Please maintain full screen mode during interview.");
        }
        try {
          const res = await integrityApi.logEvent({
            session_id: sessionId,
            question_id: currentQuestionId,
            timestamp_sec: elapsedRef.current,
            event_type: "fullscreen_exited",
            details: "Candidate exited browser fullscreen mode",
          });
          if (res?.updated_integrity_score !== undefined && onIntegrityScoreUpdated) {
            onIntegrityScoreUpdated(res.updated_integrity_score);
          }
        } catch (err) {
          console.warn("Fullscreen exit log warning:", err);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [sessionId, currentQuestionId, isPaused, onWarningTriggered, onIntegrityScoreUpdated]);

  // 2. Tab Switch & Window Focus/Blur Listener
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (isPaused) return;
      if (document.hidden) {
        tabAwayStartRef.current = Date.now();
        if (onWarningTriggered) {
          onWarningTriggered("Tab switched or browser minimized. Please return to interview screen.");
        }
      } else if (tabAwayStartRef.current) {
        const awayDur = (Date.now() - tabAwayStartRef.current) / 1000;
        tabAwayStartRef.current = null;
        try {
          const res = await integrityApi.logEvent({
            session_id: sessionId,
            question_id: currentQuestionId,
            timestamp_sec: elapsedRef.current,
            event_type: "tab_switched",
            duration_sec: awayDur,
            details: `Candidate switched tab for ${awayDur.toFixed(1)} seconds`,
          });
          if (res?.updated_integrity_score !== undefined && onIntegrityScoreUpdated) {
            onIntegrityScoreUpdated(res.updated_integrity_score);
          }
        } catch (err) {
          console.warn("Tab switch log warning:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionId, currentQuestionId, isPaused, onWarningTriggered, onIntegrityScoreUpdated]);

  // 3. DevTools Detection Listener
  useEffect(() => {
    const checkDevTools = async () => {
      if (isPaused) return;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        try {
          const res = await integrityApi.logEvent({
            session_id: sessionId,
            question_id: currentQuestionId,
            timestamp_sec: elapsedRef.current,
            event_type: "devtools_opened",
            details: "Developer Tools window open detected",
          });
          if (res?.updated_integrity_score !== undefined && onIntegrityScoreUpdated) {
            onIntegrityScoreUpdated(res.updated_integrity_score);
          }
        } catch (err) {
          console.warn("DevTools detection warning:", err);
        }
      }
    };

    const devToolsInterval = setInterval(() => {
      void checkDevTools();
    }, 5000);
    return () => clearInterval(devToolsInterval);
  }, [sessionId, currentQuestionId, isPaused, onIntegrityScoreUpdated]);

  // 4. Copy/Paste Detection Listener
  useEffect(() => {
    const handleCopyPaste = async (e: ClipboardEvent) => {
      if (isPaused) return;
      const eventType = e.type === "copy" ? "content_copied" : "content_pasted";
      const details = e.type === "copy" ? "Candidate copied text to clipboard" : "Candidate pasted text from clipboard";
      
      if (onWarningTriggered) {
        onWarningTriggered(`${e.type === 'copy' ? 'Copying' : 'Pasting'} is not allowed during the assessment.`);
      }
      
      try {
        const res = await integrityApi.logEvent({
          session_id: sessionId,
          question_id: currentQuestionId,
          timestamp_sec: elapsedRef.current,
          event_type: eventType,
          details: details,
        });
        if (res?.updated_integrity_score !== undefined && onIntegrityScoreUpdated) {
          onIntegrityScoreUpdated(res.updated_integrity_score);
        }
      } catch (err) {
        console.warn(`${e.type} log warning:`, err);
      }
    };

    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    return () => {
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [sessionId, currentQuestionId, isPaused, onWarningTriggered, onIntegrityScoreUpdated]);

  return null; // Invisible guard component
};

export default BrowserIntegrityGuard;

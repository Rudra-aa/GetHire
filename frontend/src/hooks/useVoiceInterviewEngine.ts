/**
 * src/hooks/useVoiceInterviewEngine.ts
 * ------------------------------------
 * React Hook Adapter wrapping the modular Production-Grade Voice AI Interview Engine.
 * Provides full backward-compatible interface for InterviewPage, VoiceMeetGrid, and InterviewControlBar
 * while leveraging the new FSM, EventBus, Adaptive Silence Detector, Audio Meter, and Telemetry.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  VoiceInterviewEngine,
  DEFAULT_PERSONA,
  LiveSpeechAnalytics,
} from "@/engines/voice";
import { type InterviewState, type RecruiterPersona, type TranscriptEntry } from "@/types/interviewEngine";
import { type InterviewQuestion } from "@/services/interviewApi";

export { DEFAULT_PERSONA };

export function useVoiceInterviewEngine(initialSessionId?: string) {
  const engineRef = useRef<VoiceInterviewEngine | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reactive State mapped from VoiceEngine FSM & EventBus
  const [state, setState] = useState<InterviewState>("WAITING");
  const [persona] = useState<RecruiterPersona>(DEFAULT_PERSONA);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestionPrompt, setActiveQuestionPrompt] = useState("");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [liveCandidateText, setLiveCandidateText] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isTextFallbackMode, setIsTextFallbackMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [turnWarning, setTurnWarning] = useState<string | null>(null);
  const [actualSessionId, setActualSessionId] = useState<string | undefined>(initialSessionId);
  const [isStarting, setIsStarting] = useState(false);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [silenceRemainingMs, setSilenceRemainingMs] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<LiveSpeechAnalytics | null>(null);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new VoiceInterviewEngine(
      initialSessionId
        ? { sessionId: initialSessionId, persona: DEFAULT_PERSONA }
        : { persona: DEFAULT_PERSONA }
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || null;

  // Sync with Engine Events
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      engine.eventBus.on("STATE_CHANGED", ({ to }) => {
        // Map FSM state to React state
        if (to === "AI_SPEAKING") {
          setIsSpeakingAi(true);
          setIsStarting(false);
          setState("QUESTION");
        } else if (to === "INITIALIZING") {
          setIsStarting(true);
          setIsSpeakingAi(false);
          setState("INITIALIZING");
        } else if (to === "GENERATING_FIRST_QUESTION") {
          setIsStarting(true);
          setIsSpeakingAi(false);
          setState("GENERATING_FIRST_QUESTION");
        } else if (to === "READY") {
          setIsStarting(false);
          setState("READY");
        } else if (to === "AI_THINKING" || to === "AUTO_SUBMITTING") {
          setIsSpeakingAi(false);
          setState("THINKING");
        } else if (to === "LISTENING" || to === "USER_SPEAKING" || to === "SILENCE_DETECTED") {
          setIsSpeakingAi(false);
          setIsStarting(false);
          setState("LISTENING");
        } else if (to === "INTERVIEW_COMPLETE") {
          setIsSpeakingAi(false);
          setIsStarting(false);
          setState("INTERVIEW_COMPLETE");
        } else if (to === "ERROR") {
          setIsSpeakingAi(false);
          setIsStarting(false);
          setState("ERROR");
        } else {
          setState(to as InterviewState);
        }

        // Sync transcripts and questions
        setTranscripts([...engine.transcripts]);
        setQuestions([...engine.questions]);
        setCurrentQuestionIndex(engine.currentQuestionIndex);
        setActiveQuestionPrompt(engine.activeQuestionPrompt);
        setActualSessionId(engine.sessionId || undefined);
        if (engine.isTextFallbackMode) {
          setIsTextFallbackMode(true);
        }
      })
    );

    unsubs.push(
      engine.eventBus.on("MIC_STATUS_CHANGED", ({ textFallback }) => {
        if (textFallback) {
          setIsTextFallbackMode(true);
        }
      })
    );

    unsubs.push(
      engine.eventBus.on("TRANSCRIPT_UPDATED", ({ combinedTranscript }) => {
        setLiveCandidateText(combinedTranscript);
        setTurnWarning(null);
      })
    );

    unsubs.push(
      engine.eventBus.on("AUDIO_ENERGY_UPDATED", ({ volume }) => {
        setMicVolume(volume);
      })
    );

    unsubs.push(
      engine.eventBus.on("SILENCE_COUNTDOWN", ({ remainingMs }) => {
        setSilenceRemainingMs(remainingMs);
      })
    );

    unsubs.push(
      engine.eventBus.on("ANALYTICS_UPDATED", (data) => {
        setAnalytics(data);
      })
    );

    unsubs.push(
      engine.eventBus.on("ERROR_OCCURRED", ({ message }) => {
        setTurnWarning(message);
        setTimeout(() => setTurnWarning(null), 5000);
      })
    );

    unsubs.push(
      engine.eventBus.on("MIC_MUTED_CHANGED", ({ isMuted }) => {
        setIsMicMuted(isMuted);
      })
    );

    // Elapsed timer ticker
    const timer = setInterval(() => {
      if (engine) {
        setElapsedSeconds(engine.elapsedSeconds);
      }
    }, 1000);

    return () => {
      unsubs.forEach((fn) => fn());
      clearInterval(timer);
    };
  }, []);

  // React 18 StrictMode mounts, cleans up, and immediately re-mounts effects in
  // development. Defer disposal one task so that rehearsal cleanup cannot
  // destroy the live engine before the user presses Start.
  useEffect(() => {
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    return () => {
      cleanupTimerRef.current = setTimeout(() => {
        engineRef.current?.destroy();
        engineRef.current = null;
        cleanupTimerRef.current = null;
      }, 0);
    };
  }, []);

  const [initErrorMessage, setInitErrorMessage] = useState<string | null>(null);

  // Action methods
  const startInterview = useCallback(async (targetRole?: string) => {
    if (!engineRef.current) return;
    try {
      setIsStarting(true);
      setInitErrorMessage(null);
      await engineRef.current.startInterview(targetRole);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to initialize interview.";
      setInitErrorMessage(msg);
    } finally {
      setIsStarting(false);
    }
  }, []);

  const retryInitialization = useCallback(async (targetRole?: string) => {
    if (!engineRef.current) return;
    setInitErrorMessage(null);
    setState("INITIALIZING");
    await startInterview(targetRole);
  }, [startInterview]);

  const finishCandidateAnswer = useCallback(async (customText?: string) => {
    if (!engineRef.current) return;
    await engineRef.current.submitAnswer(customText, false);
  }, []);

  const interruptAi = useCallback((reason: "click" | "typing" | "voice" = "click") => {
    if (!engineRef.current) return;
    engineRef.current.interrupt(reason);
  }, []);

  const repeatQuestion = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.repeatQuestion();
  }, []);

  const requestClarification = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.requestClarification();
  }, []);

  const skipQuestion = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.skipQuestion();
  }, []);

  const retryTurn = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.retryTurn();
  }, []);

  const endInterview = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.endInterview();
    setState("INTERVIEW_COMPLETE");
  }, []);

  const handleToggleMic = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.toggleMic();
  }, []);

  return {
    state,
    persona,
    questions,
    currentQuestionIndex,
    currentQuestion,
    activeQuestionPrompt,
    transcripts,
    liveCandidateText,
    setLiveCandidateText,
    isMicMuted,
    setIsMicMuted: handleToggleMic,
    micVolume,
    isTextFallbackMode,
    setIsTextFallbackMode,
    elapsedSeconds,
    startInterview,
    finishCandidateAnswer,
    endInterview,
    skipQuestion,
    retryTurn,
    repeatQuestion,
    requestClarification,
    actualSessionId,
    turnWarning,
    isStarting,
    isSpeakingAi,
    interruptAi,
    silenceRemainingMs,
    analytics,
    initErrorMessage,
    retryInitialization,
    engine: engineRef.current,
  };
}

export default useVoiceInterviewEngine;

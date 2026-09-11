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

  // Reactive State mapped from VoiceEngine FSM & EventBus
  const [state, setState] = useState<InterviewState>("WAITING");
  const [persona] = useState<RecruiterPersona>(DEFAULT_PERSONA);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestionPrompt, setActiveQuestionPrompt] = useState<string>(
    "Welcome to GetHire AI Interview Studio. Initializing session..."
  );
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
        } else if (to === "AI_THINKING" || to === "AUTO_SUBMITTING") {
          setIsSpeakingAi(false);
          setState("THINKING");
        } else if (to === "LISTENING" || to === "USER_SPEAKING" || to === "SILENCE_DETECTED") {
          setIsSpeakingAi(false);
          setState("LISTENING");
        } else if (to === "INITIALIZING") {
          setIsStarting(true);
          setState("WAITING");
        } else if (to === "INTERVIEW_COMPLETE") {
          setIsSpeakingAi(false);
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Action methods
  const startInterview = useCallback(async (targetRole?: string) => {
    if (!engineRef.current) return;
    setIsStarting(true);
    await engineRef.current.startInterview(targetRole);
    setIsStarting(false);
  }, []);

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
    engine: engineRef.current,
  };
}

export default useVoiceInterviewEngine;

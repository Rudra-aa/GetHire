import { useState, useEffect, useCallback, useRef } from "react";
import { type InterviewState, type RecruiterPersona, type TranscriptEntry } from "@/types/interviewEngine";
import { interviewApi, type InterviewQuestion } from "@/services/interviewApi";

export const DEFAULT_PERSONA: RecruiterPersona = {
  id: "persona-alex",
  name: "Alex",
  role: "Lead Software Architect",
  company: "GetHire",
  greeting: "Hello! Welcome to your technical interview.",
  speakingStyle: "Direct, technical, inquisitive",
  challengeLevel: "Adaptive",
};

// Subtle Web Audio chime for audio cues
function playAudioCue(type: "start" | "end" | "ding") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "start") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    } else if (type === "end") {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    }

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Ignore audio context error
  }
}

// Select natural voice across Chrome, Safari, Firefox, Edge
function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferredNames = [
    "Google US English",
    "Samantha",
    "Alex",
    "Daniel",
    "Karen",
    "Fred",
    "Victoria",
    "Moira",
    "en-US",
    "en-GB",
  ];

  for (const target of preferredNames) {
    const found = voices.find(
      (v) => v.name.toLowerCase().includes(target.toLowerCase()) || v.lang.toLowerCase().includes(target.toLowerCase())
    );
    if (found) return found;
  }

  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

export function useVoiceInterviewEngine(initialSessionId?: string) {
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

  const currentQuestion = questions[currentQuestionIndex] || null;

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const restartTimerRef = useRef<any>(null);
  const isSpeakingAiRef = useRef(false);
  const speechTimeoutRef = useRef<any>(null);
  const speechKeepaliveRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number>(0);
  const interruptAiRef = useRef<((reason?: "click" | "typing" | "voice") => void) | null>(null);

  useEffect(() => {
    isSpeakingAiRef.current = isSpeakingAi;
  }, [isSpeakingAi]);

  // Pre-load voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Timer
  useEffect(() => {
    if (state === "WAITING" || state === "INTERVIEW_COMPLETE") return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  // Real Mic Volume Analyser via Web Audio API
  useEffect(() => {
    let active = true;
    let animId: number;

    async function initAudioMeter() {
      if (isMicMuted) {
        setMicVolume(0);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let loudFrames = 0;

        const checkVolume = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] ?? 0;
          }
          const avg = sum / (dataArray.length || 1);
          const normalized = Math.min(100, Math.round((avg / 128) * 100 * 1.6));
          setMicVolume(normalized);

          // Barge-in: if candidate speaks while Alex is talking (>38 volume for ~400ms)
          if (isSpeakingAiRef.current && normalized > 38) {
            loudFrames++;
            if (loudFrames > 12) {
              loudFrames = 0;
              interruptAiRef.current?.("voice");
            }
          } else {
            loudFrames = 0;
          }

          animId = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch {
        // Fallback if mic permission not granted yet
      }
    }

    void initAudioMeter();

    return () => {
      active = false;
      if (animId) cancelAnimationFrame(animId);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isMicMuted]);

  // Robust Speech Recognition
  const startMicrophone = useCallback(() => {
    if (isMicMuted) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsTextFallbackMode(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
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

        const combined = (final + interim).trim();
        if (combined) {
          setLiveCandidateText(combined);
          setTurnWarning(null);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("[SPEECH_REC] Notice:", e?.error);
        if (e?.error === "not-allowed" || e?.error === "audio-capture") {
          setIsTextFallbackMode(true);
          setTurnWarning("Microphone access is unavailable or denied. Type your response below.");
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && !isMicMuted) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && !isMicMuted) {
              try {
                recognition.start();
              } catch {
                // Ignore restart collision
              }
            }
          }, 350);
        }
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      recognition.start();
    } catch (err) {
      console.warn("[SPEECH_REC] Start failed:", err);
      setIsTextFallbackMode(true);
    }
  }, [isMicMuted]);

  const stopMicrophone = useCallback(() => {
    isListeningRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }, []);

  // Immediate interruption / barge-in controller
  const interruptAi = useCallback((reason: "click" | "typing" | "voice" = "click") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel error
      }
    }

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (speechKeepaliveRef.current) {
      clearInterval(speechKeepaliveRef.current);
      speechKeepaliveRef.current = null;
    }

    setIsSpeakingAi(false);
    activeUtteranceRef.current = null;
    (window as any).__activeUtterance = null;

    setState("LISTENING");
    startMicrophone();
    playAudioCue("ding");

    const elapsed = Date.now() - speechStartTimeRef.current;
    if (elapsed < 2200 && reason === "click") {
      setTurnWarning("Alex stopped. You can answer now (or click 'Hear Again' if you'd like to hear the whole question).");
    } else {
      setTurnWarning("Alex stopped speaking. Listening to your answer...");
    }
    setTimeout(() => setTurnWarning(null), 3500);
  }, [startMicrophone]);

  useEffect(() => {
    interruptAiRef.current = interruptAi;
  }, [interruptAi]);

  // Robust Speech Synthesis with Instant Yield and Barge-in capability
  const speakAIText = useCallback((text: string, onEnded?: () => void) => {
    setIsSpeakingAi(true);

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeakingAi(false);
      if (onEnded) setTimeout(onEnded, 800);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      // Ignore cancel error
    }

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (speechKeepaliveRef.current) {
      clearInterval(speechKeepaliveRef.current);
      speechKeepaliveRef.current = null;
    }

    setTimeout(() => {
      try {
        const cleanText = text
          .replace(/[*_`#]/g, "")
          .replace(/\b(Senior Full-Stack Engineer|GetHire|FastAPI|React|PostgreSQL|Redis)\b/gi, "$1")
          .trim();

        if (!cleanText) {
          setIsSpeakingAi(false);
          if (onEnded) onEnded();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.02;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = "en-US";

        const voice = getBestEnglishVoice();
        if (voice) utterance.voice = voice;

        speechStartTimeRef.current = Date.now();

        let hasFinished = false;
        const finishUtterance = () => {
          if (!hasFinished) {
            hasFinished = true;
            setIsSpeakingAi(false);
            activeUtteranceRef.current = null;
            (window as any).__activeUtterance = null;
            if (speechTimeoutRef.current) {
              clearTimeout(speechTimeoutRef.current);
              speechTimeoutRef.current = null;
            }
            if (speechKeepaliveRef.current) {
              clearInterval(speechKeepaliveRef.current);
              speechKeepaliveRef.current = null;
            }
            playAudioCue("ding");
            if (onEnded) onEnded();
          }
        };

        utterance.onstart = () => {
          setIsSpeakingAi(true);
        };

        utterance.onend = finishUtterance;
        utterance.onerror = (e) => {
          console.warn("[SPEECH_SYNTH] Notice:", e);
          finishUtterance();
        };

        activeUtteranceRef.current = utterance;
        (window as any).__activeUtterance = utterance;

        // Active poll: verify speech completion every 400ms
        let startDetected = false;
        const keepalive = setInterval(() => {
          if (hasFinished) {
            clearInterval(keepalive);
            return;
          }
          if (window.speechSynthesis.speaking) {
            startDetected = true;
          } else if (startDetected && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
            finishUtterance();
            clearInterval(keepalive);
          }
        }, 400);
        speechKeepaliveRef.current = keepalive;

        // Word count based timeout boundary (~2.5 words/sec + 2s buffer)
        const wordCount = cleanText.split(/\s+/).length;
        const estimatedSeconds = Math.max(3, (wordCount / 2.5) + 2);
        const maxDuration = Math.min(16000, estimatedSeconds * 1000);

        speechTimeoutRef.current = setTimeout(() => {
          if (!hasFinished) {
            finishUtterance();
          }
        }, maxDuration);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[SPEECH_SYNTH] Generation failed:", err);
        setIsSpeakingAi(false);
        if (onEnded) onEnded();
      }
    }, 60);
  }, []);


  const startInterview = useCallback(async () => {
    setIsStarting(true);
    try {
      setState("INTRODUCTION");
      let session;
      const targetSessionId = actualSessionId || initialSessionId;

      if (targetSessionId && targetSessionId !== "sess-ai-demo") {
        try {
          session = await interviewApi.getSession(targetSessionId);
        } catch {
          session = await interviewApi.startSession({
            target_role: "Senior Full-Stack Engineer",
            interview_type: "technical",
            total_questions: 5,
          });
        }
      } else {
        session = await interviewApi.startSession({
          target_role: "Senior Full-Stack Engineer",
          interview_type: "technical",
          total_questions: 5,
        });
      }

      setActualSessionId(session.id);
      setQuestions(session.questions || []);

      setState("THINKING");
      const initRes = await interviewApi.processTurn(
        session.id,
        "[Candidate has joined the interview. Please greet them and ask the first question.]"
      );

      const aiGreeting =
        initRes.ai_response ||
        "Hello, I am Alex, Lead Software Architect at GetHire. Let's begin your technical interview. Could you start by introducing yourself and sharing your core technical experience?";

      setActiveQuestionPrompt(aiGreeting);

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setTranscripts([
        { id: `t-ai-intro-${Date.now()}`, speaker: "ai", text: aiGreeting, timestamp: timeStr },
      ]);

      setState("QUESTION");

      speakAIText(aiGreeting, () => {
        setState("LISTENING");
        startMicrophone();
      });
    } catch (err: any) {
      console.error("[RUNTIME] Failed to start interview:", err);
      setState("ERROR");
      setTurnWarning("Failed to connect to AI Interview Orchestrator. Click 'Retry Connection' below.");
    } finally {
      setIsStarting(false);
    }
  }, [actualSessionId, initialSessionId, speakAIText, startMicrophone]);

  const finishCandidateAnswer = useCallback(
    async (customText?: string) => {
      const textToSubmit = (customText || liveCandidateText).trim();

      if (!textToSubmit) {
        setTurnWarning("Please speak or type your answer before submitting.");
        setTimeout(() => setTurnWarning(null), 3500);
        return;
      }

      setTurnWarning(null);
      stopMicrophone();

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setState("TRANSCRIBING");
      setTranscripts((prev) => [
        ...prev,
        { id: `t-cand-${Date.now()}`, speaker: "candidate", text: textToSubmit, timestamp: timeStr },
      ]);
      setLiveCandidateText("");

      setState("THINKING");
      const sessId = actualSessionId || "sess-ai-demo";

      try {
        const res = await interviewApi.processTurn(sessId, textToSubmit);
        setState("FOLLOW_UP_DECISION");

        const aiText =
          res.ai_response ||
          "Thank you for sharing that. Let's dive deeper into how you handle system resilience.";
        const decision = res.decision?.action;
        const nextIdx = res.decision?.next_question_index ?? currentQuestionIndex;

        setActiveQuestionPrompt(aiText);

        await interviewApi.submitAnswer(sessId, {
          question_id: currentQuestion?.id || `q_${currentQuestionIndex + 1}`,
          answer_text: textToSubmit,
          time_taken_seconds: elapsedSeconds,
          is_draft: false,
        });

        if (decision === "follow_up" || nextIdx === currentQuestionIndex) {
          setState("FOLLOW_UP");
          setTranscripts((prev) => [
            ...prev,
            {
              id: `t-ai-fu-${Date.now()}`,
              speaker: "ai",
              text: aiText,
              isFollowUp: true,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          speakAIText(aiText, () => {
            setState("LISTENING");
            startMicrophone();
          });
        } else if (nextIdx < questions.length) {
          setCurrentQuestionIndex(nextIdx);
          setState("QUESTION");
          setTranscripts((prev) => [
            ...prev,
            {
              id: `t-ai-q-${nextIdx}-${Date.now()}`,
              speaker: "ai",
              text: aiText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          speakAIText(aiText, () => {
            setState("LISTENING");
            startMicrophone();
          });
        } else {
          setTranscripts((prev) => [
            ...prev,
            {
              id: `t-ai-end-${Date.now()}`,
              speaker: "ai",
              text: aiText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          await interviewApi.completeSession(sessId);
          speakAIText(aiText, () => setState("INTERVIEW_COMPLETE"));
        }
      } catch (err: any) {
        console.error("[RUNTIME] Gemini turn error:", err);
        setState("ERROR");
        stopMicrophone();
        setTurnWarning("AI Turn processing encountered an issue. Click 'Retry Turn' to continue.");
      }
    },
    [
      liveCandidateText,
      currentQuestionIndex,
      questions.length,
      speakAIText,
      actualSessionId,
      stopMicrophone,
      startMicrophone,
      currentQuestion?.id,
      elapsedSeconds,
    ]
  );

  const retryTurn = useCallback(async () => {
    let lastText = "";
    for (let i = transcripts.length - 1; i >= 0; i--) {
      const transcript = transcripts[i];
      if (transcript && transcript.speaker === "candidate") {
        lastText = transcript.text;
        break;
      }
    }

    if (!lastText) {
      if (state === "ERROR" && transcripts.length === 0) {
        void startInterview();
        return;
      }
      setState("LISTENING");
      startMicrophone();
      return;
    }

    setState("THINKING");
    const sessId = actualSessionId || "sess-ai-demo";

    try {
      const res = await interviewApi.processTurn(sessId, lastText);
      const aiText = res.ai_response || "Let's continue our technical discussion.";
      const decision = res.decision?.action;
      const nextIdx = res.decision?.next_question_index ?? currentQuestionIndex;

      setActiveQuestionPrompt(aiText);

      if (decision === "follow_up" || nextIdx === currentQuestionIndex) {
        setState("FOLLOW_UP");
        setTranscripts((prev) => [
          ...prev,
          {
            id: `t-ai-fu-${Date.now()}`,
            speaker: "ai",
            text: aiText,
            isFollowUp: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        speakAIText(aiText, () => {
          setState("LISTENING");
          startMicrophone();
        });
      } else if (nextIdx < questions.length) {
        setCurrentQuestionIndex(nextIdx);
        setState("QUESTION");
        setTranscripts((prev) => [
          ...prev,
          {
            id: `t-ai-q-${nextIdx}-${Date.now()}`,
            speaker: "ai",
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        speakAIText(aiText, () => {
          setState("LISTENING");
          startMicrophone();
        });
      } else {
        setTranscripts((prev) => [
          ...prev,
          {
            id: `t-ai-end-${Date.now()}`,
            speaker: "ai",
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        await interviewApi.completeSession(sessId);
        speakAIText(aiText, () => setState("INTERVIEW_COMPLETE"));
      }
    } catch (err: any) {
      console.error("[RUNTIME] Retry failed:", err);
      setState("ERROR");
      stopMicrophone();
    }
  }, [
    transcripts,
    state,
    startInterview,
    actualSessionId,
    currentQuestionIndex,
    questions.length,
    speakAIText,
    startMicrophone,
    stopMicrophone,
  ]);

  const repeatQuestion = useCallback(() => {
    if (activeQuestionPrompt) {
      speakAIText(activeQuestionPrompt);
      return;
    }
    if (transcripts.length > 0) {
      for (let i = transcripts.length - 1; i >= 0; i--) {
        const item = transcripts[i];
        if (item && item.speaker === "ai") {
          speakAIText(item.text);
          break;
        }
      }
    }
  }, [activeQuestionPrompt, transcripts, speakAIText]);

  const requestClarification = useCallback(async () => {
    stopMicrophone();
    setState("THINKING");
    const sessId = actualSessionId || "sess-ai-demo";
    try {
      const res = await interviewApi.processTurn(
        sessId,
        "[Candidate asks for clarification on the last architectural point.]"
      );
      const text = res.ai_response || "Certainly. Let me clarify the architectural requirements.";
      setActiveQuestionPrompt(text);
      setTranscripts((prev) => [
        ...prev,
        {
          id: `t-clarify-${Date.now()}`,
          speaker: "ai",
          text,
          isFollowUp: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      speakAIText(text, () => {
        setState("LISTENING");
        startMicrophone();
      });
    } catch (err) {
      console.error(err);
      setState("LISTENING");
    }
  }, [actualSessionId, speakAIText, stopMicrophone, startMicrophone]);

  const endInterview = useCallback(async () => {
    stopMicrophone();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("AI_PROCESSING");
    playAudioCue("end");
    const sessId = actualSessionId || initialSessionId || "sess-ai-demo";
    try {
      await interviewApi.completeSession(sessId);
    } catch (err) {
      console.warn("[RUNTIME] End interview notice:", err);
    }
    setState("INTERVIEW_COMPLETE");
  }, [actualSessionId, initialSessionId, stopMicrophone]);

  const skipQuestion = useCallback(() => {
    finishCandidateAnswer("I am not familiar with this specific topic, let's proceed to the next question.");
  }, [finishCandidateAnswer]);

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
    setIsMicMuted,
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
  };
}

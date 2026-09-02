import React, { useRef, useEffect, useState, useCallback } from "react";
import { Bot, Sparkles, Mic, MicOff, Brain, CameraOff, Volume2 } from "lucide-react";
import { type InterviewState, type RecruiterPersona } from "@/types/interviewEngine";
import { faceSenseApi } from "@/services/faceSenseApi";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface VoiceMeetGridProps {
  state: InterviewState;
  persona: RecruiterPersona;
  currentQuestionText: string;
  category: string;
  micMuted: boolean;
  micVolume: number;
  sessionId?: string | undefined;
  currentQuestionId?: string | undefined;
  isSpeakingAi?: boolean;
  onRepeatAudio?: () => void;
  onInterrupt?: () => void;
}

export const VoiceMeetGrid: React.FC<VoiceMeetGridProps> = ({
  state,
  persona,
  currentQuestionText,
  category,
  micMuted,
  micVolume,
  sessionId,
  currentQuestionId,
  isSpeakingAi = false,
  onRepeatAudio,
  onInterrupt,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const elapsedRef = useRef(0);
  const blinkCountRef = useRef(0);
  const wasBlinkingRef = useRef(false);

  // Initialize Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: { ideal: 30 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
          setCameraError(null);
        }
      } catch {
        setCameraError("Camera access unavailable.");
        setStreamActive(false);
      }
    };
    void startCam();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Initialize MediaPipe Tasks Vision FaceLandmarker
  useEffect(() => {
    let active = true;
    async function initMediapipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm"
        );
        if (!active) return;
        const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (active) landmarkerRef.current = fl;
      } catch (err) {
        try {
          const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm"
          );
          if (!active) return;
          const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "CPU",
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: "VIDEO",
            numFaces: 1,
          });
          if (active) landmarkerRef.current = fl;
        } catch (cpuErr) {
          console.warn("FaceLandmarker CPU fallback notice:", cpuErr);
        }
      }
    }
    void initMediapipe();
    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Real-time Silent FaceSense Telemetry Loop (every 1 second)
  const processFaceSenseFrame = useCallback(async () => {
    if (!streamActive || document.hidden || !videoRef.current || !landmarkerRef.current) return;
    if (state === "INTERVIEW_COMPLETE") return;

    elapsedRef.current += 1;
    const timeSec = elapsedRef.current;

    let faceVisible = false;
    let pitch = 0,
      yaw = 0,
      roll = 0;
    let smilePct = 0;
    let eyeContact = 90;

    try {
      const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0]?.categories || [];
        faceVisible = true;

        const smileLeft = blendshapes.find((b) => b.categoryName === "mouthSmileLeft")?.score || 0;
        const smileRight = blendshapes.find((b) => b.categoryName === "mouthSmileRight")?.score || 0;
        smilePct = ((smileLeft + smileRight) / 2) * 100;

        const blinkLeft = blendshapes.find((b) => b.categoryName === "eyeBlinkLeft")?.score || 0;
        const blinkRight = blendshapes.find((b) => b.categoryName === "eyeBlinkRight")?.score || 0;
        const isBlinkingNow = blinkLeft > 0.4 || blinkRight > 0.4;
        if (isBlinkingNow && !wasBlinkingRef.current) {
          blinkCountRef.current += 1;
        }
        wasBlinkingRef.current = isBlinkingNow;

        const lookDown = blendshapes.find((b) => b.categoryName === "eyeLookDownLeft")?.score || 0;
        const lookOut = blendshapes.find((b) => b.categoryName === "eyeLookOutLeft")?.score || 0;
        if (lookDown > 0.5 || lookOut > 0.5) {
          eyeContact = 65;
        }
      }

      if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
        const matrix = results.facialTransformationMatrixes[0]?.data || [];
        if (matrix.length >= 16) {
          pitch = Math.asin(Math.max(-1, Math.min(1, matrix[6] ?? 0))) * (180 / Math.PI);
          yaw = Math.atan2(matrix[2] ?? 0, matrix[10] ?? 1) * (180 / Math.PI);
          roll = Math.atan2(matrix[4] ?? 0, matrix[5] ?? 1) * (180 / Math.PI);
        }
      }

      const elapsedMin = Math.max(1, timeSec / 60);
      const bpm = Math.round(blinkCountRef.current / elapsedMin);
      const emotion = smilePct > 25 ? "Happy" : Math.abs(pitch) > 15 ? "Focused" : "Neutral";

      if (sessionId) {
        await faceSenseApi.sendMetricsBatch({
          session_id: sessionId,
          question_id: currentQuestionId,
          timestamp_sec: timeSec,
          pitch: Number(pitch.toFixed(1)),
          yaw: Number(yaw.toFixed(1)),
          roll: Number(roll.toFixed(1)),
          face_visible: faceVisible,
          eye_contact_score: eyeContact,
          blink_rate_bpm: Math.min(bpm, 60),
          smile_pct: Number(smilePct.toFixed(1)),
          emotion_label: emotion,
          emotion_confidence: 0.9,
          direction_status: Math.abs(yaw) > 20 ? "SIDE" : "CENTER",
          head_stability_score: Math.max(50, 100 - Math.abs(yaw) - Math.abs(pitch)),
          attention_score: eyeContact,
          presence_score: faceVisible ? 98 : 0,
          confidence_score: 88,
          stress_score: 15,
          overall_facescore: faceVisible ? 90 : 20,
        } as any);
      }
    } catch {
      // Silent telemetry dispatch
    }
  }, [sessionId, currentQuestionId, state, streamActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      void processFaceSenseFrame();
    }, 1000);
    return () => clearInterval(interval);
  }, [processFaceSenseFrame]);

  const isAiSpeaking =
    isSpeakingAi || state === "INTRODUCTION" || state === "QUESTION" || state === "FOLLOW_UP";
  const isAiThinking =
    state === "THINKING" || state === "TRANSCRIBING" || state === "FOLLOW_UP_DECISION";

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
      {/* 50% LEFT: AI Recruiter Tile */}
      <div className="relative min-h-[320px] sm:min-h-[360px] rounded-3xl bg-gradient-to-b from-[#111625] via-[#0b0e18] to-[#07090f] border border-gold-400/25 p-6 flex flex-col justify-between shadow-2xl overflow-hidden group">
        {/* Top category & FSM state pill */}
        <div className="flex items-center justify-between z-10">
          <span className="px-3 py-1 rounded-xl bg-gold-400/10 border border-gold-400/30 text-gold-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            <span>{category}</span>
          </span>

          <div className="flex items-center gap-2">
            {isAiSpeaking && onInterrupt && (
              <button
                onClick={onInterrupt}
                className="px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/60 text-amber-300 font-mono text-[10px] font-bold uppercase transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 animate-pulse"
                title="Interrupt Alex to begin answering"
              >
                <span>✋ Interrupt & Speak</span>
              </button>
            )}
            <span
              className={`px-3.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border transition-all ${
                isAiSpeaking
                  ? "bg-gold-400/20 text-gold-300 border-gold-400/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse"
                  : isAiThinking
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "bg-emerald-500/15 text-[#39FF88] border-emerald-500/40"
              }`}
            >
              {isAiSpeaking ? "Alex Speaking" : isAiThinking ? "Alex Thinking" : "Alex Listening"}
            </span>
          </div>
        </div>

        {/* Center Recruiter Avatar */}
        <div className="relative flex flex-col items-center justify-center gap-3 my-auto py-2">
          <div className="relative flex items-center justify-center">
            {isAiSpeaking && (
              <>
                <div className="absolute inset-0 h-32 w-32 rounded-full border-2 border-gold-400/40 animate-ping" />
                <div className="absolute inset-0 h-36 w-36 rounded-full border border-gold-400/20 animate-pulse" />
              </>
            )}
            <div
              className={`h-24 w-24 rounded-full border-2 flex items-center justify-center shadow-xl transition-all duration-300 ${
                isAiSpeaking
                  ? "bg-gradient-to-tr from-gold-500/30 via-amber-500/20 to-purple-500/20 border-gold-400 shadow-[0_0_30px_rgba(234,179,8,0.35)] scale-105"
                  : isAiThinking
                  ? "bg-purple-500/20 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.35)]"
                  : "bg-white/5 border-white/20 hover:border-[#39FF88]/40"
              }`}
            >
              {isAiThinking ? (
                <Brain className="h-10 w-10 text-purple-400 animate-spin" />
              ) : (
                <Bot className={`h-10 w-10 ${isAiSpeaking ? "text-gold-300 animate-bounce" : "text-gold-400"}`} />
              )}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
              <span>{persona.name}</span>
              <span className="text-neutral-400 font-normal">({persona.role})</span>
            </h3>
            <span className="text-[11px] text-gold-300 font-mono font-semibold">{persona.company}</span>
          </div>
        </div>

        {/* Current Question Text Box overlay */}
        <div className="p-4 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-md flex flex-col gap-1.5 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">
              Active Question from Alex
            </span>
            <div className="flex items-center gap-2">
              {isAiSpeaking && onInterrupt && (
                <button
                  onClick={onInterrupt}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Stop Alex from speaking and answer immediately"
                >
                  <span>✋ Answer Now</span>
                </button>
              )}
              {onRepeatAudio && (
                <button
                  onClick={onRepeatAudio}
                  className="px-2 py-0.5 rounded-lg bg-gold-400/10 hover:bg-gold-400/20 border border-gold-400/30 text-gold-300 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                  title="Listen to Alex speak this question again"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Hear Voice</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-100 font-sans leading-relaxed font-medium">
            "{currentQuestionText}"
          </p>
        </div>

        {/* ERROR Overlay */}
        {state === "ERROR" && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center border border-rose-500/50 rounded-3xl animate-in fade-in">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-3">
              <span className="text-rose-400 text-xl font-bold">!</span>
            </div>
            <h3 className="text-white font-bold text-base">Recruiter AI Connection Paused</h3>
            <p className="text-rose-300/80 text-xs mt-1 max-w-xs">
              Click 'Retry Turn' below to re-establish the connection.
            </p>
          </div>
        )}
      </div>

      {/* 50% RIGHT: Candidate Camera Tile with Live Feed & Silent FaceSense */}
      <div className="relative min-h-[320px] sm:min-h-[360px] rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            streamActive ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

        {!streamActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400 p-4 text-center z-10">
            <CameraOff className="h-8 w-8 text-neutral-500" />
            <span className="text-xs font-medium">
              {cameraError || "Initializing webcam stream..."}
            </span>
          </div>
        )}

        {/* Top bar over video */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>REC • 1080p HD</span>
          </div>
          <span className="text-xs font-mono text-neutral-200 bg-black/60 px-2.5 py-0.5 rounded-lg border border-white/15">
            You (Candidate)
          </span>
        </div>

        {/* Bottom mic volume meter over video */}
        <div className="relative z-10 flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-200">
            {micMuted ? (
              <MicOff className="h-4 w-4 text-rose-400" />
            ) : (
              <Mic className="h-4 w-4 text-[#39FF88] animate-pulse" />
            )}
            <span className="font-semibold">
              {micMuted ? "Microphone Muted" : micVolume > 15 ? "Hearing Your Voice..." : "Microphone Active"}
            </span>
          </div>

          {!micMuted && (
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-24 sm:w-32 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#39FF88] rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(57,255,136,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(8, micVolume))}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#39FF88] font-bold w-6 text-right">
                {Math.round(micVolume)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMeetGrid;

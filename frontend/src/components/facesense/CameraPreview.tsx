import React, { useEffect, useRef, useState, useCallback } from "react";
import { CameraOff } from "lucide-react";
import { faceSenseApi, type FaceSenseMetricSample } from "@/services/faceSenseApi";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export interface CameraPreviewProps {
  sessionId: string;
  currentQuestionId?: string | undefined;
  isPaused?: boolean | undefined;
  onMetricsUpdate?: ((metrics: FaceSenseMetricSample) => void) | undefined;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  sessionId: _sessionId,
  currentQuestionId,
  isPaused = false,
  onMetricsUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const elapsedRef = useRef(0);
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const blinkCountRef = useRef(0);
  const wasBlinkingRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: { ideal: 30 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
        }
      } catch {
        setCameraError("Camera access disabled or unavailable.");
        setStreamActive(false);
      }
    };

    void startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    async function initMediapipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm"
        );
        const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        setLandmarker(fl);
      } catch (err) {
        console.error("Failed to init FaceLandmarker", err);
      }
    }
    void initMediapipe();
  }, []);

  const processMetrics = useCallback(async () => {
    if (isPaused || !streamActive || document.hidden || !videoRef.current || !landmarker) return;

    elapsedRef.current += 1;
    const timeSec = elapsedRef.current;
    
    let faceVisible = false;
    let pitch = 0, yaw = 0, roll = 0;
    let smilePct = 0;
    let eyeContact = 85;
    
    const results = landmarker.detectForVideo(videoRef.current, performance.now());
    
    if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
      const blendshapes = results.faceBlendshapes[0]?.categories || [];
      faceVisible = true;
      
      const smileLeft = blendshapes.find(b => b.categoryName === "mouthSmileLeft")?.score || 0;
      const smileRight = blendshapes.find(b => b.categoryName === "mouthSmileRight")?.score || 0;
      smilePct = ((smileLeft + smileRight) / 2) * 100;
      
      const blinkLeft = blendshapes.find(b => b.categoryName === "eyeBlinkLeft")?.score || 0;
      const blinkRight = blendshapes.find(b => b.categoryName === "eyeBlinkRight")?.score || 0;
      const blinkScore = (blinkLeft + blinkRight) / 2;
      
      if (blinkScore > 0.4) {
        if (!wasBlinkingRef.current) {
          blinkCountRef.current += 1;
          wasBlinkingRef.current = true;
        }
      } else {
        wasBlinkingRef.current = false;
      }
      
      const lookUp = blendshapes.find(b => b.categoryName === "eyeLookUpLeft")?.score || 0;
      const lookDown = blendshapes.find(b => b.categoryName === "eyeLookDownLeft")?.score || 0;
      const lookOut = blendshapes.find(b => b.categoryName === "eyeLookOutLeft")?.score || 0;
      const lookIn = blendshapes.find(b => b.categoryName === "eyeLookInLeft")?.score || 0;
      
      if (lookUp > 0.4 || lookDown > 0.4 || lookOut > 0.4 || lookIn > 0.4) {
        eyeContact = 50;
      } else {
        eyeContact = 95;
      }
      
      if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
        const matrix = results.facialTransformationMatrixes[0]?.data;
        if (matrix && matrix.length >= 11) {
          const m6 = matrix[6] ?? 0;
          const m10 = matrix[10] ?? 0;
          const m2 = matrix[2] ?? 0;
          const m1 = matrix[1] ?? 0;
          const m0 = matrix[0] ?? 0;
          pitch = Math.atan2(m6, m10) * (180/Math.PI);
          yaw = Math.atan2(-m2, Math.sqrt(m6*m6 + m10*m10)) * (180/Math.PI);
          roll = Math.atan2(m1, m0) * (180/Math.PI);
        }
      }
    }

    const emotion = smilePct > 40 ? "Happy" : (faceVisible ? "Neutral" : "Unknown");
    const bpm = Math.round((blinkCountRef.current / (timeSec / 60)) || 15);
    
    try {
      const metrics = await faceSenseApi.sendMetricsBatch({
        question_id: currentQuestionId,
        timestamp_sec: timeSec,
        pitch: pitch,
        yaw: yaw,
        roll: roll,
        face_visible: faceVisible,
        eye_contact_score: eyeContact,
        blink_rate_bpm: Math.min(bpm, 60),
        smile_pct: smilePct,
        emotion_label: emotion,
        emotion_confidence: 0.88,
        direction_status: "CENTER",
        head_stability_score: 90,
        attention_score: 92,
        presence_score: 95,
        confidence_score: 88,
        stress_score: 15,
        overall_facescore: 90,
      });

      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }
    } catch (err) {
      console.warn("FaceSense metric sync warning:", err);
    }
  }, [currentQuestionId, isPaused, streamActive, onMetricsUpdate, landmarker]);

  useEffect(() => {
    const interval = setInterval(() => {
      void processMetrics();
    }, 1000);

    return () => clearInterval(interval);
  }, [processMetrics]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-lg aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          streamActive ? "opacity-100" : "opacity-0 absolute"
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {!streamActive && (
        <div className="flex flex-col items-center gap-2 text-neutral-400 p-4 text-center">
          <CameraOff className="h-8 w-8 text-neutral-500" />
          <span className="text-xs font-medium">
            {cameraError || "Initializing webcam feed..."}
          </span>
        </div>
      )}

      {streamActive && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>FACESENSE LIVE</span>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;

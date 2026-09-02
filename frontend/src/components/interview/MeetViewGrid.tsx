import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Camera, Bot, Sparkles, Volume2 } from "lucide-react";

interface MeetViewGridProps {
  aiSpeaking: boolean;
  micMuted: boolean;
  cameraActive: boolean;
  aiQuestionCategory: string;
}

export const MeetViewGrid: React.FC<MeetViewGridProps> = ({
  aiSpeaking,
  micMuted,
  cameraActive,
  aiQuestionCategory,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        // Camera unavailable fallback
      }
    };
    void startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Tile 1: AI Recruiter Tile */}
      <div className="relative h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-[#111625] to-[#0a0d16] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 shadow-2xl group">
        <div className="relative flex items-center justify-center">
          {/* Animated audio wave rings when speaking */}
          {aiSpeaking && (
            <div className="absolute inset-0 h-28 w-28 rounded-full border-2 border-gold-400/40 animate-ping" />
          )}
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-gold-500/20 via-cyan-500/20 to-purple-500/20 border-2 border-gold-400/50 flex items-center justify-center shadow-lg shadow-gold-500/10">
            <Bot className="h-12 w-12 text-gold-400" />
          </div>
        </div>

        {/* AI Name Label */}
        <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-white">
          <Sparkles className="h-3.5 w-3.5 text-gold-400" />
          <span>Alex • Lead AI Recruiter</span>
          {aiSpeaking && (
            <span className="flex items-center gap-1 text-[10px] text-gold-300 font-bold">
              <Volume2 className="h-3 w-3 animate-pulse text-gold-400" /> Speaking
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">
          {aiQuestionCategory}
        </div>
      </div>

      {/* Tile 2: Candidate Video Tile */}
      <div className="relative h-64 sm:h-72 rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {!cameraActive && (
          <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-2 text-neutral-500">
            <Camera className="h-8 w-8" />
            <span className="text-xs font-mono">Camera Paused</span>
          </div>
        )}

        {/* Candidate Label */}
        <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-white">
          <span>You (Candidate)</span>
          {micMuted ? (
            <MicOff className="h-3.5 w-3.5 text-rose-400" />
          ) : (
            <Mic className="h-3.5 w-3.5 text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetViewGrid;

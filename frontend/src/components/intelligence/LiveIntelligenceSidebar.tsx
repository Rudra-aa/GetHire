import React from "react";
import { Camera, Mic, ShieldCheck, Wifi, Eye, Sparkles } from "lucide-react";
import { type FaceSenseMetricSample } from "@/services/faceSenseApi";

interface LiveIntelligenceSidebarProps {
  integrityScore?: number | undefined;
  cameraConnected?: boolean | undefined;
  micConnected?: boolean | undefined;
  micVolume?: number | undefined;
  faceMetrics?: FaceSenseMetricSample | null | undefined;
  fps?: number | undefined;
  latencyMs?: number | undefined;
  recentEvents?: Array<{ title: string; timestamp_sec: number; severity: string }> | undefined;
}

export const LiveIntelligenceSidebar: React.FC<LiveIntelligenceSidebarProps> = ({
  integrityScore = 100,
  cameraConnected = true,
  micConnected = true,
  micVolume = 45,
  faceMetrics,
  fps = 30,
  latencyMs = 25,
  recentEvents = [],
}) => {
  const getIntegrityBadge = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 75) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            Interview Intelligence
          </h3>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${getIntegrityBadge(integrityScore)}`}>
          Integrity: {integrityScore}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs font-mono">
          <Camera className={`h-3.5 w-3.5 ${cameraConnected ? "text-emerald-400" : "text-rose-400"}`} />
          <span className="text-neutral-300">{cameraConnected ? "Camera Active" : "Camera Lost"}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs font-mono">
          <Mic className={`h-3.5 w-3.5 ${micConnected ? "text-emerald-400" : "text-rose-400"}`} />
          <span className="text-neutral-300">{micConnected ? `Mic (${micVolume}%)` : "Mic Muted"}</span>
        </div>
      </div>

      {faceMetrics && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-400 uppercase">Face & Attention</span>
            <span className="text-emerald-400 font-bold">{faceMetrics.emotion_label} ({Math.round(faceMetrics.emotion_confidence * 100)}%)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3 w-3 text-cyan-400" />
              <span>Eye: {Math.round(faceMetrics.eye_contact_score)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Focus: {Math.round(faceMetrics.attention_score)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span>Latency: {latencyMs}ms</span>
        </div>
        <span>FPS: {fps}</span>
      </div>

      {recentEvents.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400">Recent Integrity Log</span>
          <div className="flex flex-col gap-1">
            {recentEvents.slice(-3).map((ev, idx) => (
              <div key={idx} className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-mono flex items-center justify-between">
                <span className="text-neutral-200">{ev.title}</span>
                <span className="text-neutral-500">{ev.timestamp_sec}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveIntelligenceSidebar;

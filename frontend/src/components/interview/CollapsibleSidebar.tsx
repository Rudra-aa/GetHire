import React from "react";
import { Camera, Mic, Wifi, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  micVolume: number;
  cameraOk: boolean;
  micOk: boolean;
  networkLatencyMs: number;
  questions: Array<{ id: string; question_text: string }>;
  currentIndex: number;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isOpen,
  onToggle,
  micVolume,
  cameraOk,
  micOk,
  networkLatencyMs,
  questions,
  currentIndex,
}) => {
  return (
    <aside className="relative flex">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -left-4 top-4 z-20 p-1.5 rounded-full bg-[#111625] border border-white/20 text-neutral-300 hover:text-white shadow-lg transition-all"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="w-72 p-5 rounded-3xl bg-[#0b0e17]/95 border border-white/10 backdrop-blur-xl flex flex-col gap-5 text-white font-sans shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300">
              Session & Hardware Status
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
              Live Encrypted
            </span>
          </div>

          {/* Hardware & Network */}
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-300">
                <Camera className="h-4 w-4 text-cyan-400" />
                <span>Camera</span>
              </div>
              <span className={cameraOk ? "text-emerald-400 font-bold" : "text-rose-400"}>
                {cameraOk ? "1080p 30fps" : "Offline"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2 text-xs font-mono">
              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-emerald-400" />
                  <span>Microphone</span>
                </div>
                <span className={micOk ? "text-emerald-400 font-bold" : "text-rose-400"}>
                  {micOk ? "Active" : "Muted"}
                </span>
              </div>
              {micOk && (
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, micVolume)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-300">
                <Wifi className="h-4 w-4 text-gold-400" />
                <span>Network</span>
              </div>
              <span className="text-emerald-400 font-bold">{networkLatencyMs}ms HD</span>
            </div>
          </div>

          {/* Integrity Audit Log */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono">
              <ShieldCheck className="h-4 w-4" /> Integrity Guard Active
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Fullscreen proctoring enabled. Zero violations detected.
            </p>
          </div>

          {/* Questions Progress */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300">
              Questions Checklist
            </span>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isPast = idx < currentIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                      isCurrent
                        ? "bg-gold-400/20 border-gold-400 text-white font-bold"
                        : isPast
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-white/[0.02] border-white/10 text-neutral-500"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 text-center text-[10px]">{idx + 1}</span>
                    )}
                    <span className="truncate">Question {idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default CollapsibleSidebar;

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
        className="absolute -left-4 top-4 z-20 p-1.5 rounded-full bg-white border border-[#D0DCE8] text-[#263D68] hover:text-[#1E8C5A] shadow-md transition-all cursor-pointer"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="w-72 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_16px_36px_rgba(38,61,104,0.12)] flex flex-col gap-5 text-[#263D68] font-sans animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4EDF5]">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#263D68]">
              Session & Hardware Status
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/50 text-[10px] font-mono font-bold">
              Live Encrypted
            </span>
          </div>

          {/* Hardware & Network */}
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#5A6E8C]">
                <Camera className="h-4 w-4 text-[#2B7FAD]" />
                <span>Camera</span>
              </div>
              <span className={cameraOk ? "text-[#1E8C5A] font-bold" : "text-rose-600"}>
                {cameraOk ? "1080p 30fps" : "Offline"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex flex-col gap-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[#5A6E8C]">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#1E8C5A]" />
                  <span>Microphone</span>
                </div>
                <span className={micOk ? "text-[#1E8C5A] font-bold" : "text-rose-600"}>
                  {micOk ? "Active" : "Muted"}
                </span>
              </div>
              {micOk && (
                <div className="h-1.5 w-full bg-[#E4EDF5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E8C5A] transition-all duration-150"
                    style={{ width: `${Math.min(100, micVolume)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#5A6E8C]">
                <Wifi className="h-4 w-4 text-[#2B7FAD]" />
                <span>Network</span>
              </div>
              <span className="text-[#1E8C5A] font-bold">{networkLatencyMs}ms HD</span>
            </div>
          </div>

          {/* Integrity Audit Log */}
          <div className="p-3.5 rounded-xl bg-[#F0FAF5] border border-[#A8D8C3]/50 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-[#1E8C5A] font-bold font-mono">
              <ShieldCheck className="h-4 w-4" /> Integrity Guard Active
            </div>
            <p className="text-[11px] text-[#5A6E8C] leading-snug">
              Fullscreen proctoring enabled. Zero violations detected.
            </p>
          </div>

          {/* Questions Progress */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E4EDF5]">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-[#263D68]">
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
                        ? "bg-[#B9D9EC]/30 border-[#2B7FAD] text-[#263D68] font-bold"
                        : isPast
                        ? "bg-[#F0FAF5] border-[#A8D8C3] text-[#1E8C5A]"
                        : "bg-[#FAFBFC] border-[#D0DCE8] text-[#5A6E8C]"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1E8C5A] shrink-0" />
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

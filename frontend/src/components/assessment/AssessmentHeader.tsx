import React from "react";
import { Clock, CheckSquare, ShieldCheck } from "lucide-react";

interface AssessmentHeaderProps {
  assessmentName: string;
  companyStyle: string;
  difficulty: string;
  estimatedDuration: string;
  currentIndex: number;
  totalQuestions: number;
  remainingSeconds: number;
  onExit?: () => void;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessmentName,
  companyStyle,
  difficulty,
  estimatedDuration,
  currentIndex,
  totalQuestions,
  remainingSeconds,
  onExit,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / totalQuestions) * 100));

  return (
    <header className="w-full bg-[#0d0f17]/90 border-b border-white/10 backdrop-blur-xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white font-display tracking-tight">
              {assessmentName}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
              {companyStyle}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-sans mt-0.5">
            <span className="capitalize text-emerald-400 font-medium">{difficulty} Adaptive</span>
            <span>•</span>
            <span>Est. {estimatedDuration}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-neutral-300">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Proctored Center
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress bar pill */}
        <div className="hidden sm:flex flex-col gap-1 w-44">
          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
            <span>Progress</span>
            <span className="text-cyan-300 font-bold">Q{currentIndex + 1}/{totalQuestions}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
          <Clock className="h-4 w-4 animate-pulse text-amber-400" />
          <span>{formatTime(remainingSeconds)}</span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all"
          >
            Exit Test
          </button>
        )}
      </div>
    </header>
  );
};

export default AssessmentHeader;

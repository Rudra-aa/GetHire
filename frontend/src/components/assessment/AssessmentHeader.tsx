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
    <header className="w-full bg-white/85 border-b border-[#D0DCE8]/80 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_2px_10px_rgba(38,61,104,0.03)]">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/60 text-[#1E8C5A]">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#263D68] font-display tracking-tight">
              {assessmentName}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#B9D9EC]/30 text-[#2B7FAD] border border-[#B9D9EC] text-[10px] font-mono font-semibold">
              {companyStyle}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5A6E8C] font-sans mt-0.5">
            <span className="capitalize text-[#1E8C5A] font-medium">{difficulty} Adaptive</span>
            <span>•</span>
            <span>Est. {estimatedDuration}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#263D68]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#1E8C5A]" /> Proctored Center
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress bar pill */}
        <div className="hidden sm:flex flex-col gap-1 w-44">
          <div className="flex justify-between text-[11px] font-mono text-[#5A6E8C]">
            <span>Progress</span>
            <span className="text-[#263D68] font-bold">Q{currentIndex + 1}/{totalQuestions}</span>
          </div>
          <div className="h-1.5 w-full bg-[#E4EDF5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#A8D8C3] to-[#72C9AD] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold">
          <Clock className="h-4 w-4 animate-pulse text-amber-600" />
          <span>{formatTime(remainingSeconds)}</span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-[#FAFBFC] hover:bg-[#F0F5F9] border border-[#D0DCE8] text-xs font-semibold text-[#263D68] transition-all cursor-pointer"
          >
            Exit Test
          </button>
        )}
      </div>
    </header>
  );
};

export default AssessmentHeader;

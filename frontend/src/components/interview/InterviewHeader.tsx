import React from "react";
import { Wifi, Clock, LogOut, CheckCircle } from "lucide-react";
import { GetHireLogo } from "@/components/common/GetHireLogo";

interface InterviewHeaderProps {
  companyName?: string;
  interviewRound: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  elapsedSeconds: number;
  onExit: () => void;
  onFinish?: () => void;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  interviewRound,
  currentQuestionIndex,
  totalQuestions,
  elapsedSeconds,
  onExit,
  onFinish,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="w-full bg-white/85 border-b border-[#D0DCE8]/80 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_2px_10px_rgba(38,61,104,0.03)]">
      <div className="flex items-center gap-4">
        <GetHireLogo size="sm" showText={false} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#263D68] font-display tracking-tight">
              GetHire Interview Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A] text-[10px] font-mono font-bold">
              {interviewRound}
            </span>
          </div>
          <span className="text-xs text-[#5A6E8C] font-sans">
            Question {currentQuestionIndex + 1} of {Math.max(1, totalQuestions)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Recording pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-semibold">
          <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
          <span>REC 1080p</span>
        </div>

        {/* Network status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FAF5] border border-[#A8D8C3]/60 text-[#1E8C5A] text-xs font-mono font-medium">
          <Wifi className="h-3.5 w-3.5" />
          <span>HD 120ms</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] text-[#263D68] text-xs font-mono font-bold">
          <Clock className="h-4 w-4 text-amber-600" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        {/* End & Proceed Button */}
        <button
          onClick={onFinish || onExit}
          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="End interview session and proceed to evaluation"
        >
          <CheckCircle className="h-3.5 w-3.5 text-rose-600" />
          <span>End & Evaluate</span>
        </button>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl bg-[#FAFBFC] hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68] text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
          title="Exit to Dashboard"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};

export default InterviewHeader;

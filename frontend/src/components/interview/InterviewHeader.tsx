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
    <header className="w-full bg-[#090b11]/90 border-b border-white/10 backdrop-blur-xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <GetHireLogo size="sm" showText={false} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white font-display tracking-tight">
              GetHire AI Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-[#39FF88]/30 text-[#39FF88] text-[10px] font-mono font-bold">
              {interviewRound}
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-sans">
            Question {currentQuestionIndex + 1} of {Math.max(1, totalQuestions)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Recording pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span>REC 1080p</span>
        </div>

        {/* Network status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Wifi className="h-3.5 w-3.5" />
          <span>HD 120ms</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-200 text-xs font-mono font-bold">
          <Clock className="h-4 w-4 text-gold-400" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        {/* End & Proceed Button */}
        <button
          onClick={onFinish || onExit}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="End interview session and proceed to evaluation"
        >
          <CheckCircle className="h-3.5 w-3.5 text-rose-400" />
          <span>End & Evaluate</span>
        </button>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
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

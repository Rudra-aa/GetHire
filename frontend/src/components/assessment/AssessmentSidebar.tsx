import React from "react";
import { QuestionNavigator } from "./QuestionNavigator";
import { Calculator, BookOpen, ShieldCheck } from "lucide-react";

interface AssessmentSidebarProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<string, any>;
  flagged: Record<string, boolean>;
  skipped: Record<string, boolean>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
  onOpenCalculator: () => void;
  onOpenFormulaSheet: () => void;
}

export const AssessmentSidebar: React.FC<AssessmentSidebarProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  skipped,
  questionIds,
  onSelectQuestion,
  onOpenCalculator,
  onOpenFormulaSheet,
}) => {
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== "").length;
  const flaggedCount = Object.keys(flagged).filter((k) => flagged[k]).length;
  const skippedCount = Object.keys(skipped).filter((k) => skipped[k] && answers[k] === undefined).length;

  return (
    <aside className="w-full flex flex-col gap-5">
      {/* Question Navigator Grid */}
      <QuestionNavigator
        totalQuestions={totalQuestions}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        skipped={skipped}
        questionIds={questionIds}
        onSelectQuestion={onSelectQuestion}
      />

      {/* Quick Status Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-xs flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[10px] font-mono text-[#5A6E8C]">Answered</span>
          <span className="text-sm font-bold text-[#1E8C5A] font-mono">{answeredCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-xs flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[10px] font-mono text-[#5A6E8C]">Flagged</span>
          <span className="text-sm font-bold text-[#5245A4] font-mono">{flaggedCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-xs flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[10px] font-mono text-[#5A6E8C]">Skipped</span>
          <span className="text-sm font-bold text-amber-700 font-mono">{skippedCount}</span>
        </div>
      </div>

      {/* Tools Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenCalculator}
          className="p-3 rounded-xl bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#263D68] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Calculator className="h-4 w-4 text-[#2B7FAD]" />
          <span>Calculator</span>
        </button>
        <button
          onClick={onOpenFormulaSheet}
          className="p-3 rounded-xl bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#263D68] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <BookOpen className="h-4 w-4 text-[#2B7FAD]" />
          <span>Formulas</span>
        </button>
      </div>

      {/* Section Progress */}
      <div className="p-4 rounded-2xl bg-white border border-[#D0DCE8] shadow-sm flex flex-col gap-3">
        <span className="text-xs font-bold text-[#263D68] font-display uppercase tracking-wider">
          Section Mastery
        </span>
        <div className="flex flex-col gap-2 text-[11px] font-mono">
          <div>
            <div className="flex justify-between text-[#5A6E8C] mb-1">
              <span>Data Structures & Algo</span>
              <span className="text-[#1E8C5A] font-bold">100%</span>
            </div>
            <div className="h-1 bg-[#E4EDF5] rounded-full overflow-hidden">
              <div className="h-full bg-[#A8D8C3] w-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[#5A6E8C] mb-1">
              <span>System Design & SQL</span>
              <span className="text-[#2B7FAD] font-bold">60%</span>
            </div>
            <div className="h-1 bg-[#E4EDF5] rounded-full overflow-hidden">
              <div className="h-full bg-[#B9D9EC] w-3/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Rules Info */}
      <div className="p-4 rounded-2xl bg-[#B9D9EC]/20 border border-[#B9D9EC] text-xs font-sans text-[#263D68] flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-[#2B7FAD] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Proctored session. Webcam feed and tab activity are actively monitored. Do not switch browser tabs or exit fullscreen.
        </p>
      </div>
    </aside>
  );
};

export default AssessmentSidebar;

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
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[10px] font-mono text-neutral-400">Answered</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{answeredCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[10px] font-mono text-neutral-400">Flagged</span>
          <span className="text-sm font-bold text-purple-400 font-mono">{flaggedCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[10px] font-mono text-neutral-400">Skipped</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{skippedCount}</span>
        </div>
      </div>

      {/* Tools Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenCalculator}
          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Calculator className="h-4 w-4 text-cyan-400" />
          <span>Calculator</span>
        </button>
        <button
          onClick={onOpenFormulaSheet}
          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <span>Formulas</span>
        </button>
      </div>

      {/* Section Progress */}
      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
        <span className="text-xs font-bold text-white font-display uppercase tracking-wider">
          Section Mastery
        </span>
        <div className="flex flex-col gap-2 text-[11px] font-mono">
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Data Structures & Algo</span>
              <span className="text-cyan-300 font-bold">100%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 w-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>System Design & SQL</span>
              <span className="text-cyan-300 font-bold">60%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 w-3/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Rules Info */}
      <div className="p-4 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-sans text-neutral-400 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Proctored session. Webcam feed and tab activity are actively monitored. Do not switch browser tabs or exit fullscreen.
        </p>
      </div>
    </aside>
  );
};

export default AssessmentSidebar;

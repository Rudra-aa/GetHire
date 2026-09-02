import React from "react";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<string, any>;
  flagged: Record<string, boolean>;
  skipped: Record<string, boolean>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  skipped,
  questionIds,
  onSelectQuestion,
}) => {
  return (
    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">
          Question Navigator
        </h3>
        <span className="text-[10px] font-mono text-neutral-400">20 Adaptive Qs</span>
      </div>

      {/* Grid of Q1 to Q20 */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const qid = questionIds[idx] || `q-${idx}`;
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[qid] !== undefined && answers[qid] !== null && answers[qid] !== "";
          const isFlagged = flagged[qid];
          const isSkipped = skipped[qid] && !isAnswered;

          let btnClass = "bg-white/[0.04] border-white/10 text-neutral-400 hover:bg-white/10";
          if (isCurrent) {
            btnClass = "bg-cyan-500/25 border-cyan-400 text-white font-bold ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20";
          } else if (isFlagged) {
            btnClass = "bg-purple-500/20 border-purple-500 text-purple-300 font-bold";
          } else if (isAnswered) {
            btnClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold";
          } else if (isSkipped) {
            btnClass = "bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold";
          }

          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(idx)}
              className={`h-10 rounded-xl border text-xs font-mono transition-all flex flex-col items-center justify-center relative ${btnClass}`}
              title={`Question ${idx + 1}`}
            >
              <span>Q{idx + 1}</span>
              {isFlagged && (
                <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-cyan-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-purple-400" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span>Skipped</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;

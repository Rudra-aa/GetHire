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
    <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-[0_4px_20px_-2px_rgba(38,61,104,0.05)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#263D68] font-display uppercase tracking-wider">
          Question Navigator
        </h3>
        <span className="text-[10px] font-mono text-[#5A6E8C]">20 Adaptive Qs</span>
      </div>

      {/* Grid of Q1 to Q20 */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const qid = questionIds[idx] || `q-${idx}`;
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[qid] !== undefined && answers[qid] !== null && answers[qid] !== "";
          const isFlagged = flagged[qid];
          const isSkipped = skipped[qid] && !isAnswered;

          let btnClass = "bg-[#FAFBFC] border-[#D0DCE8] text-[#5A6E8C] hover:bg-[#F0F5F9]";
          if (isCurrent) {
            btnClass = "bg-[#B9D9EC]/30 border-[#2B7FAD] text-[#263D68] font-bold ring-2 ring-[#B9D9EC]";
          } else if (isFlagged) {
            btnClass = "bg-[#DCD5F0]/40 border-[#6E5EBB] text-[#5245A4] font-bold";
          } else if (isAnswered) {
            btnClass = "bg-[#F0FAF5] border-[#1E8C5A] text-[#1E8C5A] font-bold";
          } else if (isSkipped) {
            btnClass = "bg-amber-50 border-amber-300 text-amber-800 font-bold";
          }

          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(idx)}
              className={`h-10 rounded-xl border text-xs font-mono transition-all flex flex-col items-center justify-center relative cursor-pointer ${btnClass}`}
              title={`Question ${idx + 1}`}
            >
              <span>Q{idx + 1}</span>
              {isFlagged && (
                <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#6E5EBB]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4EDF5] text-[10px] font-mono text-[#5A6E8C]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#1E8C5A]" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#2B7FAD]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#6E5EBB]" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Skipped</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;

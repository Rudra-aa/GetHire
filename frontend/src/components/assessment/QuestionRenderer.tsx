import React from "react";
import { Flag, CheckSquare, Code2 } from "lucide-react";

export interface QuestionData {
  id: string;
  category: string;
  skill: string;
  type?: "mcq" | "multiple_select" | "code_output" | "debugging" | "arrange_steps" | "fill_in_blank" | "system_design_mcq" | "sql_mcq" | "scenario_based" | undefined;
  question: string;
  code_snippet?: string | undefined;
  options: string[];
  explanation?: string | undefined;
  blank_placeholder?: string | undefined;
  steps_to_arrange?: string[] | undefined;
}

interface QuestionRendererProps {
  question: QuestionData;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: any; // index or array of indices or text
  isFlagged: boolean;
  onSelectOption: (qid: string, val: any) => void;
  onToggleFlag: (qid: string) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onSelectOption,
  onToggleFlag,
}) => {
  const type = question.type || "mcq";

  const handleMultiSelectToggle = (idx: number) => {
    const currentList: number[] = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    if (currentList.includes(idx)) {
      onSelectOption(question.id, currentList.filter((i) => i !== idx));
    } else {
      onSelectOption(question.id, [...currentList, idx]);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
      {/* Top Card Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
            Q{currentIndex + 1} of {totalQuestions}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-neutral-300 text-xs font-mono border border-white/10 capitalize">
            {question.category || "Core Engineering"}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-[11px] font-mono border border-emerald-500/20 uppercase">
            {type.replace("_", " ")}
          </span>
        </div>

        <button
          onClick={() => onToggleFlag(question.id)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
            isFlagged
              ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
              : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white"
          }`}
        >
          <Flag className={`h-3.5 w-3.5 ${isFlagged ? "fill-purple-400" : ""}`} />
          <span>{isFlagged ? "Flagged for Review" : "Flag Question"}</span>
        </button>
      </div>

      {/* Question Text */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-white font-display leading-snug">
          {question.question}
        </h2>

        {/* Code Snippet Box if present */}
        {question.code_snippet && (
          <div className="p-4 rounded-2xl bg-[#080b12] border border-white/15 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1"><Code2 className="h-3 w-3 text-cyan-400" /> Code Context</span>
              <span>UTF-8</span>
            </div>
            <pre>{question.code_snippet}</pre>
          </div>
        )}
      </div>

      {/* Render Options based on Type */}
      <div className="flex flex-col gap-3 pt-2">
        {type === "multiple_select" ? (
          /* Multi Select Checkboxes */
          <div className="grid grid-cols-1 gap-2.5">
            {question.options.map((opt, idx) => {
              const isChecked = Array.isArray(selectedAnswer) && selectedAnswer.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleMultiSelectToggle(idx)}
                  className={`p-4 rounded-2xl border text-left text-xs font-mono transition-all flex items-center gap-3 ${
                    isChecked
                      ? "bg-cyan-500/20 border-cyan-400 text-white font-bold"
                      : "bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center ${isChecked ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-white/30'}`}>
                    {isChecked && <CheckSquare className="h-3 w-3" />}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        ) : type === "fill_in_blank" ? (
          /* Fill in Blank input */
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={typeof selectedAnswer === "string" ? selectedAnswer : ""}
              onChange={(e) => onSelectOption(question.id, e.target.value)}
              placeholder={question.blank_placeholder || "Type your answer or code snippet..."}
              className="w-full p-4 rounded-2xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>
        ) : (
          /* Standard MCQ / Code Output / System Design / Debugging Radio Choice */
          <div className="grid grid-cols-1 gap-2.5">
            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectOption(question.id, idx)}
                  className={`p-4 rounded-2xl border text-left text-xs font-mono transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/10"
                      : "bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${isSelected ? 'bg-cyan-400 text-black font-bold' : 'bg-white/10 text-neutral-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionRenderer;

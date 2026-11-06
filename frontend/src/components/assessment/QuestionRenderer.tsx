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
    <div className="p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-6 shadow-[0_4px_20px_-2px_rgba(38,61,104,0.05),0_2px_6px_-1px_rgba(38,61,104,0.03)]">
      {/* Top Card Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4EDF5]">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-[#B9D9EC]/30 border border-[#B9D9EC] text-[#2B7FAD] font-mono text-xs font-bold">
            Q{currentIndex + 1} of {totalQuestions}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-[#FAFBFC] text-[#5A6E8C] text-xs font-mono border border-[#D0DCE8] capitalize">
            {question.category || "Core Engineering"}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-[#A8D8C3]/20 text-[#1E8C5A] text-[11px] font-mono border border-[#A8D8C3]/50 uppercase font-semibold">
            {type.replace("_", " ")}
          </span>
        </div>

        <button
          onClick={() => onToggleFlag(question.id)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
            isFlagged
              ? "bg-[#DCD5F0]/40 border-[#6E5EBB] text-[#5245A4] font-bold"
              : "bg-[#FAFBFC] border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68]"
          }`}
        >
          <Flag className={`h-3.5 w-3.5 ${isFlagged ? "fill-[#5245A4]" : ""}`} />
          <span>{isFlagged ? "Flagged for Review" : "Flag Question"}</span>
        </button>
      </div>

      {/* Question Text */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-[#263D68] font-display leading-snug">
          {question.question}
        </h2>

        {/* Code Snippet Box if present */}
        {question.code_snippet && (
          <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] font-mono text-xs text-[#263D68] overflow-x-auto leading-relaxed">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4EDF5] text-[10px] text-[#5A6E8C]">
              <span className="flex items-center gap-1"><Code2 className="h-3 w-3 text-[#2B7FAD]" /> Code Context</span>
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
                  className={`p-4 rounded-xl border text-left text-xs font-mono transition-all flex items-center gap-3 cursor-pointer ${
                    isChecked
                      ? "bg-[#F0FAF5] border-[#1E8C5A] text-[#263D68] font-bold shadow-sm"
                      : "bg-[#FAFBFC] border-[#D0DCE8] text-[#5A6E8C] hover:bg-[#F0F5F9] hover:text-[#263D68]"
                  }`}
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center ${isChecked ? 'bg-[#1E8C5A] border-[#1E8C5A] text-white' : 'border-[#D0DCE8] bg-white'}`}>
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
              className="w-full p-4 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] text-[#263D68] font-mono text-xs focus:outline-none focus:border-[#A8D8C3] transition-all"
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
                  className={`p-4 rounded-xl border text-left text-xs font-mono transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-[#F0FAF5] border-[#1E8C5A] text-[#263D68] font-bold shadow-sm"
                      : "bg-[#FAFBFC] border-[#D0DCE8] text-[#5A6E8C] hover:bg-[#F0F5F9] hover:text-[#263D68]"
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${isSelected ? 'bg-[#A8D8C3] text-[#1E4D38] font-bold' : 'bg-[#E4EDF5] text-[#5A6E8C]'}`}>
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

import React from "react";
import { CheckCircle2, Circle, Award, ChevronRight } from "lucide-react";
import type { InterviewQuestion, InterviewAnswer } from "@/services/interviewApi";

interface ProgressSidebarProps {
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentIndex: number;
  overallProgress: number;
  onSelectQuestion: (index: number) => void;
  targetRole?: string;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  questions,
  answers,
  currentIndex,
  overallProgress,
  onSelectQuestion,
  targetRole: _targetRole,
}) => {
  // Set of answered question IDs
  const answeredSet = new Set(
    answers.filter((a) => !a.is_draft && a.answer_text.trim().length > 0).map((a) => a.question_id)
  );

  // Collect unique skills evaluated
  const evaluatedSkills = Array.from(
    new Set(questions.map((q) => q.skill_targeted).filter(Boolean) as string[])
  );

  return (
    <aside
      className="w-full lg:w-80 flex flex-col gap-6 p-6 rounded-2xl"
      style={{
        background: "rgba(17, 17, 21, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Session Progress Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Interview Progress
          </span>
          <span className="text-xs font-black text-gold-400 font-mono">
            {overallProgress}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(5, overallProgress)}%`,
              background: "linear-gradient(90deg, #E6C37A 0%, #10B981 100%)",
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
          <span>{answeredSet.size} of {questions.length} answered</span>
          <span>{questions.length - answeredSet.size} remaining</span>
        </div>
      </div>

      {/* Question Roadmap List */}
      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
        <span className="text-xs font-semibold text-neutral-300">Question Roadmap</span>
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answeredSet.has(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                isCurrent
                  ? "bg-gold-400/15 border border-gold-400/40 text-white shadow-lg shadow-gold-400/5"
                  : isAnswered
                  ? "bg-emerald-500/5 border border-emerald-500/20 text-neutral-200 hover:bg-emerald-500/10"
                  : "bg-white/[0.02] border border-white/[0.06] text-neutral-400 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isAnswered ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-gold-400 animate-ping flex-shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                )}
                <div className="truncate">
                  <div className="text-xs font-bold leading-tight">
                    {idx + 1}. {q.category}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {q.skill_targeted || q.difficulty}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Target Skills Tested */}
      {evaluatedSkills.length > 0 && (
        <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
            <Award className="h-3.5 w-3.5 text-gold-400" />
            <span>Target Competencies</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {evaluatedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/10 text-neutral-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

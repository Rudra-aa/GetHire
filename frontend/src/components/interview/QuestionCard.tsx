import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Bookmark, Target } from "lucide-react";
import type { InterviewQuestion } from "@/services/interviewApi";

interface QuestionCardProps {
  question: InterviewQuestion;
  currentIndex: number;
  totalQuestions: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
}) => {
  const [showCriteria, setShowCriteria] = useState(false);

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case "Technical":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/25";
      case "Projects":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/25";
      case "Resume-based":
        return "bg-gold-400/10 text-gold-300 border-gold-400/25";
      case "Problem Solving":
        return "bg-purple-500/10 text-purple-300 border-purple-500/25";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/25";
    }
  };

  const getDifficultyStyle = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "hard":
        return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default:
        return "text-gold-300 bg-gold-400/10 border-gold-400/20";
    }
  };

  return (
    <div
      className="w-full rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      style={{
        background: "rgba(17, 17, 21, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Top Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-neutral-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryStyle(question.category)}`}>
            {question.category}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getDifficultyStyle(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        {question.skill_targeted && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-neutral-300">
            <Target className="h-3.5 w-3.5 text-gold-400" />
            <span>Target: <strong className="text-white">{question.skill_targeted}</strong></span>
          </div>
        )}
      </div>

      {/* Context Hook */}
      {question.context_snippet && (
        <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-gold-400/5 border border-gold-400/15 text-xs text-gold-200/90">
          <Bookmark className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gold-300">Resume Context: </span>
            <span>{question.context_snippet}</span>
          </div>
        </div>
      )}

      {/* Main Question Text */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-100 leading-relaxed font-display">
          {question.question_text}
        </h2>
      </div>

      {/* Expected Concepts Criteria Toggle */}
      {question.expected_concepts && question.expected_concepts.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setShowCriteria((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-gold-300 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            <span>Evaluation Focus Areas</span>
            {showCriteria ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
          </button>

          {showCriteria && (
            <div className="mt-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap gap-2 animate-in fade-in duration-200">
              {question.expected_concepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/10 text-neutral-300 flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {concept}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * QuestionTable.tsx
 * ─────────────────
 * Premium table showing per-question performance:
 * #, Question text, Category badge, Score, Strengths, Improvements, View action.
 */
import React, { useState } from "react";
import { Eye, ChevronUp, Cpu, MessageSquare, Target, Layers, CheckSquare } from "lucide-react";
import type { EvaluationDetail } from "@/services/evaluationApi";

interface QuestionTableProps {
  evaluations: EvaluationDetail[];
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  technical: { bg: "bg-[#F0FAF5]", text: "text-[#1E8C5A]" },
  behavioral: { bg: "bg-[#B9D9EC]/30", text: "text-[#2B7FAD]" },
  "system design": { bg: "bg-[#DCD5F0]/30", text: "text-[#5245A4]" },
  projects: { bg: "bg-amber-50", text: "text-amber-800" },
  resume: { bg: "bg-[#A8D8C3]/20", text: "text-[#1E8C5A]" },
  default: { bg: "bg-[#FAFBFC]", text: "text-[#5A6E8C]" },
};

const scoreBadge = (score: number) => {
  if (score >= 80) return "text-[#1E8C5A]";
  if (score >= 60) return "text-[#2B7FAD]";
  return "text-amber-800";
};

const dimIcons = [
  { key: "technical_accuracy" as const, Icon: Cpu, color: "#1E8C5A", label: "Tech" },
  { key: "concept_coverage" as const, Icon: Target, color: "#2B7FAD", label: "Concept" },
  { key: "problem_solving" as const, Icon: Layers, color: "#5245A4", label: "Problem" },
  { key: "communication" as const, Icon: MessageSquare, color: "#D97706", label: "Comm." },
  { key: "completeness" as const, Icon: CheckSquare, color: "#1E8C5A", label: "Complete" },
];

export const QuestionTable: React.FC<QuestionTableProps> = ({ evaluations }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#D0DCE8] shadow-sm flex flex-col gap-4">
      <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
        <span className="text-[#1E8C5A]">▌</span>
        Question-wise Performance
      </h3>

      {/* Table Header (desktop) */}
      <div className="hidden md:grid grid-cols-[2rem_1fr_auto_auto_auto_auto] gap-3 px-3 pb-2 border-b border-[#E4EDF5]">
        {["#", "Question", "Category", "Score", "Strengths", "Actions"].map((h) => (
          <span key={h} className="text-[10px] font-bold text-[#5A6E8C] uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {evaluations.map((ev, idx) => {
          const category = (ev.rubric_snapshot?.category || "technical") as string;
          const colorKey = category.toLowerCase();
          const clr = categoryColors[colorKey] ?? categoryColors.default;
          const isOpen = expanded === ev.id;
          const score = ev.overall_score;

          return (
            <div key={ev.id || idx} className="rounded-xl overflow-hidden border border-[#D0DCE8] bg-[#FAFBFC]">
              {/* Row */}
              <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] md:grid-cols-[2rem_1fr_auto_auto_auto_auto] gap-3 items-center px-3 py-3">
                {/* # */}
                <span className="h-6 w-6 rounded-full bg-white border border-[#D0DCE8] flex items-center justify-center text-[10px] font-mono font-bold text-[#5A6E8C]">
                  {idx + 1}
                </span>

                {/* Question */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs font-semibold text-[#263D68] truncate">
                    {ev.rubric_snapshot?.question_text
                      ? String(ev.rubric_snapshot.question_text).slice(0, 80) + (String(ev.rubric_snapshot.question_text).length > 80 ? "…" : "")
                      : `Interview Question #${idx + 1}`}
                  </p>
                  <span className="text-[10px] text-[#5A6E8C]">
                    Difficulty: {ev.rubric_snapshot?.difficulty || "Medium"}
                  </span>
                </div>

                {/* Category */}
                <span className={`hidden md:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${clr?.bg ?? "bg-[#FAFBFC]"} ${clr?.text ?? "text-[#5A6E8C]"}`}>
                  {category}
                </span>

                {/* Score */}
                <span className={`text-sm font-black font-mono ${scoreBadge(score)}`}>
                  {score}<span className="text-[10px] text-[#5A6E8C]">/100</span>
                </span>

                {/* Strengths (desktop) */}
                <div className="hidden md:flex items-center gap-1 text-[10px] text-[#5A6E8C] max-w-[140px]">
                  {ev.strengths.length > 0 ? (ev.strengths[0] ?? "").slice(0, 30) + ((ev.strengths[0] ?? "").length > 30 ? "…" : "") : "—"}
                </div>

                {/* Action */}
                <button
                  onClick={() => setExpanded(isOpen ? null : ev.id)}
                  className="p-1.5 rounded-lg bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68] transition-all cursor-pointer shadow-sm"
                  title="View details"
                >
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#E4EDF5] bg-white flex flex-col gap-3">
                  {/* Dimension mini-scores */}
                  <div className="grid grid-cols-5 gap-2">
                    {dimIcons.map(({ key, Icon, color, label }) => (
                      <div key={key} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#FAFBFC] border border-[#D0DCE8]">
                        <Icon className="h-3 w-3" style={{ color }} />
                        <span className="text-[10px] text-[#5A6E8C]">{label}</span>
                        <span className="text-xs font-bold text-[#263D68] font-mono">{ev.scores[key]?.score ?? "—"}</span>
                      </div>
                    ))}
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {ev.strengths.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#1E8C5A] mb-1.5 uppercase tracking-wider">Strengths</p>
                        <ul className="flex flex-col gap-1">
                          {ev.strengths.map((s, i) => (
                            <li key={i} className="text-[#5A6E8C] flex gap-1.5">
                              <span className="text-[#1E8C5A]">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {ev.weaknesses.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#FFD54A] mb-1.5 uppercase tracking-wider">Improvement Areas</p>
                        <ul className="flex flex-col gap-1">
                          {ev.weaknesses.map((w, i) => (
                            <li key={i} className="text-neutral-300 flex gap-1.5">
                              <span className="text-[#FFD54A]">△</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Follow-up */}
                  {ev.follow_up?.suggested_follow_up && (
                    <div className="p-3 rounded-xl bg-[#4DA8FF]/5 border border-[#4DA8FF]/15 text-xs">
                      <span className="text-[10px] font-bold text-[#4DA8FF] uppercase tracking-wider">Follow-up: </span>
                      <span className="text-neutral-300">"{ev.follow_up.suggested_follow_up}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

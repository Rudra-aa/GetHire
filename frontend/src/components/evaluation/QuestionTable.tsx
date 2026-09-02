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
  technical: { bg: "bg-[#39FF88]/10", text: "text-[#39FF88]" },
  behavioral: { bg: "bg-[#4DA8FF]/10", text: "text-[#4DA8FF]" },
  "system design": { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
  projects: { bg: "bg-orange-500/10", text: "text-orange-400" },
  resume: { bg: "bg-gold-400/10", text: "text-gold-400" },
  default: { bg: "bg-white/[0.05]", text: "text-neutral-300" },
};

const scoreBadge = (score: number) => {
  if (score >= 80) return "text-[#39FF88]";
  if (score >= 60) return "text-[#4DA8FF]";
  return "text-[#FFD54A]";
};

const dimIcons = [
  { key: "technical_accuracy" as const, Icon: Cpu, color: "#39FF88", label: "Tech" },
  { key: "concept_coverage" as const, Icon: Target, color: "#4DA8FF", label: "Concept" },
  { key: "problem_solving" as const, Icon: Layers, color: "#8B5CF6", label: "Problem" },
  { key: "communication" as const, Icon: MessageSquare, color: "#FFD54A", label: "Comm." },
  { key: "completeness" as const, Icon: CheckSquare, color: "#34D399", label: "Complete" },
];

export const QuestionTable: React.FC<QuestionTableProps> = ({ evaluations }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span className="text-gold-400">▌</span>
        Question-wise Performance
      </h3>

      {/* Table Header (desktop) */}
      <div className="hidden md:grid grid-cols-[2rem_1fr_auto_auto_auto_auto] gap-3 px-3 pb-2 border-b border-white/[0.06]">
        {["#", "Question", "Category", "Score", "Strengths", "Actions"].map((h) => (
          <span key={h} className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
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
            <div key={ev.id || idx} className="rounded-xl overflow-hidden border border-white/[0.05] bg-white/[0.01]">
              {/* Row */}
              <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] md:grid-cols-[2rem_1fr_auto_auto_auto_auto] gap-3 items-center px-3 py-3">
                {/* # */}
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-neutral-400">
                  {idx + 1}
                </span>

                {/* Question */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs font-semibold text-neutral-200 truncate">
                    {ev.rubric_snapshot?.question_text
                      ? String(ev.rubric_snapshot.question_text).slice(0, 80) + (String(ev.rubric_snapshot.question_text).length > 80 ? "…" : "")
                      : `Interview Question #${idx + 1}`}
                  </p>
                  <span className="text-[10px] text-neutral-500">
                    Difficulty: {ev.rubric_snapshot?.difficulty || "Medium"}
                  </span>
                </div>

                {/* Category */}
                <span className={`hidden md:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${clr?.bg ?? "bg-white/[0.05]"} ${clr?.text ?? "text-neutral-300"}`}>
                  {category}
                </span>

                {/* Score */}
                <span className={`text-sm font-black font-mono ${scoreBadge(score)}`}>
                  {score}<span className="text-[10px] text-neutral-500">/100</span>
                </span>

                {/* Strengths (desktop) */}
                <div className="hidden md:flex items-center gap-1 text-[10px] text-neutral-400 max-w-[140px]">
                  {ev.strengths.length > 0 ? (ev.strengths[0] ?? "").slice(0, 30) + ((ev.strengths[0] ?? "").length > 30 ? "…" : "") : "—"}
                </div>

                {/* Action */}
                <button
                  onClick={() => setExpanded(isOpen ? null : ev.id)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-400 hover:text-white transition-all"
                  title="View details"
                >
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] bg-black/20 flex flex-col gap-3">
                  {/* Dimension mini-scores */}
                  <div className="grid grid-cols-5 gap-2">
                    {dimIcons.map(({ key, Icon, color, label }) => (
                      <div key={key} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <Icon className="h-3 w-3" style={{ color }} />
                        <span className="text-[10px] text-neutral-400">{label}</span>
                        <span className="text-xs font-bold text-white font-mono">{ev.scores[key]?.score ?? "—"}</span>
                      </div>
                    ))}
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {ev.strengths.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#39FF88] mb-1.5 uppercase tracking-wider">Strengths</p>
                        <ul className="flex flex-col gap-1">
                          {ev.strengths.map((s, i) => (
                            <li key={i} className="text-neutral-300 flex gap-1.5">
                              <span className="text-[#39FF88]">✓</span> {s}
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

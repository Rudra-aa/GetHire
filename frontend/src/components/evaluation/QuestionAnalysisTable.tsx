/**
 * QuestionAnalysisTable.tsx
 * ──────────────────────────
 * Professional Question Analysis table matching reference design specs.
 * Includes slide-over drawer panel for detailed question breakdown on "View Details".
 * Occupies 8 columns of the 12-column grid in Row 4.
 */
import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Cpu, Target, Layers, MessageSquare, CheckSquare, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { EvaluationDetail } from "@/services/evaluationApi";

interface QuestionAnalysisTableProps {
  evaluations: EvaluationDetail[];
}

const getCategoryStyle = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes("backend") || c.includes("technical"))
    return { bg: "bg-[#DCD5F0]/30 border-[#DCD5F0]", text: "text-[#5245A4]" };
  if (c.includes("database") || c.includes("sql"))
    return { bg: "bg-[#B9D9EC]/30 border-[#B9D9EC]", text: "text-[#2B7FAD]" };
  if (c.includes("system design") || c.includes("architecture"))
    return { bg: "bg-amber-50 border-amber-200", text: "text-amber-800" };
  if (c.includes("dsa") || c.includes("algorithm"))
    return { bg: "bg-[#F0FAF5] border-[#A8D8C3]", text: "text-[#1E8C5A]" };
  return { bg: "bg-[#DCD5F0]/30 border-[#DCD5F0]", text: "text-[#5245A4]" };
};

const getDifficultyStyle = (diff: string) => {
  const d = diff.toLowerCase();
  if (d.includes("hard")) return { bg: "bg-amber-50 border-amber-200", text: "text-amber-800" };
  if (d.includes("easy")) return { bg: "bg-[#F0FAF5] border-[#A8D8C3]", text: "text-[#1E8C5A]" };
  return { bg: "bg-[#B9D9EC]/20 border-[#B9D9EC]", text: "text-[#2B7FAD]" };
};

const getStatusBadge = (score: number) => {
  if (score >= 85) return { label: "● Excellent", text: "text-[#1E8C5A]" };
  if (score >= 70) return { label: "● Good", text: "text-[#1E8C5A]" };
  if (score >= 55) return { label: "● Average", text: "text-amber-800" };
  return { label: "● Needs Work", text: "text-rose-700" };
};

const PREVIEW_COUNT = 5;

export const QuestionAnalysisTable: React.FC<QuestionAnalysisTableProps> = ({ evaluations }) => {
  const [selectedEv, setSelectedEv] = useState<EvaluationDetail | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayList = showAll ? evaluations : evaluations.slice(0, PREVIEW_COUNT);

  return (
    <>
      <GlassCard className="p-6 flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-1 rounded-full bg-[#1E8C5A]" />
            <h3 className="text-sm font-bold text-[#263D68]">Question-wise Analysis</h3>
          </div>
          <span className="text-xs text-[#5A6E8C] font-mono">
            {evaluations.length} Questions Evaluated
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#E4EDF5] text-[10px] uppercase tracking-wider font-bold text-[#5A6E8C] pb-2">
                <th className="pb-3 pl-2 w-8">#</th>
                <th className="pb-3">Question</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Difficulty</th>
                <th className="pb-3">Your Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4EDF5]">
              {displayList.map((ev, idx) => {
                const category = (ev.rubric_snapshot?.category || "Backend") as string;
                const difficulty = (ev.rubric_snapshot?.difficulty || "Medium") as string;
                const questionText = ev.rubric_snapshot?.question_text || `Question #${idx + 1}`;
                const catStyle = getCategoryStyle(category);
                const diffStyle = getDifficultyStyle(difficulty);
                const status = getStatusBadge(ev.overall_score);

                return (
                  <tr
                    key={ev.id || idx}
                    className="hover:bg-[#F0FAF5] transition-colors group text-xs"
                  >
                    {/* Index */}
                    <td className="py-3.5 pl-2 font-mono text-[#5A6E8C] font-bold">{idx + 1}</td>

                    {/* Question text */}
                    <td className="py-3.5 pr-4 max-w-[240px] truncate font-medium text-[#263D68]">
                      {questionText}
                    </td>

                    {/* Category chip */}
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catStyle.bg} ${catStyle.text}`}>
                        {category}
                      </span>
                    </td>

                    {/* Difficulty chip */}
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${diffStyle.bg} ${diffStyle.text}`}>
                        {difficulty}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 font-mono font-bold text-[#263D68]">
                      <span className={status.text}>{ev.overall_score}</span>
                      <span className="text-[10px] text-[#5A6E8C]">/100</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5">
                      <span className={`text-[11px] font-bold ${status.text}`}>
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right pr-2">
                      <button
                        onClick={() => setSelectedEv(ev)}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68] transition-all cursor-pointer shadow-sm"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Expand Button */}
        {evaluations.length > PREVIEW_COUNT && (
          <div className="pt-4 mt-2 border-t border-[#E4EDF5] flex justify-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-xs font-semibold text-[#263D68] transition-all cursor-pointer shadow-sm"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Collapse Questions List
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  View All Questions ({evaluations.length})
                </>
              )}
            </button>
          </div>
        )}
      </GlassCard>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence>
        {selectedEv && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white border-l border-[#D0DCE8] h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E4EDF5]">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1E8C5A]">
                    Question Inspection
                  </span>
                  <h3 className="text-base font-bold text-[#263D68] mt-1">
                    {selectedEv.rubric_snapshot?.question_text || "Interview Question Details"}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEv(null)}
                  className="p-1.5 rounded-lg bg-[#FAFBFC] text-[#5A6E8C] hover:text-[#263D68] border border-[#D0DCE8] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 py-6 flex flex-col gap-6">
                {/* Score Summary */}
                <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5A6E8C]">Overall Question Score</span>
                  <span className="text-2xl font-black text-[#1E8C5A] font-mono">
                    {selectedEv.overall_score} / 100
                  </span>
                </div>

                {/* Dimensional Breakdown */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-[#263D68] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#1E8C5A]" />
                    Dimensional Scores
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <DimBox Icon={Cpu} label="Technical Accuracy" score={selectedEv.scores.technical_accuracy.score} color="#1E8C5A" />
                    <DimBox Icon={Target} label="Concept Coverage" score={selectedEv.scores.concept_coverage.score} color="#2B7FAD" />
                    <DimBox Icon={Layers} label="Problem Solving" score={selectedEv.scores.problem_solving.score} color="#5245A4" />
                    <DimBox Icon={MessageSquare} label="Communication" score={selectedEv.scores.communication.score} color="#1E8C5A" />
                    <DimBox Icon={CheckSquare} label="Completeness" score={selectedEv.scores.completeness.score} color="#2B7FAD" />
                  </div>
                </div>

                {/* Strengths */}
                {selectedEv.strengths.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-[#1E8C5A]">Captured Strengths</h4>
                    {selectedEv.strengths.map((s, i) => (
                      <p key={i} className="text-xs text-[#263D68] bg-[#F0FAF5] p-2.5 rounded-xl border border-[#A8D8C3]/60">
                        ✓ {s}
                      </p>
                    ))}
                  </div>
                )}

                {/* Weaknesses */}
                {selectedEv.weaknesses.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-amber-800">Areas to Polish</h4>
                    {selectedEv.weaknesses.map((w, i) => (
                      <p key={i} className="text-xs text-[#263D68] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        ▲ {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Follow-up recommendation */}
                {selectedEv.follow_up?.suggested_follow_up && (
                  <div className="p-3.5 rounded-xl bg-[#B9D9EC]/20 border border-[#B9D9EC] text-xs">
                    <span className="text-[10px] font-bold text-[#2B7FAD] uppercase tracking-wider block mb-1">
                      Recommended Follow-up
                    </span>
                    <p className="text-[#263D68]">"{selectedEv.follow_up.suggested_follow_up}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#E4EDF5]">
                <button
                  onClick={() => setSelectedEv(null)}
                  className="w-full py-2.5 rounded-xl bg-[#FAFBFC] hover:bg-[#F0F5F9] border border-[#D0DCE8] text-xs font-bold text-[#263D68] cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const DimBox: React.FC<{ Icon: React.ElementType; label: string; score: number; color: string }> = ({
  Icon,
  label,
  score,
  color,
}) => (
  <div className="p-3 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" style={{ color }} />
      <span className="text-[10px] font-medium text-[#5A6E8C]">{label}</span>
    </div>
    <span className="text-xs font-bold text-[#263D68] font-mono">{score}</span>
  </div>
);

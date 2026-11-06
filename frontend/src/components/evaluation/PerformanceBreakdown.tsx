/**
 * PerformanceBreakdown.tsx
 * ─────────────────────────
 * 5 Metric Mini Cards grid matching reference design.
 * Occupies 8 columns of the 12-column grid in Row 2.
 */
import React from "react";
import { GlassCard } from "./GlassCard";
import { Cpu, Target, Layers, MessageSquare, CheckSquare } from "lucide-react";

interface PerformanceBreakdownProps {
  dimensions: {
    technical_accuracy: number;
    concept_coverage: number;
    problem_solving: number;
    communication: number;
    completeness: number;
  };
}

const getMetricStatus = (score: number) => {
  if (score >= 85) return { label: "Excellent", textClr: "text-[#1E8C5A]", bgClr: "bg-[#F0FAF5] border-[#A8D8C3]", barClr: "bg-[#1E8C5A]" };
  if (score >= 70) return { label: "Good", textClr: "text-[#1E8C5A]", bgClr: "bg-[#F0FAF5] border-[#A8D8C3]/60", barClr: "bg-[#1E8C5A]" };
  if (score >= 60) return { label: "Average", textClr: "text-amber-800", bgClr: "bg-amber-50 border-amber-200", barClr: "bg-amber-500" };
  return { label: "Needs Work", textClr: "text-rose-700", bgClr: "bg-rose-50 border-rose-200", barClr: "bg-rose-500" };
};

const items = [
  { key: "technical_accuracy" as const, label: "Technical Accuracy", Icon: Cpu, iconColor: "#1E8C5A" },
  { key: "concept_coverage" as const, label: "Concept Coverage", Icon: Target, iconColor: "#2B7FAD" },
  { key: "problem_solving" as const, label: "Problem Solving", Icon: Layers, iconColor: "#5245A4" },
  { key: "communication" as const, label: "Communication", Icon: MessageSquare, iconColor: "#1E8C5A" },
  { key: "completeness" as const, label: "Completeness", Icon: CheckSquare, iconColor: "#2B7FAD" },
];

export const PerformanceBreakdown: React.FC<PerformanceBreakdownProps> = ({ dimensions }) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-[#1E8C5A]" />
          Overall Performance Breakdown
        </h3>
        <span className="text-[11px] font-semibold text-[#1E8C5A] cursor-pointer hover:underline">
          View Details →
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map(({ key, label, Icon, iconColor }) => {
          const score = dimensions[key];
          const status = getMetricStatus(score);

          return (
            <div
              key={key}
              className="p-4 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 hover:border-[#A8D8C3] hover:bg-white/90 transition-all flex flex-col justify-between gap-3 group shadow-sm"
            >
              {/* Icon */}
              <div className="p-2 rounded-xl bg-white border border-[#D0DCE8] w-fit group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4" style={{ color: iconColor }} />
              </div>

              {/* Title */}
              <span className="text-[11px] font-medium text-[#5A6E8C] leading-tight">
                {label}
              </span>

              {/* Score */}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#263D68] font-mono">{score}</span>
                <span className="text-[11px] text-[#5A6E8C] font-bold">/100</span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#E4EDF5] overflow-hidden">
                <div
                  className={`h-full ${status.barClr} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>

              {/* Status Chip */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${status.bgClr} ${status.textClr} w-fit text-center`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

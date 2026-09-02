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
  if (score >= 85) return { label: "Excellent", textClr: "text-[#39FF88]", bgClr: "bg-[#39FF88]/15 border-[#39FF88]/30", barClr: "bg-[#39FF88]" };
  if (score >= 70) return { label: "Good", textClr: "text-[#39FF88]", bgClr: "bg-[#39FF88]/10 border-[#39FF88]/20", barClr: "bg-[#39FF88]" };
  if (score >= 60) return { label: "Average", textClr: "text-[#FFD54A]", bgClr: "bg-[#FFD54A]/10 border-[#FFD54A]/20", barClr: "bg-[#FFD54A]" };
  return { label: "Needs Work", textClr: "text-rose-400", bgClr: "bg-rose-500/10 border-rose-500/20", barClr: "bg-rose-500" };
};

const items = [
  { key: "technical_accuracy" as const, label: "Technical Accuracy", Icon: Cpu, iconColor: "#39FF88" },
  { key: "concept_coverage" as const, label: "Concept Coverage", Icon: Target, iconColor: "#FFD54A" },
  { key: "problem_solving" as const, label: "Problem Solving", Icon: Layers, iconColor: "#FFD54A" },
  { key: "communication" as const, label: "Communication", Icon: MessageSquare, iconColor: "#39FF88" },
  { key: "completeness" as const, label: "Completeness", Icon: CheckSquare, iconColor: "#FFD54A" },
];

export const PerformanceBreakdown: React.FC<PerformanceBreakdownProps> = ({ dimensions }) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-gold-400" />
          Overall Performance Breakdown
        </h3>
        <span className="text-[11px] font-semibold text-[#39FF88] cursor-pointer hover:underline">
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
              className="p-4 rounded-2xl bg-black/20 border border-white/10 hover:border-white/20 hover:bg-black/30 backdrop-blur-md transition-all flex flex-col justify-between gap-3 group"
            >
              {/* Icon */}
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4" style={{ color: iconColor }} />
              </div>

              {/* Title */}
              <span className="text-[11px] font-medium text-neutral-400 leading-tight">
                {label}
              </span>

              {/* Score */}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono">{score}</span>
                <span className="text-[11px] text-neutral-500 font-bold">/100</span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
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

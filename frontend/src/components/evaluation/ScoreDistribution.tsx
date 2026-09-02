/**
 * ScoreDistribution.tsx
 * ──────────────────────
 * Donut chart showing distribution of scores into 4 brackets:
 * Excellent (80-100), Good (60-79), Average (40-59), Needs Work (<40).
 * Matches exact reference screenshot specs. Occupies 4 columns in Row 3.
 */
import React from "react";
import { GlassCard } from "./GlassCard";
import type { EvaluationDetail } from "@/services/evaluationApi";

interface ScoreDistributionProps {
  evaluations: EvaluationDetail[];
  overallScore: number;
}

export const ScoreDistribution: React.FC<ScoreDistributionProps> = ({
  evaluations,
  overallScore,
}) => {
  const scores =
    evaluations.length > 0
      ? evaluations.map((e) => e.overall_score)
      : [85, 90, 75, 78, 65, 68, 70, 55, 50, 35];

  const total = scores.length;
  const excellentCount = scores.filter((s) => s >= 80).length;
  const goodCount = scores.filter((s) => s >= 60 && s < 80).length;
  const averageCount = scores.filter((s) => s >= 40 && s < 60).length;
  const needsWorkCount = scores.filter((s) => s < 40).length;

  const categories = [
    { label: "Excellent (80-100)", count: excellentCount, color: "#39FF88" },
    { label: "Good (60-79)", count: goodCount, color: "#4DA8FF" },
    { label: "Average (40-59)", count: averageCount, color: "#FFD54A" },
    { label: "Needs Work (<40)", count: needsWorkCount, color: "#F87171" },
  ];

  // SVG Donut Chart Calculation
  const R = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * R;

  let cumulativeOffset = 0;
  const segments = categories.map((cat) => {
    const fraction = total > 0 ? cat.count / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += fraction * circumference;
    return { ...cat, strokeDasharray, strokeDashoffset };
  });

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-gold-400" />
        <h3 className="text-sm font-bold text-white">Score Distribution</h3>
      </div>

      {/* Donut Chart & Legend Grid */}
      <div className="flex items-center justify-between gap-4 flex-1 my-auto">
        {/* Donut */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="65"
                cy="65"
                r={R}
                fill="none"
                stroke={seg.count > 0 ? seg.color : "transparent"}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="transition-all duration-700"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white font-mono leading-none">
              {total}
            </span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1">
          {categories.map((cat, i) => {
            const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[11px] text-neutral-300 font-medium truncate">
                    {cat.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white shrink-0 ml-2">
                  {cat.count} <span className="text-neutral-500 font-normal">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] text-center">
        <span className="text-xs text-neutral-400 font-sans">
          Your average score is <strong className="text-[#39FF88] font-mono">{overallScore}/100</strong>
        </span>
      </div>
    </GlassCard>
  );
};

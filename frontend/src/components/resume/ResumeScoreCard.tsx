import React from "react";
import { CheckCircle2, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import type { QualityScoreBreakdown } from "@/services/resumeApi";

interface ResumeScoreCardProps {
  score: QualityScoreBreakdown;
}

export const ResumeScoreCard: React.FC<ResumeScoreCardProps> = ({ score }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.overall_score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "#28D67B"; // Emerald
    if (val >= 65) return "#E6C37A"; // Gold
    return "#F59E0B"; // Amber
  };

  const ringColor = getScoreColor(score.overall_score);

  return (
    <div
      className="w-full rounded-2xl p-6 flex flex-col gap-6"
      style={{
        background: "rgba(17, 17, 21, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Top Header & Radial Gauge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Radial SVG Gauge */}
          <div className="relative flex items-center justify-center h-24 w-24 flex-shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={ringColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-neutral-100">{score.overall_score}</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">/100</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/25 w-fit mx-auto sm:mx-0">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-300" />
              <span className="text-[11px] font-bold text-gold-300 uppercase tracking-wider">AI Quality Score</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-100">
              {score.overall_score >= 80 ? "Interview-Ready Resume" : score.overall_score >= 65 ? "Solid Foundation" : "Needs Optimization"}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              Comprehensive evaluation based on impact metrics, skill breadth, and ATS readability.
            </p>
          </div>
        </div>

        {/* 4 Dimension Mini Bars */}
        <div className="grid grid-cols-2 gap-3 w-full sm:w-64">
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">Completeness</span>
              <span className="font-semibold text-neutral-200">{score.completeness_score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${score.completeness_score}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">Skills Depth</span>
              <span className="font-semibold text-neutral-200">{score.skills_score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold-400" style={{ width: `${score.skills_score}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">Impact Metrics</span>
              <span className="font-semibold text-neutral-200">{score.impact_score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${score.impact_score}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">Structure</span>
              <span className="font-semibold text-neutral-200">{score.structure_score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold-400" style={{ width: `${score.structure_score}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
        {/* Strengths */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Key Strengths</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {score.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gold-300 uppercase tracking-wider">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Recommended Improvements</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {score.improvements.map((imp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                <div className="h-1.5 w-1.5 rounded-full bg-gold-400 flex-shrink-0 mt-1.5" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

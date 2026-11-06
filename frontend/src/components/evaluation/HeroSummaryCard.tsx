/**
 * HeroSummaryCard.tsx
 * ───────────────────
 * Top Hero KPI Summary Card matching exact reference specs:
 * Large circular score gauge, verdict badge, summary, status pills, and right-hand metadata grid.
 */
import React from "react";
import { GlassCard } from "./GlassCard";
import { Briefcase, Hash, Calendar, Timer, Bot, User } from "lucide-react";

interface HeroSummaryCardProps {
  overallScore: number;
  totalEvaluated: number;
  sessionId: string;
  candidateName?: string;
  targetRole?: string;
}

const getVerdictInfo = (score: number) => {
  if (score >= 88) {
    return {
      title: "Strong Performance",
      color: "text-[#1E8C5A]",
      bg: "bg-[#F0FAF5] border-[#A8D8C3]",
      gaugeColor: "#1E8C5A",
      glow: "shadow-sm",
    };
  }
  if (score >= 70) {
    return {
      title: "Good Performance",
      color: "text-[#2B7FAD]",
      bg: "bg-[#B9D9EC]/20 border-[#B9D9EC]",
      gaugeColor: "#2B7FAD",
      glow: "shadow-sm",
    };
  }
  if (score >= 55) {
    return {
      title: "Average Performance",
      color: "text-amber-800",
      bg: "bg-amber-50 border-amber-200",
      gaugeColor: "#D97706",
      glow: "shadow-sm",
    };
  }
  return {
    title: "Needs Polish",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    gaugeColor: "#E11D48",
    glow: "shadow-sm",
  };
};

export const HeroSummaryCard: React.FC<HeroSummaryCardProps> = ({
  overallScore,
  totalEvaluated,
  sessionId,
  candidateName = "Candidate",
  targetRole = "Senior Full-Stack Engineer",
}) => {
  const verdict = getVerdictInfo(overallScore);
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const displaySessionId = sessionId.length > 20 ? `INT-${sessionId.slice(-14)}` : sessionId;

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left: Gauge + Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
          {/* Circular Score Gauge */}
          <div className={`relative flex-shrink-0 rounded-full ${verdict.glow}`}>
            <svg width="130" height="130" viewBox="0 0 120 120" className="-rotate-90">
              <circle
                cx="60" cy="60" r="48"
                fill="none" stroke="#E4EDF5" strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="48"
                fill="none" stroke={verdict.gaugeColor} strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 301.59} 301.59`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-[#263D68] font-mono leading-none tracking-tight">
                {overallScore}
              </span>
              <span className="text-[11px] text-[#5A6E8C] font-bold uppercase mt-0.5 tracking-wider">
                /100
              </span>
            </div>
          </div>

          {/* AI Summary Content */}
          <div className="flex flex-col gap-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${verdict.bg} ${verdict.color} flex items-center gap-1.5`}>
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                {verdict.title}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#5A6E8C] leading-relaxed font-sans">
              You demonstrated solid understanding of concepts with clear explanations. Focus on strengthening problem-solving approach and code optimization.
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[11px] font-semibold text-[#1E8C5A] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A]" />
                Consistent
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#DCD5F0]/30 border border-[#DCD5F0] text-[11px] font-semibold text-[#5245A4] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5245A4]" />
                Engaged
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#B9D9EC]/30 border border-[#B9D9EC] text-[11px] font-semibold text-[#2B7FAD] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2B7FAD]" />
                On Track
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Metadata Grid (2 cols x 3 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-[#E4EDF5]">
          <MetaTile Icon={User} label="Candidate" value={candidateName} />
          <MetaTile Icon={Briefcase} label="Interview" value={targetRole} />
          <MetaTile Icon={Hash} label="Session ID" value={displaySessionId} mono />
          <MetaTile Icon={Calendar} label="Date" value={`${formattedDate} • ${formattedTime}`} />
          <MetaTile Icon={Timer} label="Questions" value={`${totalEvaluated}/12 Answered`} />
          <MetaTile Icon={Bot} label="Evaluator" value="Evaluation Engine" />
        </div>
      </div>
    </GlassCard>
  );
};

const MetaTile: React.FC<{
  Icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}> = ({ Icon, label, value, mono }) => (
  <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex items-center gap-3 shadow-sm">
    <div className="p-2 rounded-lg bg-white border border-[#D0DCE8] text-[#2B7FAD] shrink-0">
      <Icon className="h-4 w-4 text-[#2B7FAD]" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6E8C]">
        {label}
      </span>
      <span className={`text-xs font-bold text-[#263D68] truncate ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  </div>
);

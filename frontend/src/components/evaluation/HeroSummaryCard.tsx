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
      color: "text-[#39FF88]",
      bg: "bg-[#39FF88]/10 border-[#39FF88]/30",
      gaugeColor: "#39FF88",
      glow: "shadow-[0_0_35px_rgba(57,255,136,0.25)]",
    };
  }
  if (score >= 70) {
    return {
      title: "Good Performance",
      color: "text-[#FFD54A]",
      bg: "bg-[#FFD54A]/10 border-[#FFD54A]/30",
      gaugeColor: "#39FF88",
      glow: "shadow-[0_0_35px_rgba(57,255,136,0.2)]",
    };
  }
  if (score >= 55) {
    return {
      title: "Average Performance",
      color: "text-[#FFD54A]",
      bg: "bg-[#FFD54A]/10 border-[#FFD54A]/30",
      gaugeColor: "#FFD54A",
      glow: "shadow-[0_0_30px_rgba(255,213,74,0.2)]",
    };
  }
  return {
    title: "Needs Polish",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    gaugeColor: "#F87171",
    glow: "shadow-[0_0_30px_rgba(248,113,113,0.2)]",
  };
};

export const HeroSummaryCard: React.FC<HeroSummaryCardProps> = ({
  overallScore,
  totalEvaluated,
  sessionId,
  candidateName = "Rudra",
  targetRole = "Full Stack Developer",
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
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[450px] h-[250px] bg-[#39FF88]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[200px] bg-[#4DA8FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left: Gauge + Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
          {/* Circular Score Gauge */}
          <div className={`relative flex-shrink-0 rounded-full ${verdict.glow}`}>
            <svg width="130" height="130" viewBox="0 0 120 120" className="-rotate-90">
              <circle
                cx="60" cy="60" r="48"
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
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
              <span className="text-4xl font-extrabold text-white font-mono leading-none tracking-tight">
                {overallScore}
              </span>
              <span className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5 tracking-wider">
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

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              You demonstrated solid understanding of concepts with clear explanations. Focus on strengthening problem-solving approach and code optimization.
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#39FF88]/10 border border-[#39FF88]/20 text-[11px] font-semibold text-[#39FF88] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88]" />
                Consistent
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[11px] font-semibold text-[#8B5CF6] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                Engaged
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#4DA8FF]/10 border border-[#4DA8FF]/20 text-[11px] font-semibold text-[#4DA8FF] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4DA8FF]" />
                On Track
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Metadata Grid (2 cols x 3 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
          <MetaTile Icon={User} label="Candidate" value={candidateName} />
          <MetaTile Icon={Briefcase} label="Interview" value={targetRole} />
          <MetaTile Icon={Hash} label="Session ID" value={displaySessionId} mono />
          <MetaTile Icon={Calendar} label="Date" value={`${formattedDate} • ${formattedTime}`} />
          <MetaTile Icon={Timer} label="Questions" value={`${totalEvaluated}/12 Answered`} />
          <MetaTile Icon={Bot} label="Evaluator" value="AI Evaluation Engine" />
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
  <div className="p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md flex items-center gap-3">
    <div className="p-2 rounded-lg bg-white/[0.04] text-neutral-400 shrink-0">
      <Icon className="h-4 w-4 text-[#39FF88]" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
        {label}
      </span>
      <span className={`text-xs font-bold text-neutral-200 truncate ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  </div>
);

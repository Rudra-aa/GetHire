/**
 * HeroScoreCard.tsx
 * ─────────────────
 * Executive-grade top hero card: score gauge, verdict badge, session meta row.
 * Mirrors the reference design's top summary block.
 */
import React from "react";
import {
  Timer,
  Hash,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";

interface HeroScoreCardProps {
  overallScore: number;
  totalEvaluated: number;
  sessionId: string;
  targetRole?: string;
  experienceLevel?: string;
}

const getVerdict = (score: number) => {
  if (score >= 88)
    return {
      label: "Strong Performance",
      color: "text-[#1E8C5A]",
      ring: "shadow-sm",
      gaugeFg: "#1E8C5A",
      TrendIcon: TrendingUp,
    };
  if (score >= 72)
    return {
      label: "Solid Competency",
      color: "text-[#2B7FAD]",
      ring: "shadow-sm",
      gaugeFg: "#2B7FAD",
      TrendIcon: TrendingUp,
    };
  if (score >= 55)
    return {
      label: "Needs Polish",
      color: "text-amber-700",
      ring: "shadow-sm",
      gaugeFg: "#D97706",
      TrendIcon: Minus,
    };
  return {
    label: "Needs Improvement",
    color: "text-rose-600",
    ring: "shadow-sm",
    gaugeFg: "#E11D48",
    TrendIcon: TrendingDown,
  };
};

const getSummaryText = (score: number, role: string) => {
  if (score >= 88)
    return `You demonstrated exceptional understanding of ${role} concepts with clear, structured explanations and strong problem-solving depth.`;
  if (score >= 72)
    return `You showed solid understanding with clear explanations and good problem-solving skills. Focus on the improvement areas to elevate your performance further.`;
  if (score >= 55)
    return `You have a foundational grasp of the material. Several areas need deeper elaboration and stronger technical precision.`;
  return `Significant gaps were identified. Focus on strengthening core concepts, communication clarity, and structured reasoning.`;
};

const ScoreGauge: React.FC<{ score: number; color: string; ring: string }> = ({
  score,
  color,
  ring,
}) => {
  const r = 44;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const filled = (score / 100) * arcLength;

  return (
    <div className={`relative flex-shrink-0 ${ring} rounded-full`}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-[135deg]">
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#E4EDF5" strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={arcLength - filled}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-[#263D68] font-mono leading-none">{score}</span>
        <span className="text-[10px] text-[#5A6E8C] font-bold uppercase tracking-widest">/100</span>
      </div>
    </div>
  );
};

const MetaItem: React.FC<{
  Icon: React.ElementType;
  label: string;
  value: string;
  iconColor?: string;
  mono?: boolean;
}> = ({ Icon, label, value, iconColor = "text-[#5A6E8C]", mono }) => (
  <div className="flex items-center gap-2.5">
    <div className="p-2 rounded-lg bg-[#FAFBFC] border border-[#D0DCE8]">
      <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-[10px] text-[#5A6E8C] uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-xs font-bold text-[#263D68] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  </div>
);

export const HeroScoreCard: React.FC<HeroScoreCardProps> = ({
  overallScore,
  totalEvaluated,
  sessionId,
  targetRole = "Full Stack Developer",
}) => {
  const verdict = getVerdict(overallScore);
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#D0DCE8] bg-white shadow-sm">
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <ScoreGauge score={overallScore} color={verdict.gaugeFg} ring={verdict.ring} />
          <div className="flex flex-col gap-2 flex-1">
            <span className={`text-sm font-extrabold ${verdict.color} flex items-center gap-1.5`}>
              <verdict.TrendIcon className="h-4 w-4" />
              {verdict.label}
            </span>
            <p className="text-sm text-[#5A6E8C] leading-relaxed max-w-xl">
              {getSummaryText(overallScore, targetRole)}
            </p>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-[#E4EDF5] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetaItem Icon={Briefcase} label="Interview" value={targetRole} iconColor="text-[#2B7FAD]" />
          <MetaItem Icon={Hash} label="Session ID" value={`...${sessionId.slice(-8)}`} iconColor="text-[#5A6E8C]" mono />
          <MetaItem Icon={Calendar} label="Date" value={dateStr} iconColor="text-[#5A6E8C]" />
          <MetaItem Icon={Timer} label="Questions" value={`${totalEvaluated} Answered`} iconColor="text-[#1E8C5A]" />
        </div>
      </div>
    </div>
  );
};

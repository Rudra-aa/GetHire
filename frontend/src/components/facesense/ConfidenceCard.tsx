import React from "react";
import { ShieldCheck, TrendingUp } from "lucide-react";

export interface ConfidenceCardProps {
  score?: number | undefined;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({ score = 82 }) => {
  const displayScore = Math.round(score ?? 82);

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (val >= 65) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const badgeClass = getScoreColor(displayScore);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg border ${badgeClass}`}>
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
            Confidence Score
          </span>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white">{displayScore} / 100</h4>
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceCard;

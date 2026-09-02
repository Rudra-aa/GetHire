import React from "react";
import { Activity, HeartPulse } from "lucide-react";

export interface StressCardProps {
  score?: number | undefined;
  blinkRateBpm?: number | undefined;
}

export const StressCard: React.FC<StressCardProps> = ({
  score = 22,
  blinkRateBpm = 16,
}) => {
  const displayScore = Math.round(score ?? 22);

  const getStressBadge = (val: number) => {
    if (val >= 65) return "text-rose-400 border-rose-500/30 bg-rose-500/10";
    if (val >= 40) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  };

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg border ${getStressBadge(displayScore)}`}>
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
            Stress & Anxiety Index
          </span>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{displayScore}% Index</h4>
            <span className="text-[10px] font-mono text-neutral-400">
              {displayScore >= 65 ? "Elevated" : displayScore >= 40 ? "Moderate" : "Calm"}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right flex items-center gap-1.5">
        <HeartPulse className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
        <span className="text-xs font-mono font-semibold text-neutral-300">
          {Math.round(blinkRateBpm ?? 16)} bpm
        </span>
      </div>
    </div>
  );
};

export default StressCard;

import React from "react";
import { Target, AlertTriangle } from "lucide-react";

export interface AttentionCardProps {
  score?: number | undefined;
  faceVisible?: boolean | undefined;
}

export const AttentionCard: React.FC<AttentionCardProps> = ({
  score = 88,
  faceVisible = true,
}) => {
  const displayScore = Math.round(score ?? 88);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-lg border ${
            !faceVisible
              ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
              : displayScore >= 75
              ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
              : "text-amber-400 border-amber-500/30 bg-amber-500/10"
          }`}
        >
          {!faceVisible ? <AlertTriangle className="h-4 w-4" /> : <Target className="h-4 w-4" />}
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
            Attention Score
          </span>
          <h4 className="text-sm font-bold text-white">
            {faceVisible ? `${displayScore}% Focused` : "Face Not Visible"}
          </h4>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xs font-mono font-semibold text-neutral-300">
          {faceVisible ? (displayScore >= 75 ? "High Focus" : "Moderate Focus") : "Missing"}
        </span>
      </div>
    </div>
  );
};

export default AttentionCard;

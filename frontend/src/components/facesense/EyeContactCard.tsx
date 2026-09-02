import React from "react";
import { Eye, EyeOff } from "lucide-react";

export interface EyeContactCardProps {
  score?: number | undefined;
  directionStatus?: string | undefined;
  lookingAwayDuration?: number | undefined;
}

export const EyeContactCard: React.FC<EyeContactCardProps> = ({
  score = 87,
  directionStatus = "Direct Eye Contact",
  lookingAwayDuration = 0,
}) => {
  const displayScore = Math.round(score ?? 87);
  const isLookingAway = displayScore < 60 || directionStatus !== "Direct Eye Contact";

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-lg border ${
            isLookingAway
              ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
              : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
          }`}
        >
          {isLookingAway ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
            Eye Contact & Gaze
          </span>
          <h4 className="text-sm font-bold text-white capitalize">{directionStatus}</h4>
        </div>
      </div>

      <div className="text-right">
        <span className="text-sm font-mono font-bold text-emerald-400">{displayScore}%</span>
        {lookingAwayDuration && lookingAwayDuration > 0 ? (
          <p className="text-[10px] text-amber-400 font-mono">Away {lookingAwayDuration}s</p>
        ) : null}
      </div>
    </div>
  );
};

export default EyeContactCard;

import React from "react";
import { UserCheck, Maximize2 } from "lucide-react";

export interface PresenceCardProps {
  score?: number | undefined;
  framingStatus?: string | undefined;
}

export const PresenceCard: React.FC<PresenceCardProps> = ({
  score = 85,
  framingStatus = "Optimal Camera Framing",
}) => {
  const displayScore = Math.round(score ?? 85);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg border text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
          <UserCheck className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
            Presence & Framing
          </span>
          <h4 className="text-sm font-bold text-white capitalize">{framingStatus}</h4>
        </div>
      </div>

      <div className="text-right flex items-center gap-1">
        <Maximize2 className="h-3 w-3 text-indigo-400" />
        <span className="text-xs font-mono font-bold text-neutral-200">{displayScore}%</span>
      </div>
    </div>
  );
};

export default PresenceCard;

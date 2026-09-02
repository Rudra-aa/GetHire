import React from "react";
import { Smile, Meh, Frown, Flame, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

export interface EmotionCardProps {
  emotionLabel?: string | undefined;
  confidence?: number | undefined;
}

export const EmotionCard: React.FC<EmotionCardProps> = ({
  emotionLabel = "Neutral",
  confidence = 0.85,
}) => {
  const getEmotionBadge = (label: string) => {
    switch (label) {
      case "Happy":
        return { icon: Smile, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      case "Neutral":
        return { icon: Meh, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
      case "Surprise":
        return { icon: Sparkles, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
      case "Sad":
        return { icon: Frown, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" };
      case "Angry":
        return { icon: Flame, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
      case "Fear":
        return { icon: ShieldAlert, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
      default:
        return { icon: AlertCircle, color: "text-neutral-400 bg-neutral-500/10 border-neutral-500/30" };
    }
  };

  const badge = getEmotionBadge(emotionLabel);
  const Icon = badge.icon;
  const confPct = Math.round(confidence * 100);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg border ${badge.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
            Facial Expression
          </span>
          <h4 className="text-sm font-bold text-white capitalize">{emotionLabel}</h4>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-mono font-bold text-neutral-200">{confPct}%</span>
        <p className="text-[10px] text-neutral-500 font-mono">Conf</p>
      </div>
    </div>
  );
};

export default EmotionCard;

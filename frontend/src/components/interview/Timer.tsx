import React, { useEffect } from "react";
import { Clock, Pause, Play } from "lucide-react";

interface TimerProps {
  elapsedSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onTick: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  elapsedSeconds,
  isPaused,
  onTogglePause,
  onTick,
}) => {
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      onTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, onTick]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 text-gold-300">
        <Clock className={`h-4 w-4 ${!isPaused ? "animate-pulse" : ""}`} />
        <span className="font-mono text-sm font-bold tracking-wider text-white">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      <button
        onClick={onTogglePause}
        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 transition-colors"
        title={isPaused ? "Resume interview timer" : "Pause interview timer"}
      >
        {isPaused ? (
          <>
            <Play className="h-3 w-3 text-emerald-400" />
            <span>Resume</span>
          </>
        ) : (
          <>
            <Pause className="h-3 w-3 text-amber-400" />
            <span>Pause</span>
          </>
        )}
      </button>
    </div>
  );
};

import React from "react";
import { TrendingUp, Clock, Sparkles } from "lucide-react";
import { type FaceSenseMetricSample } from "@/services/faceSenseApi";

interface TimelineChartProps {
  samples?: FaceSenseMetricSample[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ samples = [] }) => {
  if (!samples || samples.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
        <Clock className="h-5 w-5 text-neutral-500" />
        <span>No timeline samples recorded yet.</span>
      </div>
    );
  }

  // Display recent 20 points
  const points = samples.slice(-25);

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-display">
            FaceSense Behavioral Intelligence Timeline
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Confidence
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Stress
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Eye Contact
          </span>
        </div>
      </div>

      <div className="h-32 w-full flex items-end gap-1.5 pt-4 pb-2 border-b border-white/10">
        {points.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
            <div className="w-full flex items-end justify-center gap-0.5 h-full">
              <div
                className="w-1.5 bg-emerald-400/80 rounded-t transition-all duration-300"
                style={{ height: `${Math.max(5, p.confidence_score)}%` }}
              />
              <div
                className="w-1.5 bg-rose-400/80 rounded-t transition-all duration-300"
                style={{ height: `${Math.max(5, p.stress_score)}%` }}
              />
              <div
                className="w-1.5 bg-cyan-400/80 rounded-t transition-all duration-300"
                style={{ height: `${Math.max(5, p.eye_contact_score)}%` }}
              />
            </div>
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col gap-0.5 p-2 rounded-lg bg-neutral-900 border border-white/20 text-[10px] font-mono text-white whitespace-nowrap z-20 shadow-xl">
              <span className="text-neutral-400">T: {p.timestamp_sec}s</span>
              <span>Conf: {Math.round(p.confidence_score)}%</span>
              <span>Stress: {Math.round(p.stress_score)}%</span>
              <span>Eye: {Math.round(p.eye_contact_score)}%</span>
              <span className="text-amber-300">{p.emotion_label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
        <span>00:00</span>
        <span className="flex items-center gap-1 text-gold-400">
          <Sparkles className="h-3 w-3" /> Question-wise Correlation Active
        </span>
        <span>{points[points.length - 1]?.timestamp_sec || 0}s</span>
      </div>
    </div>
  );
};

export default TimelineChart;

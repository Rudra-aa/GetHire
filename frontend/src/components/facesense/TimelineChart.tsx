import React from "react";
import { TrendingUp, Clock, Sparkles } from "lucide-react";
import { type FaceSenseMetricSample } from "@/services/faceSenseApi";

interface TimelineChartProps {
  samples?: FaceSenseMetricSample[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ samples = [] }) => {
  if (!samples || samples.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col items-center justify-center gap-2 text-[#5A6E8C] text-xs shadow-sm">
        <Clock className="h-5 w-5 text-[#8FA3BC]" />
        <span>No timeline samples recorded yet.</span>
      </div>
    );
  }

  // Display recent 20 points
  const points = samples.slice(-25);

  return (
    <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#1E8C5A]" />
          <h3 className="text-sm font-bold text-[#263D68] font-display">
            FaceSense Behavioral Intelligence Timeline
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#1E8C5A]">
            <span className="h-2 w-2 rounded-full bg-[#1E8C5A]" /> Confidence
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Stress
          </span>
          <span className="flex items-center gap-1 text-[#2B7FAD]">
            <span className="h-2 w-2 rounded-full bg-[#2B7FAD]" /> Eye Contact
          </span>
        </div>
      </div>

      <div className="h-32 w-full flex items-end gap-1.5 pt-4 pb-2 border-b border-[#E4EDF5]">
        {points.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
            <div className="w-full flex items-end justify-center gap-0.5 h-full">
              <div
                className="w-1.5 bg-[#1E8C5A] rounded-t transition-all duration-300"
                style={{ height: `${Math.max(5, p.confidence_score)}%` }}
              />
              <div
                className="w-1.5 bg-rose-500 rounded-t transition-all duration-300"
                style={{ height: `${Math.max(5, p.stress_score)}%` }}
              />
              <div
                className="w-1.5 bg-[#2B7FAD] rounded-t transition-all duration-300"
                style={{ height: `${Math.max(5, p.eye_contact_score)}%` }}
              />
            </div>
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col gap-0.5 p-2 rounded-lg bg-white border border-[#D0DCE8] text-[10px] font-mono text-[#263D68] whitespace-nowrap z-20 shadow-xl">
              <span className="text-[#5A6E8C]">T: {p.timestamp_sec}s</span>
              <span>Conf: {Math.round(p.confidence_score)}%</span>
              <span>Stress: {Math.round(p.stress_score)}%</span>
              <span>Eye: {Math.round(p.eye_contact_score)}%</span>
              <span className="text-amber-600 font-medium">{p.emotion_label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#5A6E8C]">
        <span>00:00</span>
        <span className="flex items-center gap-1 text-[#1E8C5A] font-medium">
          <Sparkles className="h-3 w-3" /> Question-wise Correlation Active
        </span>
        <span>{points[points.length - 1]?.timestamp_sec || 0}s</span>
      </div>
    </div>
  );
};

export default TimelineChart;

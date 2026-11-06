/**
 * NextStepsPanel.tsx
 * ───────────────────
 * AI Recommended Next Steps row matching exact reference specs:
 * 5 actionable cards with icon, title, description, time estimate, and start button.
 */
import React from "react";
import { GlassCard } from "./GlassCard";
import { Database, Layers, Code2, Video, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    title: "Practice SQL Optimization",
    desc: "Focus on query tuning techniques",
    time: "2-3 Days",
    Icon: Database,
    color: "#4DA8FF",
    bg: "bg-[#4DA8FF]/10 border-[#4DA8FF]/20",
  },
  {
    title: "System Design Deep Dive",
    desc: "Scalability & high level design",
    time: "4-5 Days",
    Icon: Layers,
    color: "#2B7FAD",
    bg: "bg-[#B9D9EC]/30 border-[#B9D9EC]",
  },
  {
    title: "Advanced DSA Problems",
    desc: "Trees, Graphs, DP practice",
    time: "3-4 Days",
    Icon: Code2,
    color: "#1E8C5A",
    bg: "bg-[#F0FAF5] border-[#A8D8C3]",
  },
  {
    title: "Mock Interviews",
    desc: "Practice with real scenarios",
    time: "2-3 Sessions",
    Icon: Video,
    color: "#5245A4",
    bg: "bg-[#DCD5F0]/30 border-[#DCD5F0]",
  },
  {
    title: "Behavioral Preparation",
    desc: "STAR method & storytelling",
    time: "1-2 Days",
    Icon: MessageSquare,
    color: "#2B7FAD",
    bg: "bg-[#B9D9EC]/30 border-[#B9D9EC]",
  },
];

export const NextStepsPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="h-3 w-1 rounded-full bg-[#1E8C5A]" />
        <h3 className="text-sm font-bold text-[#263D68]">Recommended Next Steps</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map(({ title, desc, time, Icon, color, bg }, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 hover:border-[#A8D8C3] hover:bg-white/95 transition-all flex flex-col justify-between gap-3 group shadow-sm"
          >
            {/* Top row: Icon + time badge */}
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border ${bg} group-hover:scale-105 transition-transform`}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#5A6E8C] bg-white px-2 py-0.5 rounded-md border border-[#D0DCE8]">
                {time}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 my-1">
              <h4 className="text-xs font-bold text-[#263D68] group-hover:text-[#1E8C5A] transition-colors">
                {title}
              </h4>
              <p className="text-[11px] text-[#5A6E8C] leading-snug">
                {desc}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => navigate("/interview")}
              className="mt-1 w-full py-1.5 px-3 rounded-xl bg-white hover:bg-[#F0FAF5] border border-[#D0DCE8] hover:border-[#A8D8C3] text-[11px] font-bold text-[#263D68] hover:text-[#1E8C5A] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>Start</span>
              <ArrowRight className="h-3 w-3 text-[#1E8C5A]" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

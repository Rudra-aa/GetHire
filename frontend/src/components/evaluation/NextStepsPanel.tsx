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
    color: "#FFD54A",
    bg: "bg-[#FFD54A]/10 border-[#FFD54A]/20",
  },
  {
    title: "Advanced DSA Problems",
    desc: "Trees, Graphs, DP practice",
    time: "3-4 Days",
    Icon: Code2,
    color: "#39FF88",
    bg: "bg-[#39FF88]/10 border-[#39FF88]/20",
  },
  {
    title: "Mock Interviews",
    desc: "Practice with real scenarios",
    time: "2-3 Sessions",
    Icon: Video,
    color: "#8B5CF6",
    bg: "bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
  },
  {
    title: "Behavioral Preparation",
    desc: "STAR method & storytelling",
    time: "1-2 Days",
    Icon: MessageSquare,
    color: "#EC4899",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
];

export const NextStepsPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="h-3 w-1 rounded-full bg-[#39FF88]" />
        <h3 className="text-sm font-bold text-white">AI Recommended Next Steps</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map(({ title, desc, time, Icon, color, bg }, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/15 hover:bg-white/[0.04] transition-all flex flex-col justify-between gap-3 group"
          >
            {/* Top row: Icon + time badge */}
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl border ${bg} group-hover:scale-105 transition-transform`}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                {time}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 my-1">
              <h4 className="text-xs font-bold text-white group-hover:text-[#39FF88] transition-colors">
                {title}
              </h4>
              <p className="text-[11px] text-neutral-400 leading-snug">
                {desc}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => navigate("/interview")}
              className="mt-1 w-full py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Start</span>
              <ArrowRight className="h-3 w-3 text-[#39FF88]" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

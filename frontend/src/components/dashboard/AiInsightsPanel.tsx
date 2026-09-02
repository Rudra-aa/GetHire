import { useState, memo } from "react";
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  Zap,
  MessageSquare
} from "lucide-react";

interface AiInsightsProps {
  onOpenCopilot?: () => void;
}

const aiRecommendations = [
  {
    id: "rec-1",
    tag: "RESUME OPTIMIZATION",
    impact: "+14% ATS Boost",
    impactColor: "text-[#39FF88] bg-emerald-500/10 border-emerald-500/20",
    text: "Your resume is missing measurable achievements in frontend performance. Adding quantified metrics (e.g. 'reduced LCP by 42%') will boost ATS match for Senior roles.",
    action: "Apply Metric Template",
  },
  {
    id: "rec-2",
    tag: "SKILL ONTOLOGY",
    impact: "+11% Role Match",
    impactColor: "text-[#4DA8FF] bg-blue-500/10 border-blue-500/20",
    text: "Target Role Alignment: Adding React Query (TanStack) & Zustand to your project descriptions aligns directly with 84% of Tier 1 tech frontend openings.",
    action: "Add Skill to Roadmap",
  },
  {
    id: "rec-3",
    tag: "INTERVIEW DELIVERY",
    impact: "88% Vocal Composure",
    impactColor: "text-[#FFD54A] bg-amber-500/10 border-amber-500/20",
    text: "Interview feedback: Vocal confidence was high (87%), but pacing in System Design questions was slightly rapid (154 WPM). Aim for 130-140 WPM.",
    action: "Practice Pacing Drill",
  },
];

export const AiInsightsPanel = memo(function AiInsightsPanel({ onOpenCopilot }: AiInsightsProps) {
  const [appliedList, setAppliedList] = useState<Record<string, boolean>>({});

  const handleApply = (id: string) => {
    setAppliedList((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="relative w-full rounded-3xl p-6 sm:p-7 glass-card-luxury bg-[#111217]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between gap-6 overflow-hidden">
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-[#39FF88] shadow-[0_0_15px_rgba(57,255,136,0.2)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Copilot Insights
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#39FF88] border border-emerald-500/20">
                GPT-4o CALIBRATED
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Personalized predictive recommendations to accelerate your hire rate.
            </p>
          </div>
        </div>

        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#39FF88]" />
            <span>Chat with AI</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        {aiRecommendations.map((rec) => {
          const isApplied = appliedList[rec.id];
          return (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                    {rec.tag}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${rec.impactColor}`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{rec.text}</p>
              </div>

              <button
                onClick={() => handleApply(rec.id)}
                disabled={isApplied}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isApplied
                    ? "bg-emerald-500/20 text-[#39FF88] border border-emerald-500/30 cursor-default"
                    : "bg-white/[0.06] hover:bg-emerald-500/15 text-white hover:text-[#39FF88] border border-white/10 hover:border-emerald-500/30 shadow-sm"
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#39FF88]" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-[#39FF88]" />
                    <span>{rec.action}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default AiInsightsPanel;

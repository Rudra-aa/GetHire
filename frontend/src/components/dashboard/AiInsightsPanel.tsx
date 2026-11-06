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
    impactColor: "text-[#1E8C5A] bg-[#A8D8C3]/20 border-[#A8D8C3]/50",
    text: "Your resume is missing measurable achievements in frontend performance. Adding quantified metrics (e.g. 'reduced LCP by 42%') will boost ATS match for Senior roles.",
    action: "Apply Metric Template",
  },
  {
    id: "rec-2",
    tag: "SKILL ONTOLOGY",
    impact: "+11% Role Match",
    impactColor: "text-[#2B7FAD] bg-[#B9D9EC]/25 border-[#B9D9EC]/60",
    text: "Target Role Alignment: Adding React Query (TanStack) & Zustand to your project descriptions aligns directly with 84% of Tier 1 tech frontend openings.",
    action: "Add Skill to Roadmap",
  },
  {
    id: "rec-3",
    tag: "INTERVIEW DELIVERY",
    impact: "88% Vocal Composure",
    impactColor: "text-[#5245A4] bg-[#DCD5F0]/30 border-[#DCD5F0]/70",
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
    <div className="relative w-full rounded-2xl p-6 sm:p-7 bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col justify-between gap-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 flex items-center justify-center text-[#1E8C5A] shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
              Performance Insights
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40">
                CALIBRATED
              </span>
            </h3>
            <p className="text-xs text-[#5A6E8C]">
              Personalized predictive recommendations to accelerate your hire rate.
            </p>
          </div>
        </div>

        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 backdrop-blur-sm hover:bg-white text-[#263D68] border border-[#B9D9EC]/60 transition-all shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#1E8C5A]" />
            <span>Assistant</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        {aiRecommendations.map((rec) => {
          const isApplied = appliedList[rec.id];
          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-white/85 backdrop-blur-sm border border-white/95 hover:border-[#A8D8C3] hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-xs"
            >
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#5A6E8C] uppercase">
                    {rec.tag}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${rec.impactColor}`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-[#5A6E8C] leading-relaxed">{rec.text}</p>
              </div>

              <button
                onClick={() => handleApply(rec.id)}
                disabled={isApplied}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isApplied
                    ? "bg-[#A8D8C3]/30 text-[#1E8C5A] border border-[#A8D8C3]/60 cursor-default"
                    : "bg-white hover:bg-[#A8D8C3]/20 text-[#263D68] hover:text-[#1E8C5A] border border-[#D0DCE8] hover:border-[#A8D8C3] shadow-sm"
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1E8C5A]" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-[#1E8C5A]" />
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

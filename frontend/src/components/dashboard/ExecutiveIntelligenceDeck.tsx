import React from "react";
import { TrendingUp, Clock, Lightbulb, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: "resume" | "assessment" | "interview" | "evaluation";
}

export interface ExecutiveIntelligenceDeckProps {
  activities?: ActivityItem[] | undefined;
  recommendations?: string[] | undefined;
  evolutionScores?: number[] | undefined;
}

export const ExecutiveIntelligenceDeck: React.FC<ExecutiveIntelligenceDeckProps> = ({
  activities = [],
  recommendations = [],
  evolutionScores = [],
}) => {
  const hasMultipleScores = evolutionScores.length >= 2;
  const growthDelta = hasMultipleScores
    ? (evolutionScores[evolutionScores.length - 1] ?? 0) - (evolutionScores[0] ?? 0)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
      
      {/* Col 1: Candidate Evolution Graph (Subtle Powder Blue Section) */}
      <div id="evolution" className="p-6 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] flex flex-col gap-4 shadow-glass scroll-mt-24 transition-all">
        <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-[#263D68]">
            <TrendingUp className="h-4 w-4 text-[#1E8C5A]" />
            <span>Candidate Evolution Trend</span>
          </div>
          {hasMultipleScores ? (
            <span className={`text-[10px] font-mono font-bold ${growthDelta >= 0 ? "text-[#1E8C5A]" : "text-[#E05C5C]"}`}>
              {growthDelta >= 0 ? `+${growthDelta}%` : `${growthDelta}%`} Growth
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#5A6E8C]">
              {evolutionScores.length === 1 ? "Baseline Set" : "Calibration Phase"}
            </span>
          )}
        </div>

        <p className="text-xs text-[#5A6E8C] font-sans">
          Historical score progression across technical assessments and conversational interview rounds.
        </p>

        {evolutionScores.length > 0 ? (
          <div className="h-28 w-full flex items-end justify-between gap-2 pt-2">
            {evolutionScores.map((score, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-[#263D68] font-bold">{score}%</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-[#A8D8C3]/30 to-[#A8D8C3] border-t border-[#A8D8C3] transition-all duration-300"
                  style={{ height: `${Math.max(10, score)}%` }}
                />
                <span className="text-[9px] font-mono text-[#8FA3BC]">Cycle {idx + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-28 w-full flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-dashed border-[#B9D9EC]/60">
            <Activity className="h-6 w-6 text-[#8FA3BC] mb-1.5" />
            <span className="text-xs font-semibold text-[#263D68]">No Evolution Trend Yet</span>
            <span className="text-[10px] text-[#5A6E8C] mt-0.5">
              Complete evaluation cycles to generate your progression trajectory.
            </span>
          </div>
        )}
      </div>

      {/* Col 2: Recent Activity Timeline (Subtle Powder Blue Section) */}
      <div className="p-6 rounded-3xl bg-[#EEF6FB]/80 backdrop-blur-md border border-[#B9D9EC]/50 hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] flex flex-col gap-4 shadow-glass transition-all">
        <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-[#263D68]">
            <Clock className="h-4 w-4 text-[#2B7FAD]" />
            <span>Recent Activity Timeline</span>
          </div>
          <span className="text-[10px] font-mono text-[#5A6E8C]">Audit Verified</span>
        </div>

        <div className="flex flex-col gap-3">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs font-sans p-2.5 rounded-xl bg-white/85 backdrop-blur-sm border border-white/95 shadow-xs">
                <div className="p-1.5 rounded-lg bg-[#B9D9EC]/40 text-[#2B7FAD] shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#263D68] font-semibold">{act.title}</span>
                  <span className="text-[10px] font-mono text-[#8FA3BC]">{act.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-dashed border-[#B9D9EC]/60 text-center">
              <span className="text-xs text-[#5A6E8C]">No activities recorded yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 3: Recommendations (Subtle Powder Blue Section) */}
      <div className="p-6 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] flex flex-col gap-4 shadow-glass transition-all">
        <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-[#263D68]">
            <Lightbulb className="h-4 w-4 text-[#D4921A]" />
            <span>Recommendations</span>
          </div>
          <span className="text-[10px] font-mono text-[#D4921A] font-bold">Actionable</span>
        </div>

        <div className="flex flex-col gap-2.5 text-xs font-sans">
          {recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/95 shadow-xs text-[#3D5370] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1E8C5A] shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-dashed border-[#B9D9EC]/60 text-center">
              <span className="text-xs text-[#5A6E8C]">Complete an assessment or interview to generate tailored recommendations.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ExecutiveIntelligenceDeck;

import React from "react";
import { TrendingUp, Clock, Lightbulb, CheckCircle2, ShieldCheck } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: "resume" | "assessment" | "interview" | "evaluation";
}

interface ExecutiveIntelligenceDeckProps {
  activities?: ActivityItem[] | undefined;
  recommendations?: string[] | undefined;
  evolutionScores?: number[] | undefined;
}

export const ExecutiveIntelligenceDeck: React.FC<ExecutiveIntelligenceDeckProps> = ({
  activities = [
    { id: "act-1", title: "Resume Uploaded & Parsed (v1)", timestamp: "Recently", type: "resume" },
    { id: "act-[#]", title: "Technical Assessment Calibrated", timestamp: "Recently", type: "assessment" },
  ],
  recommendations = [
    "Strengthen System Architecture trade-off explanations under burst throughput.",
    "Review Redis TTL early expiration algorithms to prevent cache stampedes.",
    "Practice zero-trust API gateway authentication flows."
  ],
  evolutionScores = [65, 74, 82, 88],
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
      
      {/* Col 1: Candidate Evolution Graph */}
      <div id="evolution" className="p-6 rounded-3xl bg-[#0e121d] border border-white/10 flex flex-col gap-4 shadow-2xl backdrop-blur scroll-mt-24">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-white">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Candidate Evolution Trend</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">+23% Growth</span>
        </div>

        <p className="text-xs text-neutral-400 font-sans">
          Historical score progression across technical assessments and conversational interview rounds.
        </p>

        {/* Mini sparkline bars */}
        <div className="h-28 w-full flex items-end justify-between gap-2 pt-2">
          {evolutionScores.map((score, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-mono text-neutral-300 font-bold">{score}%</span>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500/20 to-emerald-400 border-t border-emerald-300 transition-all duration-300"
                style={{ height: `${score}%` }}
              />
              <span className="text-[9px] font-mono text-neutral-500">S{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Col 2: Recent Activity Timeline */}
      <div className="p-6 rounded-3xl bg-[#0e121d] border border-white/10 flex flex-col gap-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-white">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Recent Activity Timeline</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Audit Verified</span>
        </div>

        <div className="flex flex-col gap-3">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs font-sans p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white font-semibold">{act.title}</span>
                <span className="text-[10px] font-mono text-neutral-500">{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3: AI Recommendations */}
      <div className="p-6 rounded-3xl bg-[#0e121d] border border-white/10 flex flex-col gap-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-white">
            <Lightbulb className="h-4 w-4 text-gold-400" />
            <span>AI Executive Recommendations</span>
          </div>
          <span className="text-[10px] font-mono text-gold-400 font-bold">Actionable</span>
        </div>

        <div className="flex flex-col gap-2.5 text-xs font-sans">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-gold-400/5 border border-gold-400/20 text-neutral-300 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ExecutiveIntelligenceDeck;

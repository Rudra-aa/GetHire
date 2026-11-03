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
      
      {/* Col 1: Candidate Evolution Graph */}
      <div id="evolution" className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-2xl backdrop-blur scroll-mt-24">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Candidate Evolution Trend</span>
          </div>
          {hasMultipleScores ? (
            <span className={`text-[10px] font-mono font-bold ${growthDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {growthDelta >= 0 ? `+${growthDelta}%` : `${growthDelta}%`} Growth
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
              {evolutionScores.length === 1 ? "Baseline Set" : "Calibration Phase"}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-neutral-400 font-sans">
          Historical score progression across technical assessments and conversational interview rounds.
        </p>

        {evolutionScores.length > 0 ? (
          <div className="h-28 w-full flex items-end justify-between gap-2 pt-2">
            {evolutionScores.map((score, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-slate-700 dark:text-neutral-300 font-bold">{score}%</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500/20 to-emerald-400 border-t border-emerald-300 transition-all duration-300"
                  style={{ height: `${Math.max(10, score)}%` }}
                />
                <span className="text-[9px] font-mono text-slate-500 dark:text-neutral-500">Cycle {idx + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-28 w-full flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
            <Activity className="h-6 w-6 text-slate-400 dark:text-neutral-500 mb-1.5" />
            <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">No Evolution Trend Yet</span>
            <span className="text-[10px] text-slate-500 dark:text-neutral-500 mt-0.5">
              Complete evaluation cycles to generate your progression trajectory.
            </span>
          </div>
        )}
      </div>

      {/* Col 2: Recent Activity Timeline */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
            <Clock className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            <span>Recent Activity Timeline</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">Audit Verified</span>
        </div>

        <div className="flex flex-col gap-3">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs font-sans p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-900 dark:text-white font-semibold">{act.title}</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-500">{act.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-center">
              <span className="text-xs text-slate-500 dark:text-neutral-400">No activities recorded yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 3: AI Recommendations */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
            <Lightbulb className="h-4 w-4 text-amber-500 dark:text-gold-400" />
            <span>AI Executive Recommendations</span>
          </div>
          <span className="text-[10px] font-mono text-amber-600 dark:text-gold-400 font-bold">Actionable</span>
        </div>

        <div className="flex flex-col gap-2.5 text-xs font-sans">
          {recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-amber-500/5 dark:bg-gold-400/5 border border-amber-500/20 dark:border-gold-400/20 text-slate-700 dark:text-neutral-300 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500 dark:text-gold-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-center">
              <span className="text-xs text-slate-500 dark:text-neutral-400">Complete an assessment or interview to generate tailored recommendations.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ExecutiveIntelligenceDeck;

import React from "react";
import { Lightbulb, Clock, CheckCircle2, Zap } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  category: "resume" | "assessment" | "interview" | "evaluation";
}

interface ActivityFeedProps {
  activities?: ActivityItem[] | undefined;
  recommendation?: string | undefined;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  recommendation,
}) => {
  const defaultActivities: ActivityItem[] = activities.length > 0 ? activities : [
    { id: "a-1", title: "Resume Intelligence PDF parsed & ATS calibrated", timestamp: "Recently", category: "resume" },
    { id: "a-[#00]", title: "Technical Assessment Engine initialized", timestamp: "Active", category: "assessment" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left: AI Copilot Recommendations */}
      <div className="lg:col-span-6 p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-display">AI Copilot Recommended Focus</h3>
        </div>

        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
          {recommendation || "Complete your Stage 1 Technical Assessment to generate a Knowledge Profile targeting System Design & API Security gaps."}
        </p>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-400 font-bold">
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> High Priority Gap Focus
          </span>
        </div>
      </div>

      {/* Right: Timestamped Activity Stream */}
      <div className="lg:col-span-6 p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white font-display">Recent Activity Stream</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase">Live Log</span>
        </div>

        <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto pr-1">
          {defaultActivities.map((act) => (
            <div key={act.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="text-neutral-200 truncate">{act.title}</span>
              </div>
              <span className="text-neutral-500 text-[10px] shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;

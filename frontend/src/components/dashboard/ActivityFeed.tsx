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
      {/* Left: Recommended Focus (Subtle Powder Blue Section) */}
      <div className="lg:col-span-6 p-6 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#DCD5F0]/30 border border-[#DCD5F0] text-[#5245A4]">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-[#263D68] font-display">Recommended Focus Area</h3>
        </div>

        <p className="text-xs text-[#5A6E8C] font-sans leading-relaxed">
          {recommendation || "Complete your Stage 1 Technical Assessment to generate a Knowledge Profile targeting System Design & API Security gaps."}
        </p>

        <div className="pt-2 border-t border-[#B9D9EC]/40 flex items-center justify-between text-xs font-mono text-[#5245A4] font-bold">
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> High Priority Gap Focus
          </span>
        </div>
      </div>

      {/* Right: Timestamped Activity Stream (Subtle Powder Blue Section) */}
      <div className="lg:col-span-6 p-6 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#B9D9EC]/30 border border-[#B9D9EC] text-[#2B7FAD]">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#263D68] font-display">Recent Activity Stream</h3>
          </div>
          <span className="text-[10px] font-mono text-[#5A6E8C] uppercase">Live Log</span>
        </div>

        <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto pr-1">
          {defaultActivities.map((act) => (
            <div key={act.id} className="p-3 rounded-xl bg-white/85 backdrop-blur-sm border border-white/95 flex items-center justify-between text-xs font-mono shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1E8C5A] shrink-0" />
                <span className="text-[#263D68] truncate">{act.title}</span>
              </div>
              <span className="text-[#5A6E8C] text-[10px] shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;

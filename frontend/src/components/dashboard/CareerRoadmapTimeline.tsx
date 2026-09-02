import { memo, type ReactNode } from "react";
import {
  CheckCircle2,
  Sparkles,
  Award,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  sub: string;
  status: "completed" | "active" | "upcoming";
  icon: ReactNode;
}

const milestones: Milestone[] = [
  {
    id: "m-1",
    title: "Resume Uploaded",
    sub: "Parsed & Calibrated",
    status: "completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    id: "m-2",
    title: "Skills Extracted",
    sub: "18 Competencies",
    status: "completed",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    id: "m-3",
    title: "Mock Interview #1",
    sub: "Completed (84%)",
    status: "completed",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  {
    id: "m-4",
    title: "Weak Areas Isolated",
    sub: "In Progress",
    status: "active",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  {
    id: "m-5",
    title: "AI Action Plan",
    sub: "Next Up",
    status: "upcoming",
    icon: <Target className="h-3.5 w-3.5" />,
  },
  {
    id: "m-6",
    title: "Offer Ready",
    sub: "Target Goal",
    status: "upcoming",
    icon: <Award className="h-3.5 w-3.5" />,
  },
];

export const CareerRoadmapTimeline = memo(function CareerRoadmapTimeline() {
  return (
    <div className="relative w-full rounded-3xl p-6 sm:p-7 glass-card-luxury bg-[#111217]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Career Milestone Roadmap
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-[#4DA8FF] border border-blue-500/20">
              PHASE 2 OF 4
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Your personalized progression trajectory to land Senior Tier 1 offers.
          </p>
        </div>

        <span className="text-xs font-mono text-[#39FF88] font-bold">50% Completed</span>
      </div>

      <div className="relative flex items-center justify-between gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
        <div className="absolute top-7 left-6 right-6 h-[2px] bg-white/10 -translate-y-1/2 pointer-events-none z-0" />
        <div className="absolute top-7 left-6 w-[55%] h-[2px] bg-gradient-to-r from-[#39FF88] via-[#4DA8FF] to-[#8B5CF6] -translate-y-1/2 pointer-events-none shadow-[0_0_8px_#39FF88] z-0" />

        {milestones.map((m) => {
          const isDone = m.status === "completed";
          const isActive = m.status === "active";

          return (
            <div
              key={m.id}
              className="relative z-10 flex flex-col items-center text-center min-w-[110px] sm:min-w-[125px] gap-2.5 group"
            >
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-500/20 border-[#39FF88] text-[#39FF88] shadow-[0_0_15px_rgba(57,255,136,0.35)]"
                    : isActive
                    ? "bg-blue-500/20 border-[#4DA8FF] text-[#4DA8FF] shadow-[0_0_18px_rgba(77,168,255,0.4)] animate-pulse"
                    : "bg-[#17171A] border-white/15 text-neutral-500"
                }`}
              >
                {m.icon}
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-bold leading-tight ${
                    isDone
                      ? "text-white"
                      : isActive
                      ? "text-[#4DA8FF]"
                      : "text-neutral-400"
                  }`}
                >
                  {m.title}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 mt-0.5">
                  {m.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CareerRoadmapTimeline;

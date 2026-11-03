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

export interface CareerRoadmapTimelineProps {
  hasResume?: boolean;
  skillsCount?: number;
  assessmentScore?: number | undefined;
  interviewCompletedCount?: number;
  latestInterviewScore?: number | undefined;
  hireScore?: number | undefined;
}

export const CareerRoadmapTimeline = memo(function CareerRoadmapTimeline({
  hasResume = false,
  skillsCount = 0,
  assessmentScore,
  interviewCompletedCount = 0,
  latestInterviewScore,
  hireScore,
}: CareerRoadmapTimelineProps) {
  const isResumeDone = Boolean(hasResume);
  const isAssessmentDone = assessmentScore !== undefined;
  const isInterviewDone = interviewCompletedCount > 0;
  const isEvaluationDone = hireScore !== undefined;

  const milestones: Milestone[] = [
    {
      id: "m-1",
      title: "Resume Uploaded",
      sub: isResumeDone ? "Parsed & Calibrated" : "Upload Pending",
      status: isResumeDone ? "completed" : "active",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    {
      id: "m-2",
      title: "Technical Assessment",
      sub: isAssessmentDone
        ? `Score: ${assessmentScore}%`
        : isResumeDone
        ? (skillsCount > 0 ? `${skillsCount} Skills Identified` : "Ready to Start")
        : "Pending Resume",
      status: isAssessmentDone
        ? "completed"
        : isResumeDone
        ? "active"
        : "upcoming",
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    {
      id: "m-3",
      title: "Mock Interview #1",
      sub: isInterviewDone
        ? latestInterviewScore !== undefined
          ? `Completed (${latestInterviewScore}%)`
          : `${interviewCompletedCount} Session${interviewCompletedCount > 1 ? "s" : ""} Done`
        : isAssessmentDone
        ? "Ready to Start"
        : "0 Sessions Completed",
      status: isInterviewDone
        ? "completed"
        : isAssessmentDone
        ? "active"
        : "upcoming",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    {
      id: "m-4",
      title: "Diagnostic Evaluation",
      sub: isEvaluationDone
        ? `HireScore: ${hireScore}/100`
        : isInterviewDone && isAssessmentDone
        ? "Evaluation Ready"
        : "Requires Assessment & Interview",
      status: isEvaluationDone
        ? "completed"
        : isInterviewDone && isAssessmentDone
        ? "active"
        : "upcoming",
      icon: <Award className="h-3.5 w-3.5" />,
    },
    {
      id: "m-5",
      title: "AI Action Plan",
      sub: isEvaluationDone
        ? hireScore >= 80
          ? "Target Achieved"
          : "Action Plan Active"
        : "Pending Evaluation",
      status: isEvaluationDone
        ? hireScore >= 80
          ? "completed"
          : "active"
        : "upcoming",
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    {
      id: "m-6",
      title: "Offer Ready",
      sub: isEvaluationDone && hireScore >= 85
        ? "Tier 1 Calibrated"
        : isEvaluationDone && hireScore >= 70
        ? "Near Target"
        : "Target Goal",
      status: isEvaluationDone && hireScore >= 85
        ? "completed"
        : isEvaluationDone && hireScore >= 70
        ? "active"
        : "upcoming",
      icon: <Target className="h-3.5 w-3.5" />,
    },
  ];

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const percentCompleted = Math.round((completedCount / milestones.length) * 100);
  const phaseLabel =
    completedCount <= 1
      ? "PHASE 1 OF 4"
      : completedCount <= 2
      ? "PHASE 2 OF 4"
      : completedCount <= 4
      ? "PHASE 3 OF 4"
      : "PHASE 4 OF 4";

  return (
    <div className="relative w-full rounded-3xl p-6 sm:p-7 glass-card-luxury bg-white dark:bg-[#111217]/90 border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Career Milestone Roadmap
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#4DA8FF] border border-blue-500/20">
              {phaseLabel}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Your personalized progression trajectory to land Senior Tier 1 offers.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-600 dark:text-[#39FF88] font-bold">
          {percentCompleted}% Completed
        </span>
      </div>

      <div className="relative flex items-center justify-between gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
        <div className="absolute top-7 left-6 right-6 h-[2px] bg-slate-200 dark:bg-white/10 -translate-y-1/2 pointer-events-none z-0" />
        <div
          className="absolute top-7 left-6 h-[2px] bg-gradient-to-r from-[#39FF88] via-[#4DA8FF] to-[#8B5CF6] -translate-y-1/2 pointer-events-none shadow-[0_0_8px_#39FF88] z-0 transition-all duration-500"
          style={{ width: `${percentCompleted}%` }}
        />

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
                    ? "bg-emerald-500/20 border-emerald-500 dark:border-[#39FF88] text-emerald-600 dark:text-[#39FF88] shadow-[0_0_15px_rgba(57,255,136,0.35)]"
                    : isActive
                    ? "bg-blue-500/20 border-blue-500 dark:border-[#4DA8FF] text-blue-600 dark:text-[#4DA8FF] shadow-[0_0_18px_rgba(77,168,255,0.4)] animate-pulse"
                    : "bg-slate-100 dark:bg-[#17171A] border-slate-300 dark:border-white/15 text-slate-400 dark:text-neutral-500"
                }`}
              >
                {m.icon}
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-bold leading-tight ${
                    isDone
                      ? "text-slate-900 dark:text-white"
                      : isActive
                      ? "text-blue-600 dark:text-[#4DA8FF]"
                      : "text-slate-500 dark:text-neutral-400"
                  }`}
                >
                  {m.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-400 mt-0.5">
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

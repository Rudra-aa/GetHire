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
      title: "Interview #1",
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
      title: "Action Plan",
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
    <div className="relative w-full rounded-3xl p-6 sm:p-7 bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
            Career Milestone Roadmap
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B9D9EC]/40 text-[#2B7FAD] border border-[#B9D9EC]/60 font-bold">
              {phaseLabel}
            </span>
          </h3>
          <p className="text-xs text-[#5A6E8C] mt-0.5">
            Your personalized progression trajectory to land top-tier offers.
          </p>
        </div>

        <span className="text-xs font-mono text-[#1E8C5A] font-bold">
          {percentCompleted}% Completed
        </span>
      </div>

      <div className="relative flex items-center justify-between gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
        <div className="absolute top-7 left-6 right-6 h-[2px] bg-[#B9D9EC]/40 -translate-y-1/2 pointer-events-none z-0" />
        <div
          className="absolute top-7 left-6 h-[2px] bg-gradient-to-r from-[#A8D8C3] to-[#B9D9EC] -translate-y-1/2 pointer-events-none z-0 transition-all duration-500"
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
                    ? "bg-[#A8D8C3]/20 border-[#A8D8C3] text-[#1E8C5A] shadow-xs"
                    : isActive
                    ? "bg-[#B9D9EC]/40 border-[#B9D9EC] text-[#2B7FAD] shadow-xs"
                    : "bg-white/80 border-[#D0DCE8] text-[#8FA3BC]"
                }`}
              >
                {m.icon}
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-bold leading-tight ${
                    isDone
                      ? "text-[#263D68]"
                      : isActive
                      ? "text-[#2B7FAD]"
                      : "text-[#8FA3BC]"
                  }`}
                >
                  {m.title}
                </span>
                <span className="text-[10px] font-mono text-[#5A6E8C] mt-0.5">
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

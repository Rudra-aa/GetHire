import React from "react";
import { Sparkles, ArrowRight, Play, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkspaceHeaderProps {
  fullName?: string | undefined;
  targetRole?: string | undefined;
  experienceLevel?: string | undefined;
  resumeUploaded: boolean;
  assessmentCompleted: boolean;
  interviewCompleted: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  fullName,
  targetRole,
  experienceLevel,
  resumeUploaded,
  assessmentCompleted,
  interviewCompleted,
}) => {
  const navigate = useNavigate();
  const firstName = fullName?.split(" ")[0] || "Candidate";

  const getContinueAction = () => {
    if (!resumeUploaded) {
      return { label: "Upload Resume Document", path: "#resume", icon: Sparkles };
    }
    if (!assessmentCompleted) {
      return { label: "Launch Technical Assessment", path: "/assessment", icon: CheckSquare };
    }
    if (!interviewCompleted) {
      return { label: "Launch Interview Studio", path: "/interview", icon: Play };
    }
    return { label: "View Diagnostic Evaluation", path: "/evaluation", icon: ArrowRight };
  };

  const action = getContinueAction();
  const ActionIcon = action.icon;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      <div className="flex flex-col gap-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A] text-xs font-semibold w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Executive Candidate Operating System</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#263D68] font-display tracking-tight flex items-center gap-2">
          Welcome back, <span className="text-[#1E8C5A]">{firstName}</span> 👋
        </h1>

        <p className="text-xs sm:text-sm text-[#5A6E8C] font-sans max-w-xl">
          {targetRole || "Software Engineer"} • {experienceLevel || "Mid Level"} • Real-time telemetry, knowledge profiles, and evidence-based career intelligence.
        </p>
      </div>

      <div className="relative z-10 shrink-0 w-full md:w-auto">
        <button
          onClick={() => {
            if (action.path.startsWith("#")) {
              const el = document.querySelector(action.path);
              el?.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate(action.path);
            }
          }}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl text-[#1A2D52] font-bold text-xs hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(168,216,195,0.40)] hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
        >
          <span>{action.label}</span>
          <ActionIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default WorkspaceHeader;

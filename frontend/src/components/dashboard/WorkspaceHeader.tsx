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
      return { label: "Launch AI Interview Studio", path: "/interview", icon: Play };
    }
    return { label: "View Diagnostic Evaluation", path: "/evaluation", icon: ArrowRight };
  };

  const action = getContinueAction();
  const ActionIcon = action.icon;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f1422] via-[#0b0e18] to-[#07090e] border border-white/10 backdrop-blur shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Executive Candidate Operating System</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2">
          Welcome back, <span className="text-cyan-400">{firstName}</span> 👋
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-xl">
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
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs font-display hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
        >
          <span>{action.label}</span>
          <ActionIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default WorkspaceHeader;

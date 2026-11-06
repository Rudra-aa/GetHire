import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Video, BarChart2, Lock, ArrowRight } from "lucide-react";

interface WorkspaceModulesProps {
  resumeUploaded: boolean;
  assessmentStatus: "Not Started" | "In Progress" | "Completed";
  interviewStatus: "Not Started" | "In Progress" | "Completed";
  assessmentScore?: number | undefined;
}

export const WorkspaceModules: React.FC<WorkspaceModulesProps> = ({
  assessmentStatus,
  interviewStatus,
  assessmentScore,
}) => {
  const navigate = useNavigate();

  const isEvaluationUnlocked = assessmentStatus === "Completed" && interviewStatus === "Completed";

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-[#263D68]">Candidate Execution Workspace</h2>
        <span className="text-xs font-mono text-[#5A6E8C]">Enterprise Operating System</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Technical Assessment Center (Subtle Powder Blue Section) */}
        <div className="p-6 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] flex flex-col justify-between gap-5 shadow-glass hover:shadow-glass-hover transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#B9D9EC]/40 border border-[#B9D9EC]/60 text-[#2B7FAD]">
                <CheckSquare className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                assessmentStatus === "Completed"
                  ? "bg-[#A8D8C3]/20 text-[#1E8C5A] border-[#A8D8C3]/40"
                  : assessmentStatus === "In Progress"
                  ? "bg-amber-50 text-[#D4921A] border-amber-200"
                  : "bg-white/80 text-[#5A6E8C] border-[#D0DCE8]"
              }`}>
                {assessmentStatus}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#263D68] font-display">Technical Assessment Center</h3>
              <p className="text-xs text-[#5A6E8C] leading-relaxed font-sans">
                Proctored 20-question technical evaluation (CodeSignal / HackerRank experience). Measures algorithms, code output, and system design.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#B9D9EC]/40">
            {assessmentStatus === "Completed" && assessmentScore !== undefined ? (
              <span className="text-xs font-mono text-[#1E8C5A] font-bold">
                Knowledge Profile Generated ({assessmentScore}%)
              </span>
            ) : (
              <span className="text-xs font-mono text-[#5A6E8C]">Measures Knowledge</span>
            )}

            <button
              onClick={() => navigate("/assessment")}
              className="px-4 py-2 rounded-xl bg-[#B9D9EC] hover:bg-[#93C5DF] text-[#1A2D52] font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <span>{assessmentStatus === "Completed" ? "Retake Test" : "Launch Test"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Module 2: AI Interview Studio (Subtle Powder Blue Section) */}
        <div className="p-6 rounded-3xl bg-[#EEF6FB]/80 backdrop-blur-md border border-[#B9D9EC]/50 hover:bg-[#EEF6FB]/95 hover:border-[#A8D8C3]/70 flex flex-col justify-between gap-5 shadow-glass hover:shadow-glass-hover transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/50 text-[#1E8C5A]">
                <Video className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                interviewStatus === "Completed"
                  ? "bg-[#A8D8C3]/20 text-[#1E8C5A] border-[#A8D8C3]/40"
                  : interviewStatus === "In Progress"
                  ? "bg-amber-50 text-[#D4921A] border-amber-200"
                  : "bg-white/80 text-[#5A6E8C] border-[#D0DCE8]"
              }`}>
                {interviewStatus}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#263D68] font-display">Interview Studio</h3>
              <p className="text-xs text-[#5A6E8C] leading-relaxed font-sans">
                Conversational recruiter interview. Evaluates communication, reasoning, and system architecture challenges.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#B9D9EC]/40">
            <span className="text-xs font-mono text-[#5A6E8C]">Measures Communication</span>
            <button
              onClick={() => navigate("/interview")}
              className="px-4 py-2 rounded-xl bg-[#A8D8C3] hover:bg-[#77C4A2] text-[#1A2D52] font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <span>{interviewStatus === "Completed" ? "Re-interview" : "Launch Interview"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Module 3: Unified Evaluation Center (Subtle Powder Blue Section) */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-all shadow-glass hover:shadow-glass-hover ${
          isEvaluationUnlocked
            ? "bg-[#EEF6FB]/85 backdrop-blur-md border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#DCD5F0]/80"
            : "bg-[#EEF6FB]/70 backdrop-blur-sm border-[#B9D9EC]/50"
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border ${
                isEvaluationUnlocked
                  ? "bg-[#DCD5F0]/35 border-[#DCD5F0]/50 text-[#6E5EBB]"
                  : "bg-white/80 border-[#D0DCE8] text-[#8FA3BC]"
              }`}>
                <BarChart2 className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                isEvaluationUnlocked
                  ? "bg-[#A8D8C3]/20 text-[#1E8C5A] border-[#A8D8C3]/40"
                  : "bg-rose-50 text-[#E05C5C] border-rose-200"
              }`}>
                {isEvaluationUnlocked ? "Ready" : "Locked"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#263D68] font-display">Unified Evaluation Center</h3>
              <p className="text-xs text-[#5A6E8C] leading-relaxed font-sans">
                Synthesizes evidence from Resume, Technical Assessment, Interview Studio, and FaceSense into your final HireScore & Portfolio.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-[#B9D9EC]/40">
            {isEvaluationUnlocked ? (
              <button
                onClick={() => navigate("/evaluation")}
                className="w-full py-2.5 rounded-xl bg-[#A8D8C3] hover:bg-[#77C4A2] text-[#1A2D52] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01]"
              >
                <span>Open Evaluation Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/95 flex items-center gap-2 text-[11px] font-sans text-[#5A6E8C] shadow-xs">
                <Lock className="h-4 w-4 text-[#E05C5C] shrink-0" />
                <span>Complete both Technical Assessment and Interview to unlock Evaluation.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModules;

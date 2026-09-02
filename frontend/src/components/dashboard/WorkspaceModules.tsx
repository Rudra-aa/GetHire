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
        <h2 className="text-xl font-bold font-display text-white">Candidate Execution Workspace</h2>
        <span className="text-xs font-mono text-neutral-400">Enterprise Operating System</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Technical Assessment Center */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-500/[0.06] via-[#111522] to-[#0a0d16] border border-cyan-500/25 flex flex-col justify-between gap-5 shadow-2xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <CheckSquare className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                assessmentStatus === "Completed"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : assessmentStatus === "In Progress"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-white/5 text-neutral-400 border-white/10"
              }`}>
                {assessmentStatus}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white font-display">Technical Assessment Center</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Proctored 20-question technical evaluation (CodeSignal / HackerRank experience). Measures algorithms, code output, and system design.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {assessmentStatus === "Completed" && assessmentScore !== undefined ? (
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Knowledge Profile Generated ({assessmentScore}%)
              </span>
            ) : (
              <span className="text-xs font-mono text-neutral-500">Measures Knowledge</span>
            )}

            <button
              onClick={() => navigate("/assessment")}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-extrabold text-xs font-display hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>{assessmentStatus === "Completed" ? "Retake Test" : "Launch Test"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Module 2: AI Interview Studio */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-gold-500/[0.06] via-[#111522] to-[#0a0d16] border border-gold-400/25 flex flex-col justify-between gap-5 shadow-2xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-gold-400/15 border border-gold-400/30 text-gold-300">
                <Video className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                interviewStatus === "Completed"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : interviewStatus === "In Progress"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-white/5 text-neutral-400 border-white/10"
              }`}>
                {interviewStatus}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white font-display">AI Interview Studio</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Conversational recruiter interview (Google Meet / HireVue experience). Evaluates communication, reasoning, and system architecture challenges.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs font-mono text-neutral-500">Measures Communication</span>
            <button
              onClick={() => navigate("/interview")}
              className="px-4 py-2 rounded-xl bg-gold-400 text-black font-extrabold text-xs font-display hover:bg-gold-300 transition-all flex items-center gap-1.5 shadow-lg shadow-gold-500/20"
            >
              <span>{interviewStatus === "Completed" ? "Re-interview" : "Launch Interview"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Module 3: Unified Evaluation Center (Locked until BOTH complete!) */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-all shadow-2xl ${
          isEvaluationUnlocked
            ? "bg-gradient-to-b from-emerald-500/[0.08] via-[#111522] to-[#0a0d16] border-emerald-500/40"
            : "bg-[#0d0f17]/70 border-white/10 opacity-80"
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border ${
                isEvaluationUnlocked
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-neutral-500"
              }`}>
                <BarChart2 className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                isEvaluationUnlocked
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
              }`}>
                {isEvaluationUnlocked ? "Ready" : "Locked"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white font-display">Unified Evaluation Center</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Synthesizes evidence from Resume, Technical Assessment, AI Interview, and FaceSense into your final HireScore & Recruiter Portfolio.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
            {isEvaluationUnlocked ? (
              <button
                onClick={() => navigate("/interview/sess-ai-demo/evaluation")}
                className="w-full py-2.5 rounded-xl bg-emerald-400 text-black font-extrabold text-xs font-display hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>Open Evaluation Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2 text-[11px] font-sans text-neutral-400">
                <Lock className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Complete both Technical Assessment and AI Interview to unlock Evaluation.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModules;

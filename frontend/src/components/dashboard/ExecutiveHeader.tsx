import React from "react";
import { FileText, ShieldCheck, User, CheckCircle2 } from "lucide-react";
import { type ResumeDetail } from "@/services/resumeApi";

interface ExecutiveHeaderProps {
  candidateName: string;
  targetRole: string;
  experienceLevel: string;
  overallStatus: "Baseline Set" | "Assessment Completed" | "Interview Completed" | "Evaluation Ready";
  resume: ResumeDetail | null;
  onPreviewResume: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  candidateName,
  targetRole,
  experienceLevel,
  overallStatus,
  resume,
  onPreviewResume,
}) => {
  const skills = resume?.parsed_data?.skills || [];
  const resumeScore = resume?.quality_score?.overall_score || 0;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Banner: Candidate Overview & Current Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#121827] via-[#0f1422] to-[#0a0d16] border border-white/10 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {candidateName}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono">
                {targetRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/10 text-[11px] font-mono capitalize">
                {experienceLevel} Level
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-1">
              Executive Career Operating System Snapshot • Real-time Evidence Telemetry
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Current Status</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{overallStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Snapshot Bar */}
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#39FF88]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-display">Resume Intelligence Snapshot</h3>
              {resume && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[#39FF88] border border-emerald-500/20 text-[10px] font-mono">
                  ATS Score {resumeScore}/100
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              {resume ? `${resume.filename} (v${resume.version}) • ${skills.length} Extracted Competencies` : "No resume uploaded yet"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {skills.slice(0, 5).map((s, idx) => (
            <span key={idx} className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 text-xs font-mono">
              {s}
            </span>
          ))}
          {resume && (
            <button
              onClick={onPreviewResume}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-neutral-200 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>View Snapshot</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHeader;

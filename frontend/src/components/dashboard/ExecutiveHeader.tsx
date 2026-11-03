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
  onResetProgress?: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  candidateName,
  targetRole,
  experienceLevel,
  overallStatus,
  resume,
  onPreviewResume,
  onResetProgress,
}) => {
  const skills = resume?.parsed_data?.skills || [];
  const resumeScore = resume?.quality_score?.overall_score || 0;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Banner: Candidate Overview & Current Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-[#121827] dark:via-[#0f1422] dark:to-[#0a0d16] border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {candidateName}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold">
                {targetRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/10 text-[11px] font-mono capitalize">
                {experienceLevel} Level
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-sans mt-1">
              Executive Career Operating System Snapshot • Real-time Evidence Telemetry
            </p>
          </div>
        </div>

        {/* Current Status Pill & Start from Beginning */}
        <div className="flex items-center gap-4 flex-wrap">
          {onResetProgress && (
            <button
              onClick={onResetProgress}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
              title="Safely reset in-progress sessions and start fresh from Step 1"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>Start from Beginning</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-400 uppercase">Current Status</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{overallStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Snapshot Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#39FF88]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Resume Intelligence Snapshot</h3>
              {resume && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-[#39FF88] border border-emerald-500/20 text-[10px] font-mono font-bold">
                  ATS Score {resumeScore}/100
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-sans">
              {resume ? `${resume.filename} (v${resume.version}) • ${skills.length} Extracted Competencies` : "No resume uploaded yet"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {skills.slice(0, 5).map((s, idx) => (
            <span key={idx} className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 text-xs font-mono font-medium">
              {s}
            </span>
          ))}
          {resume && (
            <button
              onClick={onPreviewResume}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>View Snapshot</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHeader;

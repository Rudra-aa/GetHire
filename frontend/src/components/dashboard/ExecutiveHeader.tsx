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
      {/* Top Banner: Candidate Overview & Current Status (Subtle Powder Blue Section) */}
      <div className="p-6 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[#B9D9EC]/40 border border-[#B9D9EC]/70 text-[#2B7FAD] flex items-center justify-center shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#263D68] font-display">
                {candidateName}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-[#B9D9EC]/30 text-[#2B7FAD] border border-[#B9D9EC]/50 text-xs font-mono font-bold">
                {targetRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-[#5A6E8C] border border-white/95 text-[11px] font-mono capitalize shadow-xs">
                {experienceLevel} Level
              </span>
            </div>
            <p className="text-xs text-[#5A6E8C] font-sans mt-1">
              Executive Career Operating System Snapshot • Real-time Evidence Telemetry
            </p>
          </div>
        </div>

        {/* Current Status Pill & Start from Beginning */}
        <div className="flex items-center gap-4 flex-wrap">
          {onResetProgress && (
            <button
              onClick={onResetProgress}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-amber-200/90 text-[#D4921A] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
              title="Safely reset in-progress sessions and start fresh from Step 1"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4921A]" />
              <span>Start from Beginning</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-mono text-[#5A6E8C] uppercase">Current Status</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1E8C5A] mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{overallStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Snapshot Bar (Subtle Powder Blue Section) */}
      <div className="p-5 rounded-3xl bg-[#EEF6FB]/75 backdrop-blur-md border border-[#B9D9EC]/50 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/45 text-[#1E8C5A]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#263D68] font-display">Resume Intelligence Snapshot</h3>
              {resume && (
                <span className="px-2 py-0.5 rounded bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40 text-[10px] font-mono font-bold">
                  ATS Score {resumeScore}/100
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A6E8C] font-sans">
              {resume ? `${resume.filename} (v${resume.version}) • ${skills.length} Extracted Competencies` : "No resume uploaded yet"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {skills.slice(0, 5).map((s, idx) => (
            <span key={idx} className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-white/85 backdrop-blur-sm border border-white/95 text-[#5A6E8C] text-xs font-mono font-medium shadow-xs">
              {s}
            </span>
          ))}
          {resume && (
            <button
              onClick={onPreviewResume}
              className="px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white border border-[#B9D9EC]/60 text-xs font-mono font-bold text-[#263D68] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#2B7FAD]" />
              <span>View Snapshot</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHeader;

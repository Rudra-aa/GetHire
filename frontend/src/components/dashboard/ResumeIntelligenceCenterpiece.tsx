import { useState, useRef, memo, type DragEvent } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Play
} from "lucide-react";
import { resumeApi, type ResumeDetail } from "@/services/resumeApi";

interface CenterpieceProps {
  resume: ResumeDetail | null;
  onUploadSuccess: (resume: ResumeDetail) => void;
  onDeleteSuccess: () => void;
  onPreviewClick: () => void;
}

const pipelineSteps = [
  { id: "upload", label: "Resume Upload", icon: <FileText className="h-3 w-3" /> },
  { id: "parsing", label: "Parsing", icon: <Zap className="h-3 w-3" /> },
  { id: "skills", label: "Skill Extraction", icon: <Sparkles className="h-3 w-3" /> },
  { id: "ats", label: "ATS Analysis", icon: <ShieldCheck className="h-3 w-3" /> },
  { id: "readiness", label: "Readiness", icon: <Play className="h-3 w-3" /> },
  { id: "insights", label: "Career Insights", icon: <CheckCircle2 className="h-3 w-3" /> },
];

export const ResumeIntelligenceCenterpiece = memo(function ResumeIntelligenceCenterpiece({
  resume,
  onUploadSuccess,
  onDeleteSuccess,
  onPreviewClick,
}: CenterpieceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF resumes are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit.");
      return;
    }

    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 250);

    try {
      const result = await resumeApi.uploadResume(file);
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        onUploadSuccess(result);
      }, 400);
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(0);
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.detail?.message ||
        data?.errors?.[0]?.message ||
        (typeof data?.detail === "string" ? data.detail : null) ||
        err.message ||
        "This document does not appear to be a resume/CV. Please upload a valid resume.";
      setErrorMessage(msg);
    }
  };

  const handleDelete = async () => {
    if (!resume?.id) return;
    try {
      await resumeApi.deleteResume(resume.id);
      onDeleteSuccess();
    } catch (err: any) {
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.detail?.message ||
        data?.errors?.[0]?.message ||
        (typeof data?.detail === "string" ? data.detail : null) ||
        err.message ||
        "Failed to delete resume.";
      setErrorMessage(msg);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      void handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="relative w-full rounded-3xl p-6 sm:p-8 bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B9D9EC]/40 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 text-[#1E8C5A] flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#263D68] flex items-center gap-2">
              Resume Intelligence Pipeline
              {resume && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40">
                  ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-[#5A6E8C]">
              Parsing, skill ontology extraction, and predictive ATS compatibility scoring.
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-white/95 shadow-xs">
          {pipelineSteps.map((step, idx) => {
            const isCompleted = resume !== null;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  isCompleted
                    ? "bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40 shadow-xs"
                    : idx === 0
                    ? "bg-white text-[#263D68] border border-[#B9D9EC]/50 shadow-xs"
                    : "text-[#8FA3BC]"
                }`}
              >
                {step.icon}
                <span>{step.label}</span>
                {idx < pipelineSteps.length - 1 && (
                  <span className="text-[#D0DCE8] ml-1">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10">
        {resume ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-glass">
            <div className="flex items-center gap-5 w-full lg:w-auto">
              <div className="relative h-20 w-16 sm:h-24 sm:w-20 rounded-xl bg-white border border-[#A8D8C3]/50 flex flex-col items-center justify-center p-2 shadow-sm group">
                <FileText className="h-8 w-8 text-[#1E8C5A]" />
                <span className="text-[9px] font-mono text-[#1E8C5A] mt-1 uppercase font-bold">PDF · Verified</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[#263D68]">{resume.filename}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40">
                    ATS Score: {resume.quality_score?.overall_score ?? 0}/100
                  </span>
                </div>
                <p className="text-xs text-[#5A6E8C]">
                  Version {resume.version} • {(resume.file_size_bytes / 1024).toFixed(1)} KB • {resume.page_count} page(s)
                </p>
                <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                  <span className="text-[10px] text-[#5A6E8C]">Extracted:</span>
                  {resume.parsed_data?.skills?.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#D0DCE8] text-[#5A6E8C]"
                    >
                      {skill}
                    </span>
                  ))}
                  {(resume.parsed_data?.skills?.length || 0) > 5 && (
                    <span className="text-[10px] font-mono text-[#1E8C5A] font-semibold">
                      +{(resume.parsed_data?.skills?.length || 0) - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
              <button
                onClick={onPreviewClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#EEF6FB] text-[#263D68] border border-[#D0DCE8] transition-colors shadow-sm"
              >
                <Eye className="h-3.5 w-3.5 text-[#1E8C5A]" />
                <span>Preview Document</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#A8D8C3] hover:bg-[#77C4A2] text-[#1A2D52] transition-colors shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Update Resume</span>
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-[#5A6E8C] hover:text-[#E05C5C] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                title="Delete Resume"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full rounded-2xl p-8 sm:p-12 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 overflow-hidden ${
              isDragging
                ? "border-[#A8D8C3] bg-[#A8D8C3]/10"
                : "border-[#B9D9EC] bg-white/80 backdrop-blur-sm hover:border-[#72C9AD] hover:bg-white/95 shadow-xs"
            }`}
          >
            <div className="relative mb-5 h-20 w-20 flex items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-[#EEF6FB] border border-[#B9D9EC]/60 shadow-sm flex items-center justify-center text-[#1E8C5A]">
                {uploading ? (
                  <RefreshCw className="h-7 w-7 text-[#1E8C5A] animate-spin" />
                ) : (
                  <FileText className="h-7 w-7 text-[#1E8C5A]" />
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 max-w-md relative z-10">
              <h3 className="text-base sm:text-lg font-bold text-[#263D68]">
                {uploading ? "Parsing Resume with AI Ontology..." : "Drag & drop your PDF resume"}
              </h3>
              <p className="text-xs text-[#5A6E8C] leading-relaxed">
                Supports PDF up to 10MB. Instant automated parsing, skill extraction & predictive ATS intelligence.
              </p>

              {uploading && (
                <div className="w-64 h-2 bg-[#E4EDF5] rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#A8D8C3] to-[#B9D9EC] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {!uploading && (
                <div className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A8D8C3] text-[#1A2D52] font-bold text-xs shadow-sm hover:bg-[#77C4A2] transition-all">
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Resume</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#5A6E8C]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#1E8C5A]" />
              <span>Your data is encrypted, secure and private. Never shared with third parties.</span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              void handleFileSelect(e.target.files[0]);
            }
          }}
        />

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#E05C5C] text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ResumeIntelligenceCenterpiece;

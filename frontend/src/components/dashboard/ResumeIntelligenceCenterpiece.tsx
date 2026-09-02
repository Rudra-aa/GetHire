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
  { id: "parsing", label: "AI Parsing", icon: <Zap className="h-3 w-3" /> },
  { id: "skills", label: "Skill Extraction", icon: <Sparkles className="h-3 w-3" /> },
  { id: "ats", label: "ATS Analysis", icon: <ShieldCheck className="h-3 w-3" /> },
  { id: "readiness", label: "Interview Readiness", icon: <Play className="h-3 w-3" /> },
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
      setErrorMessage(err.response?.data?.detail || "Failed to parse resume. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!resume?.id) return;
    try {
      await resumeApi.deleteResume(resume.id);
      onDeleteSuccess();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Failed to delete resume.");
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
    <div className="relative w-full rounded-3xl p-6 sm:p-8 glass-card-luxury bg-[#111217]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#39FF88] flex items-center justify-center shadow-[0_0_15px_rgba(57,255,136,0.2)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Resume Intelligence Pipeline
              {resume && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#39FF88] border border-emerald-500/30">
                  ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400">
              Multimodal parsing, skill ontology extraction, and predictive ATS compatibility scoring.
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          {pipelineSteps.map((step, idx) => {
            const isCompleted = resume !== null;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  isCompleted
                    ? "bg-emerald-500/15 text-[#39FF88] border border-emerald-500/25"
                    : idx === 0
                    ? "bg-white/[0.06] text-white"
                    : "text-neutral-500"
                }`}
              >
                {step.icon}
                <span>{step.label}</span>
                {idx < pipelineSteps.length - 1 && (
                  <span className="text-neutral-600 ml-1">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10">
        {resume ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-black/30 border border-white/[0.06]">
            <div className="flex items-center gap-5 w-full lg:w-auto">
              <div className="relative h-20 w-16 sm:h-24 sm:w-20 rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-emerald-500/30 flex flex-col items-center justify-center p-2 shadow-[0_0_25px_rgba(57,255,136,0.15)] group">
                <FileText className="h-8 w-8 text-[#39FF88] drop-shadow-[0_0_8px_rgba(57,255,136,0.6)]" />
                <div className="absolute inset-x-1 h-1 bg-emerald-400 animate-pulse top-3 shadow-[0_0_8px_#39FF88]" />
                <span className="text-[9px] font-mono text-emerald-300 mt-1 uppercase font-bold">PDF · AI</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">{resume.filename}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#39FF88] border border-emerald-500/20">
                    ATS Score: {resume.quality_score?.overall_score ?? 0}/100
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Version {resume.version} • {(resume.file_size_bytes / 1024).toFixed(1)} KB • {resume.page_count} page(s)
                </p>
                <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-400">Extracted:</span>
                  {resume.parsed_data?.skills?.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {(resume.parsed_data?.skills?.length || 0) > 5 && (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      +{(resume.parsed_data?.skills?.length || 0) - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
              <button
                onClick={onPreviewClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-colors shadow-sm"
              >
                <Eye className="h-3.5 w-3.5 text-[#39FF88]" />
                <span>Preview Document</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-[#39FF88] border border-emerald-500/30 transition-colors shadow-[0_0_15px_rgba(57,255,136,0.15)]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Update Resume</span>
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
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
                ? "border-[#39FF88] bg-emerald-500/[0.08] shadow-[0_0_30px_rgba(57,255,136,0.25)]"
                : "border-white/15 bg-black/40 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]"
            }`}
          >
            <div className="relative mb-6 h-28 w-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/25 animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-3 rounded-full border border-dashed border-teal-400/35 animate-[spin_8s_linear_infinite_reverse]" />
              <div className="absolute inset-6 rounded-full bg-emerald-500/20 blur-md" />
              <div className="relative z-10 h-14 w-14 rounded-2xl bg-[#17171A] border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,136,0.3)]">
                {uploading ? (
                  <RefreshCw className="h-7 w-7 text-[#39FF88] animate-spin" />
                ) : (
                  <FileText className="h-7 w-7 text-[#39FF88]" />
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 max-w-md relative z-10">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {uploading ? "Parsing Resume with AI Ontology..." : "Drag & drop your PDF resume"}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Supports PDF up to 10MB. Instant automated parsing, skill extraction & predictive ATS intelligence.
              </p>

              {uploading && (
                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#39FF88] to-[#4DA8FF] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {!uploading && (
                <div className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#39FF88] font-bold text-xs shadow-[0_0_20px_rgba(57,255,136,0.2)] hover:bg-emerald-500/25 transition-all">
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Resume</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
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
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ResumeIntelligenceCenterpiece;

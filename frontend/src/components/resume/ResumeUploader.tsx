import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { resumeApi, type ResumeDetail } from "@/services/resumeApi";

interface ResumeUploaderProps {
  onUploadSuccess: (resume: ResumeDetail) => void;
  currentFilename?: string | undefined;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onUploadSuccess,
  currentFilename,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validation
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF document (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    setUploading(true);
    setProgress(15);
    setStatusMessage("Uploading PDF document...");

    try {
      const resume = await resumeApi.uploadResume(file, (evt) => {
        if (evt.total) {
          const pct = Math.round((evt.loaded / evt.total) * 60);
          setProgress(Math.max(15, pct));
          if (pct >= 55) {
            setStatusMessage("Extracting text and parsing structured sections...");
          }
        }
      });

      setProgress(90);
      setStatusMessage("Computing AI resume quality score...");
      setTimeout(() => {
        setProgress(100);
        setUploading(false);
        onUploadSuccess(resume);
      }, 400);
    } catch (err: any) {
      setUploading(false);
      setProgress(0);
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.detail?.message ||
        data?.errors?.[0]?.message ||
        (typeof data?.detail === "string" ? data.detail : null) ||
        err.message ||
        "This document does not appear to be a resume/CV. Please upload a valid resume.";
      setError(msg);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="application/pdf,.pdf"
        className="hidden"
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-[#1E8C5A] bg-[#A8D8C3]/20 scale-[1.01]"
            : "border-[#D0DCE8] hover:border-[#A8D8C3] bg-[#FAFBFC] hover:bg-[#F0FAF5]"
        } ${uploading ? "pointer-events-none opacity-90" : ""}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-md py-4">
            <div className="h-12 w-12 rounded-2xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/60 flex items-center justify-center animate-pulse">
              <Loader2 className="h-6 w-6 text-[#1E8C5A] animate-spin" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between text-xs text-[#5A6E8C]">
                <span>{statusMessage}</span>
                <span className="font-semibold text-[#1E8C5A]">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-[#E4EDF5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#A8D8C3] to-[#72C9AD] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#A8D8C3]/20 to-[#B9D9EC]/30 border border-[#A8D8C3]/50 flex items-center justify-center text-[#1E8C5A] shadow-sm">
              <Upload className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-[#263D68]">
                {currentFilename ? "Upload an updated resume" : "Drag & drop your PDF resume"}
              </h3>
              <p className="text-xs text-[#5A6E8C]">
                Supports PDF up to 10MB. Instant automated parsing & skill intelligence.
              </p>
            </div>
            {currentFilename && (
              <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D0DCE8] text-xs text-[#263D68]">
                <FileText className="h-3.5 w-3.5 text-[#1E8C5A]" />
                <span>Current: {currentFilename}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

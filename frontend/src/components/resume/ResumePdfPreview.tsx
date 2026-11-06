import React from "react";
import { X, Download, ExternalLink, FileText } from "lucide-react";
import { resumeApi } from "@/services/resumeApi";

interface ResumePdfPreviewProps {
  resumeId: string;
  filename: string;
  onClose: () => void;
}

export const ResumePdfPreview: React.FC<ResumePdfPreviewProps> = ({
  resumeId,
  filename,
  onClose,
}) => {
  const previewUrl = resumeApi.getPreviewUrl(resumeId);
  const downloadUrl = resumeApi.getDownloadUrl(resumeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-[0_24px_48px_-12px_rgba(38,61,104,0.18)] bg-white/95 backdrop-blur-xl border border-[#D0DCE8]/80"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4EDF5] bg-[#FAFBFC]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-[#1E8C5A]" />
            <h3 className="text-sm font-bold text-[#263D68] truncate max-w-sm sm:max-w-md">
              {filename}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F0F5F9] text-[#263D68] border border-[#D0DCE8] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Tab</span>
            </a>
            <a
              href={downloadUrl}
              download={filename}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#A8D8C3]/20 hover:bg-[#A8D8C3]/30 text-[#1E8C5A] border border-[#A8D8C3]/60 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-colors ml-2 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 w-full bg-[#F7F9FC] overflow-hidden">
          <iframe
            src={previewUrl}
            title={filename}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

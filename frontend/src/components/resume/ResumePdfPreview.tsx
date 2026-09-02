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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{
          background: "#111115",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-gold-400" />
            <h3 className="text-sm font-bold text-neutral-100 truncate max-w-sm sm:max-w-md">
              {filename}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Tab</span>
            </a>
            <a
              href={previewUrl}
              download={filename}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 border border-gold-400/30 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 w-full bg-neutral-900 overflow-hidden">
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

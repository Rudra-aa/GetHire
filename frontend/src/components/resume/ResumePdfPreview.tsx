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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-amber-500 dark:text-gold-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 truncate max-w-sm sm:max-w-md">
              {filename}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Tab</span>
            </a>
            <a
              href={downloadUrl}
              download={filename}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-gold-300 border border-amber-500/30 dark:border-gold-400/30 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ml-2 cursor-pointer"
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

import React, { useState } from "react";
import { RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, X, Loader2 } from "lucide-react";
import { userApi } from "@/services/userApi";

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSuccess: () => void;
}

export const ResetProgressModal: React.FC<ResetProgressModalProps> = ({
  isOpen,
  onClose,
  onResetSuccess,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    setError(null);

    try {
      await userApi.resetProgress();
      setIsResetting(false);
      onClose();
      onResetSuccess();
    } catch (err: any) {
      setIsResetting(false);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset progress. Please try again.";
      setError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full p-6 sm:p-7 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_24px_48px_-12px_rgba(38,61,104,0.15),0_8px_20px_-4px_rgba(38,61,104,0.08)] flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isResetting}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-colors"
          title="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-[#263D68]">
              Start from Beginning / Reset Progress
            </h3>
            <p className="text-xs text-[#5A6E8C] mt-1 leading-relaxed">
              Safely reset your active progression state to begin a fresh technical assessment and mock interview.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Impact Breakdown Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* What gets reset */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-rose-700 font-mono text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>What will be reset:</span>
            </div>
            <ul className="text-[11px] text-[#5A6E8C] flex flex-col gap-1.5 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500">•</span>
                <span>Active / in-progress interview sessions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500">•</span>
                <span>Active technical assessment attempts</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500">•</span>
                <span>Milestone tracker returns to Step 1</span>
              </li>
            </ul>
          </div>

          {/* What is preserved */}
          <div className="p-4 rounded-xl bg-[#F0FAF5] border border-[#A8D8C3]/50 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[#1E8C5A] font-mono text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>What is preserved:</span>
            </div>
            <ul className="text-[11px] text-[#5A6E8C] flex flex-col gap-1.5 font-sans">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#1E8C5A] shrink-0 mt-0.5" />
                <span>Account & login credentials</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#1E8C5A] shrink-0 mt-0.5" />
                <span>Candidate profile & target role</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#1E8C5A] shrink-0 mt-0.5" />
                <span>Completed Evaluation Reports</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#1E8C5A] shrink-0 mt-0.5" />
                <span>Candidate Evolution history</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#1E8C5A] shrink-0 mt-0.5" />
                <span>Uploaded resume documents</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E4EDF5]">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl bg-[#FAFBFC] hover:bg-[#F0F5F9] border border-[#D0DCE8] text-xs font-mono font-bold text-[#263D68] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Resetting Progress...</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-white" />
                <span>Yes, Reset & Start Fresh</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetProgressModal;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/15 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isResetting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Start from Beginning / Reset Progress
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Safely reset your active progression state to begin a fresh technical assessment and AI mock interview.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Impact Breakdown Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* What gets reset */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>What will be reset:</span>
            </div>
            <ul className="text-[11px] text-slate-700 dark:text-neutral-300 flex flex-col gap-1.5 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 dark:text-rose-400">•</span>
                <span>Active / in-progress interview sessions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 dark:text-rose-400">•</span>
                <span>Active technical assessment attempts</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 dark:text-rose-400">•</span>
                <span>Milestone tracker returns to Step 1</span>
              </li>
            </ul>
          </div>

          {/* What is preserved */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-[#39FF88] font-mono text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>What is preserved:</span>
            </div>
            <ul className="text-[11px] text-slate-700 dark:text-neutral-300 flex flex-col gap-1.5 font-sans">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-[#39FF88] shrink-0 mt-0.5" />
                <span>Account & login credentials</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-[#39FF88] shrink-0 mt-0.5" />
                <span>Candidate profile & target role</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-[#39FF88] shrink-0 mt-0.5" />
                <span>Completed Evaluation Reports</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-[#39FF88] shrink-0 mt-0.5" />
                <span>Candidate Evolution history</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-[#39FF88] shrink-0 mt-0.5" />
                <span>Uploaded resume documents</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-extrabold text-xs font-display flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                <span>Resetting Progress...</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-black" />
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

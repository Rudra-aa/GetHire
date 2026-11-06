import React from "react";
import { Sparkles, CheckCircle2, XCircle, Unlock, ArrowRight } from "lucide-react";

interface KnowledgeProfileModalProps {
  score: number;
  strongConcepts: string[];
  weakConcepts: string[];
  onProceedToInterview: () => void;
}

export const KnowledgeProfileModal: React.FC<KnowledgeProfileModalProps> = ({
  score,
  strongConcepts,
  weakConcepts,
  onProceedToInterview,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="max-w-xl w-full p-8 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_24px_48px_-12px_rgba(38,61,104,0.15)] flex flex-col gap-6 text-[#263D68] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#E4EDF5]">
          <div className="p-3 rounded-2xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/60 text-[#1E8C5A]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-[#263D68]">Knowledge Profile Generated</h2>
            <p className="text-xs text-[#5A6E8C] font-sans">
              Technical assessment complete. Your blueprint has been synthesized for the mock interview.
            </p>
          </div>
        </div>

        {/* Score Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] flex flex-col items-center justify-center gap-1 text-center shadow-sm">
            <span className="text-[10px] font-mono text-[#5A6E8C] uppercase">Knowledge Score</span>
            <span className="text-3xl font-black font-display text-[#263D68]">{score}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F0FAF5] border border-[#A8D8C3]/60 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-[#1E8C5A] uppercase flex items-center gap-1 font-bold">
              <CheckCircle2 className="h-3 w-3" /> Strong Domains
            </span>
            <div className="flex flex-wrap gap-1">
              {strongConcepts.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white text-[#1E8C5A] border border-[#A8D8C3]/60 text-[10px] font-mono font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-rose-700 uppercase flex items-center gap-1 font-bold">
              <XCircle className="h-3 w-3" /> Focus Gaps
            </span>
            <div className="flex flex-wrap gap-1">
              {weakConcepts.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200 text-[10px] font-mono font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Unlock Alert */}
        <div className="p-4 rounded-xl bg-[#B9D9EC]/20 border border-[#B9D9EC] flex items-center justify-between gap-3 text-xs font-sans text-[#263D68]">
          <div className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-[#2B7FAD] shrink-0" />
            <span><strong>Interview Unlocked:</strong> Your Knowledge Profile will guide the practice simulation questions.</span>
          </div>
        </div>

        {/* Proceed CTA */}
        <button
          onClick={onProceedToInterview}
          className="w-full py-4 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-extrabold text-sm font-display shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Launch Interview Simulator</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default KnowledgeProfileModal;

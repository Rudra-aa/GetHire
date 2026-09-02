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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-gradient-to-b from-[#0d1322] to-[#070a14] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 flex flex-col gap-6 text-white animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">Knowledge Profile Generated</h2>
            <p className="text-xs text-neutral-400 font-sans">
              Technical assessment complete. Your blueprint has been synthesized for the AI Interview.
            </p>
          </div>
        </div>

        {/* Score Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Knowledge Score</span>
            <span className="text-3xl font-black font-display text-cyan-400">{score}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-emerald-300 uppercase flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Strong Domains
            </span>
            <div className="flex flex-wrap gap-1">
              {strongConcepts.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[10px] font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-rose-300 uppercase flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Focus Gaps
            </span>
            <div className="flex flex-wrap gap-1">
              {weakConcepts.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[10px] font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Unlock Alert */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between gap-3 text-xs font-sans text-cyan-200">
          <div className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-cyan-400 shrink-0" />
            <span><strong>AI Interview Unlocked:</strong> Your Knowledge Profile will guide the AI recruiter's conversational questions.</span>
          </div>
        </div>

        {/* Proceed CTA */}
        <button
          onClick={onProceedToInterview}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold text-sm font-display hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Launch AI Interview Center</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default KnowledgeProfileModal;

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Brain } from "lucide-react";

interface ProcessingReportViewProps {
  onComplete: () => void;
}

const STEPS = [
  "Uploading HD Audio & Transcript Data",
  "Building Turn-Level Interview Memory",
  "Evaluating Technical Reasoning against Knowledge Blueprint",
  "Evaluating Communication & STAR Methodology Structure",
  "Correlating FaceSense Composure Telemetry",
  "Processing Interview Integrity Events",
  "Performing Resume Correlation Analysis",
  "Performing Assessment Knowledge Profile Correlation",
  "Synthesizing Evidence-Backed Excerpt Quotes",
  "Constructing Executive Summary & Verdict",
  "Building Recruiter Portfolio Snapshot",
  "Computing Multi-Engine HireScore",
  "Updating Candidate Evolution Growth Curve",
];

export const ProcessingReportView: React.FC<ProcessingReportViewProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep < STEPS.length) {
      const timer = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 450);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeStep, onComplete]);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-gradient-to-b from-[#0e121d] to-[#07090e] border border-gold-400/30 shadow-2xl shadow-gold-500/10 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-gold-400/20" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-t-gold-400 animate-spin" />
            <Brain className="absolute inset-0 m-auto h-7 w-7 text-gold-400" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Synthesizing AI Evaluation</h2>
          <p className="text-xs text-neutral-400 font-sans">
            Please hold on while GetHire AI completes multi-layer analysis of your interview session.
          </p>
        </div>

        <div className="flex flex-col gap-2 py-2 max-h-80 overflow-y-auto pr-1">
          {STEPS.map((stepText, idx) => {
            const isFinished = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all duration-200 ${
                  isFinished
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : isCurrent
                    ? "bg-gold-400/15 border-gold-400/40 text-gold-300 font-bold"
                    : "bg-white/[0.02] border-white/10 text-neutral-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 text-gold-400 animate-spin shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-neutral-700 text-[9px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                  )}
                  <span className="truncate max-w-xs">{stepText}</span>
                </div>
                {isFinished && <span className="text-[10px] text-emerald-400 font-bold">Complete</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessingReportView;

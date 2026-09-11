import React, { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle2, Brain, AlertCircle, RefreshCw } from "lucide-react";
import { evaluationApi } from "@/services/evaluationApi";

interface ProcessingReportViewProps {
  sessionId: string;
  onComplete: (sessionId: string) => void;
}

// Steps shown during processing — cosmetic only, run in parallel to real API call
const STEPS = [
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

// One step advances every ~450ms so the animation finishes in ~5.5s
const STEP_INTERVAL_MS = 460;
// Maximum time to wait for backend evaluation before showing an error
const EVAL_TIMEOUT_MS = 60_000;

export const ProcessingReportView: React.FC<ProcessingReportViewProps> = ({
  sessionId,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const runEvaluation = useCallback(async () => {
    setError(null);
    setIsRetrying(false);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Evaluation timed out after 60 seconds. Please try again.")),
        EVAL_TIMEOUT_MS
      )
    );

    try {
      let result = null;

      if (sessionId && sessionId !== "sess-ai-demo") {
        // First check if evaluation already exists
        result = await Promise.race([
          evaluationApi.getSessionEvaluations(sessionId).catch(() => null),
          timeoutPromise,
        ]);

        // If no existing evaluations, trigger generation
        if (!result || !result.evaluations || result.evaluations.length === 0) {
          result = await Promise.race([
            evaluationApi.evaluateSessionAll(sessionId).catch(() => null),
            timeoutPromise,
          ]);
        }
      } else {
        // No valid session — fall back to latest evaluation
        result = await Promise.race([
          evaluationApi.getLatestEvaluation().catch(() => null),
          timeoutPromise,
        ]);
      }

      onComplete(sessionId);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Evaluation could not be completed. Please try again.";
      setError(message);
    }
  }, [sessionId, onComplete]);

  // Advance the cosmetic step counter every STEP_INTERVAL_MS
  useEffect(() => {
    if (error) return; // Freeze steps on error
    if (activeStep >= STEPS.length) return; // All steps shown

    const timer = setTimeout(() => {
      setActiveStep((prev) => prev + 1);
    }, STEP_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [activeStep, error]);

  // Trigger real evaluation once on mount
  useEffect(() => {
    void runEvaluation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-[#0e121d] border border-rose-500/30 shadow-2xl flex flex-col items-center gap-6 text-center">
          <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30">
            <AlertCircle className="h-10 w-10 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Evaluation Generation Failed</h2>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsRetrying(true);
                setActiveStep(0);
                void runEvaluation();
              }}
              disabled={isRetrying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39FF88] text-black font-bold text-sm hover:bg-[#32e078] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              Retry Evaluation
            </button>
            <button
              onClick={() => onComplete(sessionId)}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-sm hover:bg-white/10 transition-all"
            >
              View Results Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-gradient-to-b from-[#0e121d] to-[#07090e] border border-amber-400/30 shadow-2xl shadow-amber-500/10 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-amber-400/20" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-t-amber-400 animate-spin" />
            <Brain className="absolute inset-0 m-auto h-7 w-7 text-amber-400" />
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
                    ? "bg-amber-400/15 border-amber-400/40 text-amber-300 font-bold"
                    : "bg-white/[0.02] border-white/10 text-neutral-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
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

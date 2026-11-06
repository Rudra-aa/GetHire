import React, { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle2, Brain, AlertCircle, RefreshCw } from "lucide-react";
import { evaluationApi } from "@/services/evaluationApi";
import { evaluationReportApi } from "@/services/evaluationReportApi";
import { faceSenseApi } from "@/services/faceSenseApi";

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

      // Finalize visual presentation & non-verbal session analytics
      if (sessionId && sessionId !== "sess-ai-demo") {
        try {
          await faceSenseApi.finishSession(sessionId);
        } catch (fsErr) {
          console.warn("[ProcessingReportView] finishSession notice:", fsErr);
        }
      }

      // Generate immutable evaluation report snapshot
      let finalReportId = sessionId;
      try {
        const report = await evaluationReportApi.generateReport();
        if (report?.id) {
          finalReportId = report.id;
        }
      } catch (repErr) {
        console.warn("[ProcessingReportView] generateReport notice:", repErr);
      }

      onComplete(finalReportId);
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
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] text-[#263D68] flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl flex flex-col items-center gap-6 text-center">
          <div className="p-4 rounded-full bg-rose-50 border border-rose-200">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#263D68] font-display">Evaluation Generation Failed</h2>
            <p className="text-sm text-[#5A6E8C] mt-2 leading-relaxed">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsRetrying(true);
                setActiveStep(0);
                void runEvaluation();
              }}
              disabled={isRetrying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A8D8C3] text-[#1E4D38] border border-[#72C9AD] font-bold text-sm hover:bg-[#97ccb6] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              Retry Evaluation
            </button>
            <button
              onClick={() => onComplete(sessionId)}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#D0DCE8] text-[#263D68] font-bold text-sm hover:bg-[#F0F5F9] transition-all"
            >
              View Results Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#263D68] flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_24px_48px_-12px_rgba(38,61,104,0.15)] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[#A8D8C3]/30" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-t-[#1E8C5A] animate-spin" />
            <Brain className="absolute inset-0 m-auto h-7 w-7 text-[#1E8C5A]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-[#263D68]">Synthesizing AI Evaluation</h2>
          <p className="text-xs text-[#5A6E8C] font-sans">
            Please hold on while GetHire completes multi-layer analysis of your interview session.
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
                    ? "bg-[#F0FAF5] border-[#A8D8C3] text-[#1E8C5A]"
                    : isCurrent
                    ? "bg-[#B9D9EC]/20 border-[#B9D9EC] text-[#263D68] font-bold"
                    : "bg-[#FAFBFC] border-[#E4EDF5] text-[#8FA3BC]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1E8C5A] shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 text-[#1E8C5A] animate-spin shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-[#D0DCE8] text-[9px] flex items-center justify-center text-[#8FA3BC]">
                      {idx + 1}
                    </span>
                  )}
                  <span className="truncate max-w-xs">{stepText}</span>
                </div>
                {isFinished && <span className="text-[10px] text-[#1E8C5A] font-bold">Complete</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessingReportView;

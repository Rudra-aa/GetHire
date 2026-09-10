import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { evaluationApi, type BatchEvaluationResponse } from "@/services/evaluationApi";
import { assessmentApi } from "@/services/assessmentApi";
import { interviewApi } from "@/services/interviewApi";
import { HeroSummaryCard } from "@/components/evaluation/HeroSummaryCard";
import { PerformanceBreakdown } from "@/components/evaluation/PerformanceBreakdown";
import { HiringVerdictCard } from "@/components/evaluation/HiringVerdictCard";
import FaceSenseReportSection from "@/components/facesense/FaceSenseReportSection";
import IntelligenceReportSection from "@/components/intelligence/IntelligenceReportSection";

export const EvaluationPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [batchData, setBatchData] = useState<BatchEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState<string>("");
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  const fetchOrGenerate = useCallback(async () => {
    setLoading(true);
    setIsLocked(false);
    setLockMessage("");

    try {
      // 1. Resolve effective session ID
      let effectiveSessionId = sessionId;
      let hasCompletedInterview = false;

      const history = await interviewApi.getHistory(10, 0).catch(() => null);
      const completedSessions = history?.sessions?.filter((s) => s.status === "completed") || [];
      hasCompletedInterview = completedSessions.length > 0;

      if (!effectiveSessionId || effectiveSessionId === "latest" || effectiveSessionId === "sess-ai-demo") {
        if (completedSessions.length > 0 && completedSessions[0]) {
          effectiveSessionId = completedSessions[0].id;
        } else if (history?.sessions?.length && history.sessions[0]) {
          effectiveSessionId = history.sessions[0].id;
        } else {
          effectiveSessionId = "";
        }
      }

      setActiveSessionId(effectiveSessionId || "");

      // 2. Check dual completion requirement
      const latestAssessment = await assessmentApi.getLatestAssessment().catch(() => null);
      const isAssessmentDone = !!(latestAssessment && typeof latestAssessment.score === "number");
      const isInterviewDone = hasCompletedInterview || (!!effectiveSessionId && effectiveSessionId !== "sess-ai-demo");

      if (!isAssessmentDone || !isInterviewDone) {
        setIsLocked(true);
        if (!isAssessmentDone && !isInterviewDone) {
          setLockMessage("Complete both Technical Assessment and AI Interview to unlock your unified Evaluation Report.");
        } else if (!isAssessmentDone) {
          setLockMessage("Complete your Technical Assessment to unlock your unified Evaluation Report.");
        } else {
          setLockMessage("Complete at least one AI Mock Interview to unlock your unified Evaluation Report.");
        }
        setLoading(false);
        return;
      }

      // 3. Fetch or compute evaluation data for the resolved session
      if (effectiveSessionId && effectiveSessionId !== "sess-ai-demo") {
        let existing = await evaluationApi.getSessionEvaluations(effectiveSessionId).catch(() => null);
        if (existing && existing.evaluations && existing.evaluations.length > 0) {
          setBatchData(existing);
        } else {
          const generated = await evaluationApi.evaluateSessionAll(effectiveSessionId).catch(() => null);
          if (generated && generated.evaluations && generated.evaluations.length > 0) {
            setBatchData(generated);
          } else {
            // Fallback to latest endpoint
            const latestEval = await evaluationApi.getLatestEvaluation().catch(() => null);
            setBatchData(latestEval);
          }
        }
      } else {
        const latestEval = await evaluationApi.getLatestEvaluation().catch(() => null);
        setBatchData(latestEval);
      }
    } catch (err) {
      console.error("Evaluation load error:", err);
      setBatchData(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void fetchOrGenerate();
  }, [fetchOrGenerate]);

  const candidateName = user?.full_name?.split(" ")[0] || "Candidate";
  const targetRole = user?.target_role || "Full Stack Developer";

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold font-display text-[#39FF88]">Unified Evaluation Report</h1>
          <p className="text-xs text-neutral-400">Synthesized evidence from Technical Assessment & AI Interview Studio.</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-300 hover:bg-white/10 transition-all">
          Return to Workspace
        </button>
      </div>

      {loading && (
        <div className="py-32 flex flex-col items-center justify-center gap-4 text-neutral-400 font-mono text-xs">
          <Loader2 className="h-8 w-8 text-[#39FF88] animate-spin" />
          <span>Synthesizing Evaluation Telemetry...</span>
        </div>
      )}

      {!loading && isLocked && (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5">
          <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Evaluation Center Locked</h2>
          <p className="text-sm text-neutral-300 font-sans leading-relaxed">
            {lockMessage || "Complete both Technical Assessment and AI Interview to unlock Evaluation."}
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate("/assessment")} className="px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs font-display hover:bg-cyan-300 transition-all flex items-center gap-1.5">
              <span>Launch Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => navigate("/interview")} className="px-5 py-2.5 rounded-xl bg-gold-400 text-black font-bold text-xs font-display hover:bg-gold-300 transition-all flex items-center gap-1.5">
              <span>Launch Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {!loading && !isLocked && batchData && batchData.evaluations && batchData.evaluations.length > 0 && (
        <div className="flex flex-col gap-6">
          <HeroSummaryCard
            overallScore={batchData.overall_interview_score}
            totalEvaluated={batchData.total_evaluated}
            sessionId={batchData.session_id || activeSessionId}
            candidateName={candidateName}
            targetRole={targetRole}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <PerformanceBreakdown dimensions={batchData.average_dimensions} />
            </div>
            <div className="lg:col-span-4">
              <HiringVerdictCard overallScore={batchData.overall_interview_score} />
            </div>
          </div>
          <FaceSenseReportSection sessionId={activeSessionId || batchData.session_id} />
          <IntelligenceReportSection sessionId={activeSessionId || batchData.session_id} />
        </div>
      )}

      {!loading && !isLocked && (!batchData || !batchData.evaluations || batchData.evaluations.length === 0) && (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">No Conversational Evaluation Turns Found</h2>
          <p className="text-sm text-neutral-300 font-sans leading-relaxed">
            The selected interview session does not contain recorded candidate answers to evaluate yet. Complete an interview round to generate your diagnostic breakdown.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate("/interview")} className="px-5 py-2.5 rounded-xl bg-[#39FF88] text-black font-extrabold text-xs font-display hover:bg-[#32e078] transition-all flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Start AI Mock Interview</span>
            </button>
            <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs font-display hover:bg-white/10 transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;

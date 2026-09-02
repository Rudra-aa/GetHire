import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { evaluationApi, type BatchEvaluationResponse } from "@/services/evaluationApi";
import { assessmentApi } from "@/services/assessmentApi";
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

  const fetchOrGenerate = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setIsLocked(false);

    try {
      // Check dual completion requirement
      const latestAssessment = await assessmentApi.getLatestAssessment().catch(() => null);
      const isAssessmentDone = latestAssessment?.score !== undefined;

      if (!isAssessmentDone && sessionId !== "sess-ai-demo") {
        setIsLocked(true);
        setLoading(false);
        return;
      }

      const existing = await evaluationApi.getSessionEvaluations(sessionId).catch(() => null);
      if (existing && existing.evaluations && existing.evaluations.length > 0) {
        setBatchData(existing);
      } else {
        const generated = await evaluationApi.evaluateSessionAll(sessionId).catch(() => null);
        setBatchData(generated);
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
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-300">
          Return to Workspace
        </button>
      </div>

      {isLocked && (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5">
          <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Evaluation Center Locked</h2>
          <p className="text-sm text-neutral-300 font-sans leading-relaxed">
            Complete both <strong>Technical Assessment</strong> and <strong>AI Interview</strong> to unlock Evaluation.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate("/assessment")} className="px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs font-display">
              Launch Assessment
            </button>
            <button onClick={() => navigate("/interview")} className="px-5 py-2.5 rounded-xl bg-gold-400 text-black font-bold text-xs font-display">
              Launch Interview
            </button>
          </div>
        </div>
      )}

      {!loading && !isLocked && batchData && (
        <div className="flex flex-col gap-6">
          <HeroSummaryCard
            overallScore={batchData.overall_interview_score}
            totalEvaluated={batchData.total_evaluated}
            sessionId={batchData.session_id}
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
          <FaceSenseReportSection sessionId={sessionId || batchData.session_id} />
          <IntelligenceReportSection sessionId={sessionId || batchData.session_id} />
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;

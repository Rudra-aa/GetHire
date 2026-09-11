import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { evaluationReportApi, type EvaluationReportDetail } from "@/services/evaluationReportApi";

import { HeroSummaryCard } from "@/components/evaluation/HeroSummaryCard";
import { PerformanceBreakdown } from "@/components/evaluation/PerformanceBreakdown";
import { HiringVerdictCard } from "@/components/evaluation/HiringVerdictCard";

export const EvaluationPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [report, setReport] = useState<EvaluationReportDetail | null>(null);
  const [history, setHistory] = useState<EvaluationReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (reportId) {
        // Load specific report
        const data = await evaluationReportApi.getReportById(reportId);
        setReport(data);
      } else {
        // Load history list
        const historyData = await evaluationReportApi.getHistory();
        setHistory(historyData);
      }
    } catch (err: any) {
      console.error("Evaluation load error:", err);
      setError(err?.response?.data?.message || "Evaluation report not found.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const candidateName = user?.full_name?.split(" ")[0] || "Candidate";
  const targetRole = user?.target_role || "Full Stack Developer";

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-neutral-400 font-mono text-xs">
        <Loader2 className="h-8 w-8 text-[#39FF88] animate-spin" />
        <span>Loading Evaluation Data...</span>
      </div>
    );
  }

  // === RENDER SPECIFIC REPORT ===
  if (reportId) {
    if (!report) {
      return (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Evaluation Report Not Found</h2>
          <p className="text-sm text-neutral-300 font-sans leading-relaxed">
            {error || "The requested evaluation report does not exist."}
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate("/evaluation")} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs hover:bg-white/10 transition-all">
              View Evaluation History
            </button>
          </div>
        </div>
      );
    }

    const mockDimensions = {
      technical_accuracy: report.technical_accuracy,
      concept_coverage: report.concept_coverage,
      problem_solving: report.problem_solving,
      communication: report.communication,
      completeness: report.completeness,
    };

    return (
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-bold font-display text-[#39FF88]">Immutable Evaluation Report #{report.evaluation_number}</h1>
            <p className="text-xs text-neutral-400">Snapshot created on {new Date(report.created_at).toLocaleString()}</p>
          </div>
          <button onClick={() => navigate("/evaluation")} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-300 hover:bg-white/10 transition-all">
            ← Back to History
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <HeroSummaryCard
            overallScore={report.hirescore}
            totalEvaluated={0}
            sessionId={report.interview_session_id}
            candidateName={candidateName}
            targetRole={targetRole}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <PerformanceBreakdown dimensions={mockDimensions} />
            </div>
            <div className="lg:col-span-4">
              <HiringVerdictCard overallScore={report.hirescore} />
            </div>
          </div>
          
          {/* Qualitative Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#39FF88]" /> Strengths
              </h3>
              <ul className="flex flex-col gap-3">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/10">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" /> Areas for Growth
              </h3>
              <ul className="flex flex-col gap-3">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/10">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === RENDER HISTORY CENTER ===
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold font-display text-white">Evaluation Center</h1>
          <p className="text-xs text-neutral-400">Complete historical record of all your evaluation cycles.</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-300 hover:bg-white/10 transition-all">
          Return to Dashboard
        </button>
      </div>

      {history.length === 0 ? (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileText className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">No Evaluations Yet</h2>
          <p className="text-sm text-neutral-300 font-sans leading-relaxed">
            You haven't completed a full evaluation cycle yet. To generate your first Immutable Evaluation Report, complete both a Technical Assessment and an AI Mock Interview.
          </p>
          <div className="flex gap-3 pt-2">
             <button onClick={() => navigate("/assessment")} className="px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5">
               Start Assessment
             </button>
             <button onClick={() => navigate("/interview")} className="px-5 py-2.5 rounded-xl bg-gold-400 text-black font-bold text-xs hover:bg-gold-300 transition-all flex items-center gap-1.5">
               Start Interview
             </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((h, i) => (
            <div key={h.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] hover:border-white/20 transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">Report #{h.evaluation_number}</h3>
                  {i === 0 && <span className="px-2 py-0.5 rounded-md bg-[#39FF88]/20 text-[#39FF88] border border-[#39FF88]/30 text-[10px] font-bold uppercase tracking-wider">Latest</span>}
                </div>
                <p className="text-xs text-neutral-400">Date: {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString()}</p>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">HireScore</span>
                  <span className="text-xl font-bold text-white font-mono">{h.hirescore}</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">Assessment</span>
                  <span className="text-xl font-bold text-white font-mono">{h.assessment_score}</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">Interview</span>
                  <span className="text-xl font-bold text-white font-mono">{h.interview_score}</span>
                </div>
                <button 
                  onClick={() => navigate(`/evaluation/${h.id}`)}
                  className="px-5 py-2 rounded-xl bg-[#39FF88] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#32e078] transition-all ml-4"
                >
                  View Report <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;

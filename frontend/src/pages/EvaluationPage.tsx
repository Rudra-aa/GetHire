import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { evaluationReportApi, type EvaluationReportDetail } from "@/services/evaluationReportApi";
import { evaluationApi } from "@/services/evaluationApi";

import { HeroSummaryCard } from "@/components/evaluation/HeroSummaryCard";
import { PerformanceBreakdown } from "@/components/evaluation/PerformanceBreakdown";
import { HiringVerdictCard } from "@/components/evaluation/HiringVerdictCard";
import { VisualPresentationSection } from "@/components/facesense/VisualPresentationSection";

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
        // 1. Try loading specific immutable report
        try {
          const data = await evaluationReportApi.getReportById(reportId);
          setReport(data);
        } catch {
          // 2. Fall back to session batch evaluations if direct report doc not found
          const sessData = await evaluationApi.getSessionEvaluations(reportId);
          if (sessData && sessData.evaluations && sessData.evaluations.length > 0) {
            const dims = sessData.average_dimensions;
            const strengths: string[] = [];
            const weaknesses: string[] = [];
            sessData.evaluations.forEach((ev) => {
              ev.strengths?.forEach((s) => {
                if (!strengths.includes(s)) strengths.push(s);
              });
              ev.weaknesses?.forEach((w) => {
                if (!weaknesses.includes(w)) weaknesses.push(w);
              });
            });

            const fallbackReport: EvaluationReportDetail = {
              id: reportId,
              candidate_id: user?.id || "",
              evaluation_number: 0,
              assessment_session_id: "none",
              interview_session_id: reportId,
              assessment_score: 0,
              interview_score: sessData.overall_interview_score,
              technical_accuracy: dims.technical_accuracy,
              concept_coverage: dims.concept_coverage,
              problem_solving: dims.problem_solving,
              communication: dims.communication,
              completeness: dims.completeness,
              hirescore: sessData.overall_interview_score,
              readiness: {
                readiness_percentage: Math.min(100, Math.round(sessData.overall_interview_score)),
                verdict: sessData.overall_interview_score >= 80 ? "Offer Ready" : sessData.overall_interview_score >= 65 ? "Hire" : "Needs Improvement",
                confidence_level: "High",
                summary: "Candidate successfully demonstrated domain technical competence across architectural concepts.",
              },
              strengths: strengths.slice(0, 5),
              weaknesses: weaknesses.slice(0, 5),
              recommendations: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setReport(fallbackReport);
          } else {
            throw new Error("Evaluation report not found.");
          }
        }
      } else {
        // Load history list
        const historyData = await evaluationReportApi.getHistory();
        setHistory(historyData);
      }
    } catch (err: any) {
      console.error("Evaluation load error:", err);
      setError(err?.response?.data?.message || err?.message || "Evaluation report not found.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [reportId, user?.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const candidateName = user?.full_name?.split(" ")[0] || "Candidate";
  const targetRole = user?.target_role || "Full Stack Developer";

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-[#5A6E8C] font-mono text-xs">
        <Loader2 className="h-8 w-8 text-[#1E8C5A] animate-spin" />
        <span>Loading Evaluation Data...</span>
      </div>
    );
  }

  // === RENDER SPECIFIC REPORT ===
  if (reportId) {
    if (!report) {
      return (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5 p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-[#263D68] font-display">Evaluation Report Not Found</h2>
          <p className="text-sm text-[#5A6E8C] font-sans leading-relaxed">
            {error || "The requested evaluation report does not exist."}
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate("/evaluation")} className="px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white border border-[#D0DCE8]/80 text-[#263D68] font-bold text-xs transition-all cursor-pointer shadow-sm">
              View Evaluation History
            </button>
          </div>
        </div>
      );
    }

    const dimensions = {
      technical_accuracy: report.technical_accuracy,
      concept_coverage: report.concept_coverage,
      problem_solving: report.problem_solving,
      communication: report.communication,
      completeness: report.completeness,
    };

    const isInterviewOnly = report.assessment_session_id === "none" || !report.assessment_session_id;

    return (
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#E4EDF5] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-[#263D68]">
                {isInterviewOnly
                  ? "Interview-Only Evaluation Report"
                  : `Immutable Evaluation Report #${report.evaluation_number}`}
              </h1>
              {isInterviewOnly && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                  Interview-Only
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A6E8C]">
              {isInterviewOnly
                ? "Candidate interview session evaluation • Complete a Technical Assessment to produce an official combined Evaluation Report in your progression."
                : `Immutable snapshot created on ${new Date(report.created_at).toLocaleString()}`}
            </p>
          </div>
          <button onClick={() => navigate("/evaluation")} className="px-4 py-2 rounded-xl bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-xs font-bold text-[#263D68] transition-all cursor-pointer shadow-sm">
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
              <PerformanceBreakdown dimensions={dimensions} />
            </div>
            <div className="lg:col-span-4">
              <HiringVerdictCard overallScore={report.hirescore} />
            </div>
          </div>
          
          {/* Qualitative Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1E8C5A]" /> Strengths
              </h3>
              <ul className="flex flex-col gap-3">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-[#263D68] bg-[#FAFBFC]/80 backdrop-blur-sm p-3 rounded-xl border border-[#E4EDF5]">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" /> Areas for Growth
              </h3>
              <ul className="flex flex-col gap-3">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-[#263D68] bg-[#FAFBFC]/80 backdrop-blur-sm p-3 rounded-xl border border-[#E4EDF5]">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual Presentation & Non-Verbal Communication Coaching Section */}
          <VisualPresentationSection
            data={report.visual_presentation}
            sessionId={report.interview_session_id}
          />
        </div>
      </div>
    );
  }

  // === RENDER HISTORY CENTER ===
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[#E4EDF5] pb-4">
        <div>
          <h1 className="text-xl font-bold font-display text-[#263D68]">Evaluation Center</h1>
          <p className="text-xs text-[#5A6E8C]">Complete historical record of all your evaluation cycles.</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white border border-[#D0DCE8]/80 text-xs font-bold text-[#263D68] transition-all cursor-pointer shadow-sm">
          Return to Dashboard
        </button>
      </div>

      {history.length === 0 ? (
        <div className="py-24 max-w-lg mx-auto flex flex-col items-center text-center gap-5 p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
            <FileText className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-[#263D68] font-display">No Evaluations Yet</h2>
          <p className="text-sm text-[#5A6E8C] font-sans leading-relaxed">
            You haven't completed a full evaluation cycle yet. To generate your first Immutable Evaluation Report, complete both a Technical Assessment and a Mock Interview.
          </p>
          <div className="flex gap-3 pt-2">
             <button onClick={() => navigate("/assessment")} className="px-5 py-2.5 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
               Start Assessment
             </button>
             <button onClick={() => navigate("/interview")} className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#263D68] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
               Start Interview
             </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((h, i) => (
            <div key={h.id} className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/95 hover:border-[#A8D8C3] shadow-glass transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#263D68]">Report #{h.evaluation_number}</h3>
                  {i === 0 && <span className="px-2 py-0.5 rounded-md bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/50 text-[10px] font-bold uppercase tracking-wider">Latest</span>}
                </div>
                <p className="text-xs text-[#5A6E8C]">Date: {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString()}</p>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-[#5A6E8C] font-bold uppercase">HireScore</span>
                  <span className="text-xl font-bold text-[#263D68] font-mono">{h.hirescore}</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-[#5A6E8C] font-bold uppercase">Assessment</span>
                  <span className="text-xl font-bold text-[#263D68] font-mono">{h.assessment_score}</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-[#5A6E8C] font-bold uppercase">Interview</span>
                  <span className="text-xl font-bold text-[#263D68] font-mono">{h.interview_score}</span>
                </div>
                <button 
                  onClick={() => navigate(`/evaluation/${h.id}`)}
                  className="px-5 py-2 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-bold text-xs flex items-center gap-1.5 transition-all ml-4 cursor-pointer shadow-sm"
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

import React, { useEffect, useState } from "react";
import { CheckSquare, Sparkles, CheckCircle2, Unlock, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assessmentApi, type AssessmentSession } from "@/services/assessmentApi";

export const AssessmentCard: React.FC = () => {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentSession | null>(null);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const data = await assessmentApi.getLatestAssessment();
        setAssessment(data);
      } catch {
        // No previous assessment
      }
    };
    void loadLatest();
  }, []);

  const isCompleted = assessment?.score !== undefined;

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-500/[0.05] via-white/[0.03] to-white/[0.01] border border-cyan-500/20 backdrop-blur flex flex-col gap-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-display">Stage 1: Technical Assessment Center</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                Knowledge Profile Generator
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Proctored 20-question test evaluating coding, system design, and algorithms.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/assessment")}
          className="px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs font-display hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isCompleted ? "Retake Assessment Center" : "Launch Assessment Center"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400">Assessment Status</span>
          <div className="text-lg font-bold text-white font-display flex items-center gap-2 mt-1">
            {isCompleted ? (
              <>
                <span className="text-emerald-400 font-black text-2xl">{assessment.score}%</span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Profile Generated
                </span>
              </>
            ) : (
              <span className="text-amber-400 font-mono text-xs">Pending Completion</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400">Verified Strong Concepts</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {assessment?.strong_concepts?.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {c}
              </span>
            )) || <span className="text-xs text-neutral-500 font-mono">Unlock via assessment</span>}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400">Stage 2 AI Interview Status</span>
          <div className="flex items-center gap-2 mt-1">
            {isCompleted ? (
              <button
                onClick={() => navigate("/interview")}
                className="px-3.5 py-1.5 rounded-xl bg-gold-400 text-black font-bold text-xs font-display hover:bg-gold-300 transition-all flex items-center gap-1.5"
              >
                <Unlock className="h-3.5 w-3.5" />
                <span>Launch AI Interview</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-500 text-xs font-mono flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Locked until test completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard;

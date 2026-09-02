import React from "react";
import { Award, CheckSquare, Video, Share2, ArrowUpRight } from "lucide-react";

interface ExecutiveMetricDeckProps {
  hireScore?: number | undefined;
  assessmentScore?: number | undefined;
  interviewCompletedCount?: number | undefined;
  recruiterToken?: string | undefined;
  recruiterAccessCount?: number | undefined;
}

export const ExecutiveMetricDeck: React.FC<ExecutiveMetricDeckProps> = ({
  hireScore,
  assessmentScore,
  interviewCompletedCount = 0,
  recruiterToken,
  recruiterAccessCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Current HireScore */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400 uppercase">Current HireScore</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-white font-display">
            {hireScore !== undefined ? (
              <span className="text-emerald-400">{hireScore} <span className="text-xs font-mono text-neutral-400">/ 100</span></span>
            ) : (
              <span className="text-xs font-mono text-neutral-500">Pending Evaluation</span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 font-sans mt-1">
            {hireScore !== undefined ? "Multi-engine composite rating" : "Complete assessment & interview to unlock"}
          </p>
        </div>
      </div>

      {/* Metric 2: Latest Assessment Summary */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400 uppercase">Assessment Profile</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-white font-display">
            {assessmentScore !== undefined ? (
              <span className="text-cyan-400">{assessmentScore}%</span>
            ) : (
              <span className="text-xs font-mono text-neutral-500">Not Completed</span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 font-sans mt-1">
            {assessmentScore !== undefined ? "Knowledge Profile Generated" : "Adaptive 20-question test"}
          </p>
        </div>
      </div>

      {/* Metric 3: Latest Interview Summary */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400 uppercase">AI Interviews</span>
          <div className="p-2 rounded-xl bg-gold-400/10 border border-gold-400/30 text-gold-400">
            <Video className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-white font-display">
            <span className="text-gold-400">{interviewCompletedCount}</span> <span className="text-xs font-mono text-neutral-400">sessions</span>
          </div>
          <p className="text-[11px] text-neutral-400 font-sans mt-1">
            Conversational telemetry evaluated
          </p>
        </div>
      </div>

      {/* Metric 4: Recruiter Share Link Status */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400 uppercase">Recruiter Portfolio</span>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Share2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-white font-display flex items-center gap-1.5">
            {recruiterToken ? (
              <span className="text-purple-400 flex items-center gap-1">
                Active <ArrowUpRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="text-xs font-mono text-neutral-500">Not Generated</span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 font-sans mt-1">
            {recruiterToken ? `${recruiterAccessCount} recruiter views` : "Share link generator ready"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveMetricDeck;

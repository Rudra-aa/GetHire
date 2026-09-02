import React from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Video, Award, ArrowUpRight, Play, Lock, ArrowRight } from "lucide-react";

interface ExecutiveSummariesProps {
  assessmentScore?: number | undefined;
  strongConcepts?: string[] | undefined;
  weakConcepts?: string[] | undefined;
  interviewCompletedCount: number;
  hireScore?: number | undefined;
  activeSessionId?: string | undefined;
  onContinueSession?: (sessionId: string) => void;
  onOpenEvaluation?: () => void;
}

export const ExecutiveSummaries: React.FC<ExecutiveSummariesProps> = ({
  assessmentScore,
  strongConcepts = [],
  weakConcepts = [],
  interviewCompletedCount,
  hireScore,
  activeSessionId,
  onContinueSession,
  onOpenEvaluation,
}) => {
  const isEvaluationUnlocked = hireScore !== undefined || (assessmentScore !== undefined && interviewCompletedCount > 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Continue Active Session Banner (if in progress) */}
      {activeSessionId && onContinueSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-4 backdrop-blur shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
              <Play className="h-5 w-5 fill-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-display text-white">Active Interview Session In Progress</h4>
              <p className="text-[11px] text-neutral-400 font-sans">Session ID: {activeSessionId}</p>
            </div>
          </div>
          <button
            onClick={() => onContinueSession(activeSessionId)}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs font-display hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <span>Continue Active Session</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3 Executive Summary Deck Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Latest Assessment Summary */}
        <div id="assessment" className="p-6 rounded-3xl bg-[#0e121d] border border-white/10 flex flex-col justify-between gap-5 shadow-2xl backdrop-blur scroll-mt-24">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase">Latest Assessment Summary</span>
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-display">
                {assessmentScore !== undefined ? `${assessmentScore}%` : "Not Taken"}
              </span>
              <span className="text-xs font-mono text-cyan-400">Knowledge Score</span>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              {assessmentScore !== undefined
                ? "Verified technical concept mastery & learning velocity calibration."
                : "Awaiting proctored technical assessment execution."}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
            {assessmentScore !== undefined ? (
              <div className="flex flex-wrap gap-1">
                {strongConcepts.slice(0, 3).map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    ✓ {c}
                  </span>
                ))}
                {weakConcepts.slice(0, 2).map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono">
                    • Gap: {c}
                  </span>
                ))}
              </div>
            ) : (
              <Link
                to="/assessment"
                className="w-full py-2 rounded-xl bg-cyan-500/15 text-cyan-400 font-extrabold text-xs font-display hover:bg-cyan-500/25 border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              >
                <span>Start Technical Assessment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Card 2: Latest Interview Summary */}
        <div className="p-6 rounded-3xl bg-[#0e121d] border border-white/10 flex flex-col justify-between gap-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase">Latest Interview Summary</span>
              <div className="p-2.5 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400">
                <Video className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-display">
                {interviewCompletedCount}
              </span>
              <span className="text-xs font-mono text-gold-400">Sessions Completed</span>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              {interviewCompletedCount > 0
                ? "Recruiter conversational speech, reasoning, and behavior evaluated."
                : "No interview sessions completed yet."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono text-neutral-400">
            <span>Communication & Reasoning</span>
            <span className="text-gold-300 font-bold">{interviewCompletedCount > 0 ? "Analyzed" : "Pending"}</span>
          </div>
        </div>

        {/* Card 3: Latest Evaluation Summary */}
        <div id="evaluation" className="p-6 rounded-3xl bg-[#0e121d] border border-white/10 flex flex-col justify-between gap-5 shadow-2xl backdrop-blur scroll-mt-24">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase">Latest Evaluation Summary</span>
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-display">
                {hireScore !== undefined ? hireScore : "--"}
              </span>
              <span className="text-xs font-mono text-emerald-400">Composite HireScore</span>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              {isEvaluationUnlocked
                ? "Unified evidence synthesized across technical depth, speech, and behavior."
                : "Complete both Technical Assessment and AI Interview to unlock Evaluation."}
            </p>
          </div>

          <div className="pt-3 border-t border-white/10">
            {isEvaluationUnlocked && onOpenEvaluation ? (
              <button
                onClick={onOpenEvaluation}
                className="w-full py-2 rounded-xl bg-emerald-400 text-black font-extrabold text-xs font-display hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>View Evaluation Report</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-neutral-500">
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                <span>Locked until both complete</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExecutiveSummaries;

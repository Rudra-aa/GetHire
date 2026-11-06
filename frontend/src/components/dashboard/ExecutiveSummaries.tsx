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
        <div className="p-4 rounded-2xl bg-[#EEF6FB]/90 backdrop-blur-md border border-[#B9D9EC]/70 flex items-center justify-between gap-4 shadow-glass">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100/90 text-amber-700 border border-amber-200">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-display text-[#263D68]">Active Interview Session In Progress</h4>
              <p className="text-[11px] text-[#5A6E8C] font-sans">Session ID: {activeSessionId}</p>
            </div>
          </div>
          <button
            onClick={() => onContinueSession(activeSessionId)}
            className="px-4 py-2 rounded-xl bg-[#A8D8C3] hover:bg-[#77C4A2] text-[#1A2D52] font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Continue Active Session</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3 Executive Summary Deck Cards (Subtle Powder Blue Section Fills) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Latest Assessment Summary */}
        <div id="assessment" className="p-6 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 flex flex-col justify-between gap-5 shadow-glass hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] transition-all scroll-mt-24">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#5A6E8C] uppercase">Latest Assessment Summary</span>
              <div className="p-2.5 rounded-2xl bg-[#B9D9EC]/40 border border-[#B9D9EC]/60 text-[#2B7FAD]">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#263D68] font-display">
                {assessmentScore !== undefined ? `${assessmentScore}%` : "Not Taken"}
              </span>
              <span className="text-xs font-mono text-[#2B7FAD]">Knowledge Score</span>
            </div>

            <p className="text-xs text-[#5A6E8C] font-sans leading-relaxed">
              {assessmentScore !== undefined
                ? "Verified technical concept mastery & learning velocity calibration."
                : "Awaiting proctored technical assessment execution."}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-[#B9D9EC]/40">
            {assessmentScore !== undefined ? (
              <div className="flex flex-wrap gap-1">
                {strongConcepts.slice(0, 3).map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/85 text-[#1E8C5A] border border-[#A8D8C3]/50 text-[10px] font-mono shadow-xs">
                    ✓ {c}
                  </span>
                ))}
                {weakConcepts.slice(0, 2).map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-[#E05C5C] border border-rose-200 text-[10px] font-mono shadow-xs">
                    • Gap: {c}
                  </span>
                ))}
              </div>
            ) : (
              <Link
                to="/assessment"
                className="w-full py-2.5 rounded-xl bg-[#B9D9EC] hover:bg-[#93C5DF] text-[#1A2D52] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Start Technical Assessment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Card 2: Latest Interview Summary */}
        <div className="p-6 rounded-3xl bg-[#EEF6FB]/80 backdrop-blur-md border border-[#B9D9EC]/50 flex flex-col justify-between gap-5 shadow-glass hover:bg-[#EEF6FB]/95 hover:border-[#A8D8C3]/70 transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#5A6E8C] uppercase">Latest Interview Summary</span>
              <div className="p-2.5 rounded-2xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/50 text-[#1E8C5A]">
                <Video className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#263D68] font-display">
                {interviewCompletedCount}
              </span>
              <span className="text-xs font-mono text-[#1E8C5A]">Sessions Completed</span>
            </div>

            <p className="text-xs text-[#5A6E8C] font-sans leading-relaxed">
              {interviewCompletedCount > 0
                ? "Recruiter conversational speech, reasoning, and behavior evaluated."
                : "No interview sessions completed yet."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#B9D9EC]/40 text-xs font-mono text-[#5A6E8C]">
            <span>Communication & Reasoning</span>
            <span className="text-[#1E8C5A] font-bold">{interviewCompletedCount > 0 ? "Analyzed" : "Pending"}</span>
          </div>
        </div>

        {/* Card 3: Latest Evaluation Summary */}
        <div id="evaluation" className="p-6 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 flex flex-col justify-between gap-5 shadow-glass hover:bg-[#EEF6FB]/95 hover:border-[#DCD5F0]/80 transition-all scroll-mt-24">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#5A6E8C] uppercase">Latest Evaluation Summary</span>
              <div className="p-2.5 rounded-2xl bg-[#DCD5F0]/35 border border-[#DCD5F0]/50 text-[#6E5EBB]">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#263D68] font-display">
                {hireScore !== undefined ? hireScore : "--"}
              </span>
              <span className="text-xs font-mono text-[#6E5EBB]">Composite HireScore</span>
            </div>

            <p className="text-xs text-[#5A6E8C] font-sans leading-relaxed">
              {isEvaluationUnlocked
                ? "Unified evidence synthesized across technical depth, speech, and behavior."
                : "Complete both Technical Assessment and Interview to unlock Evaluation."}
            </p>
          </div>

          <div className="pt-3 border-t border-[#B9D9EC]/40">
            {isEvaluationUnlocked && onOpenEvaluation ? (
              <button
                onClick={onOpenEvaluation}
                className="w-full py-2.5 rounded-xl bg-[#A8D8C3] hover:bg-[#77C4A2] text-[#1A2D52] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Evaluation Report</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-[#8FA3BC]">
                <Lock className="h-3.5 w-3.5 text-[#E05C5C]" />
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

import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, LayoutDashboard, Sparkles, FileText } from "lucide-react";
import type { InterviewSession } from "@/services/interviewApi";

interface SessionSummaryProps {
  session: InterviewSession;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ session }) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const answeredCount = session.answers.filter((a) => !a.is_draft && a.answer_text.trim().length > 0).length;
  const totalWords = session.answers.reduce((acc, a) => acc + (a.word_count || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-8 animate-in fade-in duration-300">
      {/* Hero Completion Card */}
      <div
        className="rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(230, 195, 122, 0.08) 0%, rgba(17, 17, 21, 0.95) 100%)",
          border: "1px solid rgba(230, 195, 122, 0.3)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Interview Simulation Completed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Great Job on Your {session.target_role} Interview!
          </h1>
          <p className="text-sm text-neutral-300">
            All your responses, timing, and resume context have been safely recorded.
            Your answers are ready for the AI Evaluation Engine.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-4 border-t border-white/[0.08]">
          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-2xl font-extrabold text-white font-mono">{answeredCount}/{session.total_questions}</span>
            <span className="text-xs text-neutral-400 mt-1">Questions Answered</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-2xl font-extrabold text-gold-400 font-mono">{formatTime(session.elapsed_seconds)}</span>
            <span className="text-xs text-neutral-400 mt-1">Total Time</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-2xl font-extrabold text-white font-mono">{totalWords}</span>
            <span className="text-xs text-neutral-400 mt-1">Total Words</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">100%</span>
            <span className="text-xs text-neutral-400 mt-1">Session Progress</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-neutral-200 transition-all flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4 text-gold-400" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            to={`/interview/${session.id}/evaluation`}
            className="px-8 py-3 rounded-xl text-xs font-extrabold text-black transition-all flex items-center gap-2 shadow-lg shadow-gold-400/25 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #F3D086 0%, #E6C37A 50%, #C49F45 100%)",
            }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Evaluation & HireScore</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Answered Questions Breakdown */}
      <div
        className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
        style={{
          background: "rgba(17, 17, 21, 0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold-400" />
            <span>Interview Questions & Responses</span>
          </h2>
          <span className="text-xs text-neutral-400">{session.questions.length} questions evaluated</span>
        </div>

        <div className="flex flex-col gap-4">
          {session.questions.map((q, idx) => {
            const answer = session.answers.find((a) => a.question_id === q.id && !a.is_draft);
            return (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold-400">Q{idx + 1}.</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/10 text-neutral-300">
                      {q.category}
                    </span>
                    <span className="text-xs text-neutral-400">({q.difficulty})</span>
                  </div>
                  {answer && (
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {answer.word_count} words
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-neutral-200">
                  {q.question_text}
                </p>

                {answer && answer.answer_text ? (
                  <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] text-xs text-neutral-300 leading-relaxed font-sans">
                    {answer.answer_text}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 italic">No response submitted.</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

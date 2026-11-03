import React from "react";
import { Bot, User, Sparkles, Volume2 } from "lucide-react";
import { type TranscriptEntry, type InterviewState } from "@/types/interviewEngine";

interface LiveTranscriptStreamProps {
  transcripts: TranscriptEntry[];
  liveCandidateText: string;
  state: InterviewState;
}

export const LiveTranscriptStream: React.FC<LiveTranscriptStreamProps> = ({
  transcripts,
  liveCandidateText,
  state,
}) => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-slate-800 dark:text-neutral-300">
          <Sparkles className="h-4 w-4 text-amber-500 dark:text-gold-400" />
          <span>Real-time Conversational Transcript</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-500">Live Voice Pipeline</span>
      </div>

      <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
        {transcripts.map((t) => {
          const isAi = t.speaker === "ai";
          return (
            <div key={t.id} className="flex flex-col gap-1 text-xs font-sans">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                {isAi ? (
                  <span className="text-amber-600 dark:text-gold-400 font-bold flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5" /> Alex (AI Recruiter)
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> You (Candidate)
                  </span>
                )}
                <span>• {t.timestamp}</span>
              </div>
              <p className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                isAi
                  ? t.isFollowUp
                    ? "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-200"
                    : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200"
                  : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
              }`}>
                {t.text}
              </p>
            </div>
          );
        })}

        {/* Streaming Candidate Voice-to-Text */}
        {state === "LISTENING" && (
          <div className="flex flex-col gap-1 text-xs font-sans animate-pulse">
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5 animate-pulse" /> Live Voice Input Streaming...
            </span>
            <p className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/40 text-emerald-950 dark:text-white font-mono text-xs">
              {liveCandidateText || "Speaking... (Speech-to-Text capturing audio stream)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptStream;

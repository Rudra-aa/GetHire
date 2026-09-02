import React, { useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, HelpCircle, Send, Volume2, Flag, ArrowRight, Sparkles, FastForward } from "lucide-react";
import { type InterviewState } from "@/types/interviewEngine";

interface InterviewControlBarProps {
  state: InterviewState;
  isMicMuted: boolean;
  onToggleMic: () => void;
  onFinishAnswer: (customAnswer?: string) => void;
  onRetryTurn?: () => void;
  onRepeatQuestion: () => void;
  onRequestClarification: () => void;
  onEndInterview?: () => void;
  onSkipQuestion?: () => void;
  activeQuestionPrompt?: string;
  isTextFallback: boolean;
  onToggleTextFallback: () => void;
  fallbackText: string;
  setFallbackText: (text: string) => void;
  liveCandidateText?: string;
  setLiveCandidateText?: (text: string) => void;
  micVolume?: number;
  onInterrupt?: () => void;
}

export const InterviewControlBar: React.FC<InterviewControlBarProps> = ({
  state,
  isMicMuted,
  onToggleMic,
  onFinishAnswer,
  onRetryTurn,
  onRepeatQuestion,
  onRequestClarification,
  onEndInterview,
  onSkipQuestion,
  activeQuestionPrompt = "",
  fallbackText,
  setFallbackText,
  liveCandidateText = "",
  setLiveCandidateText,
  micVolume = 0,
  onInterrupt,
}) => {
  const isCandidateTurn = state === "LISTENING";
  const isThinking = state === "THINKING" || state === "TRANSCRIBING" || state === "FOLLOW_UP_DECISION";
  const isAiSpeaking = state === "INTRODUCTION" || state === "QUESTION" || state === "FOLLOW_UP";

  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync candidate speech into editable input
  const currentInputValue = fallbackText || liveCandidateText;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFallbackText(val);
    if (setLiveCandidateText) {
      setLiveCandidateText(val);
    }
    // Auto-interrupt Alex if candidate starts typing an answer while Alex is speaking
    if (isAiSpeaking && onInterrupt && val.trim().length > 0) {
      onInterrupt();
    }
  };

  const handleSend = () => {
    const textToSend = (currentInputValue || "").trim();
    if (!textToSend) return;
    onFinishAnswer(textToSend);
    setFallbackText("");
    if (setLiveCandidateText) {
      setLiveCandidateText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSkip = () => {
    if (onSkipQuestion) {
      onSkipQuestion();
    } else {
      onFinishAnswer("I am not familiar with this specific topic, let's proceed to the next question.");
    }
    setFallbackText("");
    if (setLiveCandidateText) {
      setLiveCandidateText("");
    }
  };

  // Check if Alex gave a closing or wrapping up statement
  const lowerPrompt = activeQuestionPrompt.toLowerCase();
  const isClosingStatement =
    lowerPrompt.includes("wrap things up") ||
    lowerPrompt.includes("touch regarding the next steps") ||
    lowerPrompt.includes("have a good rest of your day") ||
    lowerPrompt.includes("thank you for your time") ||
    lowerPrompt.includes("interview is complete") ||
    lowerPrompt.includes("wrap up right here");

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Dynamic Conclusion Banner if Alex has wrapped up ── */}
      {isClosingStatement && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-[#0b0e17] border border-[#39FF88]/40 shadow-[0_0_25px_rgba(57,255,136,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-[#39FF88]/40 flex items-center justify-center text-[#39FF88] shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <span>Interview Session Ready to Finalize</span>
                <span className="px-2 py-0.5 rounded-full bg-[#39FF88]/20 text-[#39FF88] text-[10px] font-mono font-bold">
                  Alex Finished
                </span>
              </h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                All turns recorded. Click to generate your comprehensive multi-engine Evaluation & HireScore.
              </p>
            </div>
          </div>

          <button
            onClick={onEndInterview}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-[#39FF88] hover:from-emerald-300 hover:to-[#39FF88] text-black font-extrabold text-xs font-display flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(57,255,136,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Evaluation Results</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Live Dual-Mode Answer Dock (Voice & Text) ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e17]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col gap-3 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isCandidateTurn
                  ? "bg-[#39FF88] animate-ping"
                  : isThinking
                  ? "bg-purple-400 animate-spin"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-200">
              {isCandidateTurn
                ? "Your Turn — Speak into your mic or type below"
                : isThinking
                ? "Alex is synthesizing your answer with Gemini..."
                : "Alex is speaking... (Listen or click 'Interrupt & Answer')"}
            </span>
          </div>

          {isCandidateTurn && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#39FF88] font-semibold hidden sm:inline">
                {micVolume > 15 ? "🎙️ Voice Detected" : "🎙️ Mic Ready"}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                Press Enter ↵ to submit
              </span>
            </div>
          )}
        </div>

        {/* Text / Speech Recognition Interactive Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={currentInputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder={
              isCandidateTurn
                ? "Speak your answer or type here (e.g. 'In our architecture, we implemented Redis with write-through caching...')"
                : isAiSpeaking
                ? "Alex is currently speaking. You can begin typing or speak when ready..."
                : "Analyzing response with Gemini..."
            }
            className="w-full bg-black/60 border border-white/15 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF88]/60 transition-all font-sans resize-none leading-relaxed shadow-inner"
          />
        </div>

        {/* Toolbar & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left quick response starter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onToggleMic}
              className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                isMicMuted
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                  : "bg-white/[0.04] border-white/15 text-neutral-300 hover:text-white"
              }`}
              title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-[#39FF88]" />}
              <span className="hidden sm:inline">{isMicMuted ? "Unmute" : "Mic On"}</span>
            </button>

            <button
              onClick={onRepeatQuestion}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Repeat Question via Voice"
            >
              <Volume2 className="h-3.5 w-3.5 text-gold-400" />
              <span>Hear Again</span>
            </button>

            <button
              onClick={onRequestClarification}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ask Alex for Clarification"
            >
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ask Clarification</span>
            </button>

            <button
              onClick={handleSkip}
              disabled={isThinking}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Skip this question if you don't know the answer"
            >
              <FastForward className="h-3.5 w-3.5 text-amber-400" />
              <span>I Don't Know / Skip</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* End Interview & Proceed Button */}
            {showConfirmEnd ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rose-500/15 border border-rose-500/40 animate-in fade-in">
                <span className="text-[11px] font-mono text-rose-300 px-2 font-bold">End Interview now?</span>
                <button
                  onClick={() => {
                    setShowConfirmEnd(false);
                    if (onEndInterview) onEndInterview();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow-md"
                >
                  Yes, End & Evaluate
                </button>
                <button
                  onClick={() => setShowConfirmEnd(false)}
                  className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmEnd(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-rose-200 font-bold text-xs font-display transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Conclude interview session and proceed directly to Evaluation"
              >
                <Flag className="h-3.5 w-3.5 text-rose-400" />
                <span>End Interview</span>
              </button>
            )}

            {/* Primary Submit, Interrupt, or Retry Button */}
            {isAiSpeaking ? (
              <button
                onClick={onInterrupt}
                className="px-6 py-2.5 rounded-xl font-bold text-xs font-display transition-all flex items-center gap-2 shadow-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)] cursor-pointer hover:scale-[1.02] active:scale-[0.98] animate-pulse"
                title="Stop Alex from speaking and answer immediately"
              >
                <span>✋ Interrupt & Answer</span>
              </button>
            ) : state === "ERROR" ? (
              <button
                onClick={onRetryTurn}
                className="px-6 py-2.5 rounded-xl font-bold text-xs font-display transition-all flex items-center gap-2 shadow-xl bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry Turn</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isThinking || !currentInputValue.trim()}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs font-display transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                  !isThinking && currentInputValue.trim()
                    ? "bg-gradient-to-r from-emerald-400 to-[#39FF88] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(57,255,136,0.35)]"
                    : "bg-white/10 text-neutral-500 border border-white/10 cursor-not-allowed opacity-60"
                }`}
              >
                {isThinking ? (
                  <span>Analyzing...</span>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewControlBar;

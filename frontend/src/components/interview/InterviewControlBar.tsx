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
  const isCandidateTurn =
    state === "LISTENING" ||
    state === "USER_SPEAKING" ||
    state === "SILENCE_DETECTED" ||
    state === "WAITING_FOR_MIC";
  const isThinking =
    state === "THINKING" ||
    state === "TRANSCRIBING" ||
    state === "FOLLOW_UP_DECISION" ||
    state === "AUTO_SUBMITTING" ||
    state === "AI_THINKING";
  const isAiSpeaking =
    state === "INTRODUCTION" ||
    state === "QUESTION" ||
    state === "FOLLOW_UP" ||
    state === "AI_SPEAKING";

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
        <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-[#A8D8C3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#A8D8C3]/30 border border-[#A8D8C3] flex items-center justify-center text-[#1E8C5A] shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#263D68] font-display flex items-center gap-2">
                <span>Interview Session Ready to Finalize</span>
                <span className="px-2 py-0.5 rounded-full bg-[#A8D8C3]/30 text-[#1E8C5A] text-[10px] font-mono font-bold">
                  Alex Finished
                </span>
              </h4>
              <p className="text-xs text-[#5A6E8C] mt-0.5">
                All turns recorded. Click to generate your comprehensive multi-engine Evaluation & HireScore.
              </p>
            </div>
          </div>

          <button
            onClick={onEndInterview}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-extrabold text-xs font-display flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Evaluation Results</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Live Dual-Mode Answer Dock (Voice & Text) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#D0DCE8]/80 shadow-[0_4px_20px_-2px_rgba(38,61,104,0.06)] flex flex-col gap-3 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isCandidateTurn
                  ? "bg-[#1E8C5A] animate-ping"
                  : isThinking
                  ? "bg-purple-500 animate-spin"
                  : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#263D68]">
              {isCandidateTurn
                ? "Your Turn — Speak into your mic or type below"
                : isThinking
                ? "Alex is synthesizing your answer..."
                : "Alex is speaking... (Listen or click 'Interrupt & Answer')"}
            </span>
          </div>

          {isCandidateTurn && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#1E8C5A] font-semibold hidden sm:inline">
                {micVolume > 15 ? "🎙️ Voice Detected" : "🎙️ Mic Ready"}
              </span>
              <span className="text-[10px] font-mono text-[#5A6E8C] bg-[#FAFBFC] px-2 py-0.5 rounded-md border border-[#D0DCE8]">
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
                : "Analyzing response..."
            }
            className="w-full bg-[#FAFBFC] border border-[#D0DCE8] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#263D68] placeholder-[#5A6E8C] focus:outline-none focus:border-[#A8D8C3] transition-all font-sans resize-none leading-relaxed"
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
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-[#FAFBFC] hover:bg-[#F0F5F9] border-[#D0DCE8] text-[#263D68]"
              }`}
              title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-[#1E8C5A]" />}
              <span className="hidden sm:inline">{isMicMuted ? "Unmute" : "Mic On"}</span>
            </button>

            <button
              onClick={onRepeatQuestion}
              className="px-3 py-2 rounded-xl bg-[#FAFBFC] hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#263D68] text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Repeat Question via Voice"
            >
              <Volume2 className="h-3.5 w-3.5 text-amber-600" />
              <span>Hear Again</span>
            </button>

            <button
              onClick={onRequestClarification}
              className="px-3 py-2 rounded-xl bg-[#FAFBFC] hover:bg-[#F0F5F9] border border-[#D0DCE8] text-[#263D68] text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ask Alex for Clarification"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#2B7FAD]" />
              <span className="hidden sm:inline">Ask Clarification</span>
            </button>

            <button
              onClick={handleSkip}
              disabled={isThinking}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Skip this question if you don't know the answer"
            >
              <FastForward className="h-3.5 w-3.5 text-amber-600" />
              <span>I Don't Know / Skip</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* End Interview & Proceed Button */}
            {showConfirmEnd ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rose-50 border border-rose-200 animate-in fade-in">
                <span className="text-[11px] font-mono text-rose-800 px-2 font-bold">End Interview now?</span>
                <button
                  onClick={() => {
                    setShowConfirmEnd(false);
                    if (onEndInterview) onEndInterview();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow-sm"
                >
                  Yes, End & Evaluate
                </button>
                <button
                  onClick={() => setShowConfirmEnd(false)}
                  className="px-2 py-1.5 rounded-lg bg-[#FAFBFC] hover:bg-[#F0F5F9] text-[#5A6E8C] text-xs font-mono border border-[#D0DCE8] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmEnd(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs font-display transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Conclude interview session and proceed directly to Evaluation"
              >
                <Flag className="h-3.5 w-3.5 text-rose-600" />
                <span>End Interview</span>
              </button>
            )}

            {/* Primary Submit, Interrupt, or Retry Button */}
            {isAiSpeaking ? (
              <button
                onClick={onInterrupt}
                className="px-6 py-2.5 rounded-xl font-bold text-xs font-display transition-all flex items-center gap-2 shadow-sm bg-amber-500 hover:bg-amber-600 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Stop Alex from speaking and answer immediately"
              >
                <span>✋ Interrupt & Answer</span>
              </button>
            ) : state === "ERROR" ? (
              <button
                onClick={onRetryTurn}
                className="px-6 py-2.5 rounded-xl font-bold text-xs font-display transition-all flex items-center gap-2 shadow-sm bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry Turn</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isThinking || !currentInputValue.trim()}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs font-display transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                  !isThinking && currentInputValue.trim()
                    ? "bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD]"
                    : "bg-[#FAFBFC] text-[#5A6E8C] border border-[#D0DCE8] cursor-not-allowed opacity-60"
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

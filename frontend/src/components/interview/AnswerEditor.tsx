import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, ArrowRight, Loader2, Save, Sparkles } from "lucide-react";

interface AnswerEditorProps {
  initialAnswer: string;
  isLastQuestion: boolean;
  onAutosaveDraft: (text: string) => Promise<void>;
  onSubmitAnswer: (text: string) => Promise<void>;
  onFinishInterview: (text: string) => Promise<void>;
  submitting: boolean;
}

export const AnswerEditor: React.FC<AnswerEditorProps> = ({
  initialAnswer,
  isLastQuestion,
  onAutosaveDraft,
  onSubmitAnswer,
  onFinishInterview,
  submitting,
}) => {
  const [answerText, setAnswerText] = useState(initialAnswer);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state if initialAnswer changes (e.g. user jumped to another question)
  useEffect(() => {
    setAnswerText(initialAnswer);
    setSaveStatus("idle");
  }, [initialAnswer]);

  // Debounced Autosave (3 seconds after last keystroke)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAnswerText(val);
    setSaveStatus("saving");

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        await onAutosaveDraft(val);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    }, 3000);
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  const handleNextClick = async () => {
    if (isLastQuestion) {
      await onFinishInterview(answerText);
    } else {
      await onSubmitAnswer(answerText);
    }
  };

  return (
    <div
      className="w-full rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
      style={{
        background: "rgba(17, 17, 21, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header with Autosave Status */}
      <div className="flex items-center justify-between">
        <label htmlFor="answer-input" className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <span>Your Response</span>
          <span className="text-xs font-normal text-neutral-400">
            (Explain your approach, tradeoffs, and relevant experience)
          </span>
        </label>

        <div className="flex items-center gap-2 text-xs font-medium">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-gold-400 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving draft...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Draft saved
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="answer-input"
          value={answerText}
          onChange={handleChange}
          rows={7}
          placeholder="Start typing your response here... Structure your answer clearly using STAR method where appropriate."
          className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/30 transition-all font-sans leading-relaxed resize-y min-h-[160px]"
        />
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>
            Words: <strong className="text-neutral-200">{wordCount}</strong>
          </span>
          <span>
            Est. speaking time: <strong className="text-neutral-200">~{Math.ceil(wordCount / 130)} min</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAutosaveDraft(answerText)}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-neutral-300 transition-all flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleNextClick}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-black transition-all flex items-center gap-2 shadow-lg shadow-gold-400/20 disabled:opacity-50"
            style={{
              background: isLastQuestion
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : "linear-gradient(135deg, #F3D086 0%, #E6C37A 50%, #C49F45 100%)",
              color: isLastQuestion ? "#ffffff" : "#111111",
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isLastQuestion ? (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Finish Interview</span>
              </>
            ) : (
              <>
                <span>Submit & Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

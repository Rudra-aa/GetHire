import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentApi, type AssessmentSession } from "@/services/assessmentApi";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { AssessmentOnboarding } from "@/components/assessment/AssessmentOnboarding";
import { QuestionRenderer, type QuestionData } from "@/components/assessment/QuestionRenderer";
import { AssessmentSidebar } from "@/components/assessment/AssessmentSidebar";
import { CalculatorModal } from "@/components/assessment/CalculatorModal";
import { FormulaSheetModal } from "@/components/assessment/FormulaSheetModal";
import { KnowledgeProfileModal } from "@/components/assessment/KnowledgeProfileModal";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Maximize2 } from "lucide-react";

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(2700);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  // Fullscreen Proctored Test Mode State
  const [, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    strong_concepts: string[];
    weak_concepts: string[];
  } | null>(null);

  const initAssessment = useCallback(async () => {
    setLoading(true);
    try {
      const data = await assessmentApi.startAssessment();
      setSession(data);
    } catch {
      setSession({
        id: "sess-demo",
        user_id: "u-1",
        target_role: "Senior Full-Stack Engineer",
        experience_level: "Senior",
        status: "active",
        questions: [
          {
            id: "q1",
            category: "System Design MCQ",
            skill: "Distributed Caching",
            question: "How do you mitigate Cache Stampede under ultra-high burst traffic in a Redis cluster?",
            options: ["Implement Probabilistic Early Expiration (XFetch)", "Increase pool size", "Use sync locks", "Disable TTL"]
          },
          {
            id: "q2",
            category: "Code Output",
            skill: "Async JavaScript",
            question: "What is the logged execution sequence of the Event Loop code snippet?",
            options: ["1, 4, 3, 2", "1, 2, 3, 4", "1, 3, 4, 2", "1, 4, 2, 3"]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void initAssessment(); }, [initAssessment]);

  // Handle Fullscreen API Events (ESC detection)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && started && !showResult) {
        setShowExitWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [started, showResult]);

  useEffect(() => {
    if (!started || showResult) return;
    const interval = setInterval(() => setRemainingSeconds((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [started, showResult]);

  const handleStartTest = () => {
    setStarted(true);
    setShowExitWarning(false);
    document.documentElement.requestFullscreen().catch(() => {});
  };

  const handleReEnterFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      setShowExitWarning(false);
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-cyan-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!started) {
    return <AssessmentOnboarding assessmentName={session?.target_role || "Technical Assessment"} onStart={handleStartTest} />;
  }

  const questions: QuestionData[] = (session?.questions || []).map((q) => ({
    id: q.id,
    category: q.category,
    skill: q.skill,
    question: q.question,
    options: q.options,
    explanation: q.explanation,
    type: "mcq",
  }));

  const currentQ = questions[currentIndex] || questions[0] || {
    id: "q-default",
    category: "General",
    skill: "Engineering",
    question: "Default question",
    options: ["A", "B"],
    type: "mcq"
  };


  const handleNext = () => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const handleSkip = () => { setSkipped((prev) => ({ ...prev, [currentQ.id]: true })); handleNext(); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qid, val]) => ({ question_id: qid, selected_option: typeof val === "number" ? val : 0 }));
      if (session?.id) {
        const res = await assessmentApi.submitAssessment(session.id, payload);
        if (res) {
          setSubmissionResult({
            score: res.score ?? 0,
            strong_concepts: res.strong_concepts ?? [],
            weak_concepts: res.weak_concepts ?? [],
          });
        }
      }
    } catch (err) {
      console.error("Failed to submit assessment:", err);
    } finally {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setSubmitting(false);
      setShowResult(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans relative">
      
      {/* Fullscreen Exit Warning Banner */}
      {showExitWarning && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 p-3 px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-2.5 text-xs text-amber-200 font-bold font-mono">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Proctored Fullscreen Mode Exited. Re-enter fullscreen to continue your assessment.</span>
          </div>
          <button
            onClick={handleReEnterFullscreen}
            className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs font-display hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-lg"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Re-enter Fullscreen</span>
          </button>
        </div>
      )}

      <AssessmentHeader
        assessmentName={session?.target_role || "Technical Knowledge Assessment"}
        companyStyle="Acme Style"
        difficulty="Adaptive"
        estimatedDuration="45 Mins"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        remainingSeconds={remainingSeconds}
        onExit={() => {
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          navigate("/dashboard");
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <QuestionRenderer
            question={currentQ}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQ.id]}
            isFlagged={!!flagged[currentQ.id]}
            onSelectOption={(qid, val) => setAnswers((prev) => ({ ...prev, [qid]: val }))}
            onToggleFlag={(qid) => setFlagged((prev) => ({ ...prev, [qid]: !prev[qid] }))}
          />
          <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/10">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold disabled:opacity-30 hover:bg-white/10 transition-all flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            <div className="flex items-center gap-3">
              <button onClick={handleSkip} className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all">
                Skip Question
              </button>
              {currentIndex === questions.length - 1 ? (
                <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs font-display hover:bg-cyan-300 transition-all flex items-center gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Submit Assessment</span>
                </button>
              ) : (
                <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs font-display hover:bg-cyan-300 transition-all flex items-center gap-2">
                  <span>Next Question</span> <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <AssessmentSidebar
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            flagged={flagged}
            skipped={skipped}
            questionIds={questions.map((q) => q.id)}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
            onOpenCalculator={() => setCalcOpen(true)}
            onOpenFormulaSheet={() => setFormulaOpen(false)}
          />
        </div>
      </main>

      <CalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
      <FormulaSheetModal isOpen={formulaOpen} onClose={() => setFormulaOpen(false)} />
      {showResult && (
        <KnowledgeProfileModal
          score={submissionResult?.score ?? 0}
          strongConcepts={submissionResult?.strong_concepts ?? []}
          weakConcepts={submissionResult?.weak_concepts ?? []}
          onProceedToInterview={() => navigate("/interview")}
        />
      )}
    </div>
  );
};

export default AssessmentPage;

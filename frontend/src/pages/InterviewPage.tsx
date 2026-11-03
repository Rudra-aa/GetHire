import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVoiceInterviewEngine } from "@/hooks/useVoiceInterviewEngine";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { VoiceMeetGrid } from "@/components/interview/VoiceMeetGrid";
import { LiveTranscriptStream } from "@/components/interview/LiveTranscriptStream";
import { InterviewControlBar } from "@/components/interview/InterviewControlBar";
import { CollapsibleSidebar } from "@/components/interview/CollapsibleSidebar";
import { ProcessingReportView } from "@/components/interview/ProcessingReportView";
import BrowserIntegrityGuard from "@/components/intelligence/BrowserIntegrityGuard";
import { Bot, Play, Video, Mic, Volume2 } from "lucide-react";

export const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const {
    state,
    persona,
    questions,
    currentQuestionIndex,
    currentQuestion,
    activeQuestionPrompt,
    transcripts,
    liveCandidateText,
    setLiveCandidateText,
    isMicMuted,
    setIsMicMuted,
    micVolume,
    isTextFallbackMode,
    setIsTextFallbackMode,
    elapsedSeconds,
    startInterview,
    finishCandidateAnswer,
    endInterview,
    skipQuestion,
    retryTurn,
    repeatQuestion,
    requestClarification,
    actualSessionId,
    turnWarning,
    isStarting,
    isSpeakingAi,
    interruptAi,
    initErrorMessage,
    retryInitialization,
  } = useVoiceInterviewEngine(sessionId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fallbackInput, setFallbackInput] = useState("");
  const [hasUserStarted, setHasUserStarted] = useState(false);
  const startCalledRef = React.useRef(false);

  // Auto-start if navigating with a pre-existing session
  useEffect(() => {
    if (sessionId && !hasUserStarted && state === "WAITING" && !startCalledRef.current) {
      startCalledRef.current = true;
      setHasUserStarted(true);
      void startInterview();
    }
  }, [sessionId, hasUserStarted, state, startInterview]);

  if ((state as string) === "INTERVIEW_COMPLETE" || (state as string) === "AI_PROCESSING") {
    const evalSessionId = actualSessionId || sessionId || "";
    return (
      <ProcessingReportView
        sessionId={evalSessionId}
        onComplete={(sid) =>
          navigate(sid ? `/evaluation/${sid}` : "/evaluation")
        }
      />
    );
  }

  const handleStartSession = () => {
    if (startCalledRef.current || isStarting) return;
    startCalledRef.current = true;
    // Unlock browser audio context explicitly via click
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }
    setHasUserStarted(true);
    void startInterview();
  };

  const handleFinishAnswer = (customAnswer?: string) => {
    finishCandidateAnswer(customAnswer || fallbackInput || liveCandidateText);
    setFallbackInput("");
  };

  const safeCurrentQText = activeQuestionPrompt;
  const safeCurrentQCategory = currentQuestion?.category || "System Architecture";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col font-sans relative overflow-x-hidden">
      <BrowserIntegrityGuard
        sessionId={actualSessionId || sessionId || ""}
        currentQuestionId={currentQuestion?.id}
        isPaused={state === "INTERVIEW_COMPLETE" || !hasUserStarted}
      />

      <InterviewHeader
        companyName={persona.company}
        interviewRound={`${persona.role} Round`}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length || 5}
        elapsedSeconds={elapsedSeconds}
        onExit={() => navigate("/dashboard")}
        onFinish={endInterview}
      />

      {turnWarning && (
        <div className="max-w-md mx-auto mt-2 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-mono text-center font-bold animate-in fade-in z-50 shadow-lg">
          ⚠️ {turnWarning}
        </div>
      )}

      {/* ── Pre-Interview Lobby / Start Screen ── */}
      {!hasUserStarted && state !== "ERROR" && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-20">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-white/95 dark:bg-[#0d101a]/95 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 dark:border-[#39FF88]/40 shadow-[0_0_24px_rgba(57,255,136,0.2)] flex items-center justify-center text-emerald-600 dark:text-[#39FF88]">
              <Bot className="h-9 w-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                AI Interview Studio
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                You are about to enter a live, multi-turn AI interview with <strong className="text-slate-900 dark:text-white">Alex</strong> ({persona.role} at GetHire). Voice synthesis, speech recognition, and real-time behavioral telemetry are enabled.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col items-center gap-1.5">
                <Video className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-[10px] font-mono text-slate-700 dark:text-neutral-300">HD Webcam</span>
                <span className="text-[9px] text-emerald-700 dark:text-[#39FF88] font-bold">FaceSense Ready</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col items-center gap-1.5">
                <Mic className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-[10px] font-mono text-slate-700 dark:text-neutral-300">Microphone</span>
                <span className="text-[9px] text-emerald-700 dark:text-[#39FF88] font-bold">VoiceSense Ready</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="text-[10px] font-mono text-slate-700 dark:text-neutral-300">Voice Synthesis</span>
                <span className="text-[9px] text-amber-600 dark:text-amber-300 font-bold">Alex Active</span>
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isStarting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-[#39FF88] hover:from-emerald-300 hover:to-[#39FF88] text-black font-extrabold text-sm font-display shadow-[0_0_25px_rgba(57,255,136,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {state === "INITIALIZING" ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Initializing interview session...</span>
                </div>
              ) : state === "GENERATING_FIRST_QUESTION" ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Alex is generating your question with Gemini...</span>
                </div>
              ) : isStarting ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Recruiter AI...</span>
                </div>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-black" />
                  <span>Enter & Begin Interview</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Active Interview Main View ── */}
      {(hasUserStarted || state !== "WAITING") && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <VoiceMeetGrid
              state={state}
              persona={persona}
              currentQuestionText={safeCurrentQText}
              category={safeCurrentQCategory}
              micMuted={isMicMuted}
              micVolume={micVolume}
              sessionId={actualSessionId || sessionId}
              currentQuestionId={currentQuestion?.id}
              isSpeakingAi={isSpeakingAi}
              onRepeatAudio={repeatQuestion}
              onInterrupt={interruptAi}
              onRetry={() => {
                startCalledRef.current = false;
                void retryInitialization();
              }}
              errorMessage={initErrorMessage || turnWarning || undefined}
            />

            <InterviewControlBar
              state={state}
              isMicMuted={isMicMuted}
              onToggleMic={setIsMicMuted}
              onFinishAnswer={handleFinishAnswer}
              onRetryTurn={retryTurn}
              onRepeatQuestion={repeatQuestion}
              onRequestClarification={requestClarification}
              onEndInterview={endInterview}
              onSkipQuestion={skipQuestion}
              activeQuestionPrompt={safeCurrentQText}
              isTextFallback={isTextFallbackMode}
              onToggleTextFallback={() => setIsTextFallbackMode(!isTextFallbackMode)}
              fallbackText={fallbackInput}
              setFallbackText={setFallbackInput}
              liveCandidateText={liveCandidateText}
              setLiveCandidateText={setLiveCandidateText}
              micVolume={micVolume}
              onInterrupt={interruptAi}
            />

            <LiveTranscriptStream
              transcripts={transcripts}
              liveCandidateText={liveCandidateText}
              state={state}
            />
          </div>

          <CollapsibleSidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            micVolume={micVolume}
            cameraOk={true}
            micOk={!isMicMuted}
            networkLatencyMs={120}
            questions={questions.map((q) => ({ id: q.id, question_text: q.question_text }))}
            currentIndex={currentQuestionIndex}
          />
        </main>
      )}
    </div>
  );
};

export default InterviewPage;

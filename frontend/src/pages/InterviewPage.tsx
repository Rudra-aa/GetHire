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
  const [lobbyVisualEnabled, setLobbyVisualEnabled] = useState(true);
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
    <div className="min-h-screen bg-transparent text-[#263D68] flex flex-col font-sans relative overflow-x-hidden">
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
        <div className="max-w-md mx-auto mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono text-center font-bold animate-in fade-in z-50 shadow-sm">
          ⚠️ {turnWarning}
        </div>
      )}

      {/* ── Pre-Interview Lobby / Start Screen ── */}
      {!hasUserStarted && state !== "ERROR" && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-20">
          <div className="max-w-xl w-full p-8 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-glass-modal flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/60 flex items-center justify-center text-[#1E8C5A] shadow-sm">
              <Bot className="h-9 w-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#263D68] font-display tracking-tight">
                Interview Simulation Studio
              </h2>
              <p className="text-xs text-[#5A6E8C] mt-2 max-w-md mx-auto leading-relaxed">
                You are about to enter a live, multi-turn interview with <strong className="text-[#263D68]">Alex</strong> ({persona.role} at GetHire). Voice synthesis, speech recognition, and real-time behavioral telemetry are enabled.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={() => setLobbyVisualEnabled(!lobbyVisualEnabled)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  lobbyVisualEnabled
                    ? "bg-[#FAFBFC]/80 backdrop-blur-sm border-[#D0DCE8]/80 hover:border-[#72C9AD]"
                    : "bg-neutral-100/80 border-neutral-300 opacity-60"
                }`}
                title="Click to toggle non-verbal analysis"
              >
                <Video className={`h-4 w-4 ${lobbyVisualEnabled ? "text-[#1E8C5A]" : "text-neutral-400"}`} />
                <span className="text-[10px] font-mono text-[#5A6E8C]">HD Webcam</span>
                <span className={`text-[9px] font-bold ${lobbyVisualEnabled ? "text-[#1E8C5A]" : "text-neutral-500"}`}>
                  {lobbyVisualEnabled ? "Visual Analysis ON" : "Visual Analysis OFF"}
                </span>
              </button>
              <div className="p-3 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col items-center gap-1.5">
                <Mic className="h-4 w-4 text-[#2B7FAD]" />
                <span className="text-[10px] font-mono text-[#5A6E8C]">Microphone</span>
                <span className="text-[9px] text-[#2B7FAD] font-bold">VoiceSense Ready</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-600" />
                <span className="text-[10px] font-mono text-[#5A6E8C]">Voice Synthesis</span>
                <span className="text-[9px] text-amber-700 font-bold">Alex Active</span>
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isStarting}
              className="w-full py-4 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-extrabold text-sm font-display shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {state === "INITIALIZING" ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-[#1E4D38] border-t-transparent rounded-full animate-spin" />
                  <span>Initializing interview session...</span>
                </div>
              ) : state === "GENERATING_FIRST_QUESTION" ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-[#1E4D38] border-t-transparent rounded-full animate-spin" />
                  <span>Alex is generating your question...</span>
                </div>
              ) : isStarting ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-[#1E4D38] border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to interviewer...</span>
                </div>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-[#1E4D38]" />
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
              defaultVisualAnalysisEnabled={lobbyVisualEnabled}
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

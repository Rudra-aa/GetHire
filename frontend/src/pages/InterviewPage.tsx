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
  } = useVoiceInterviewEngine(sessionId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fallbackInput, setFallbackInput] = useState("");
  const [hasUserStarted, setHasUserStarted] = useState(false);

  // Auto-start if navigating with a pre-existing session
  useEffect(() => {
    if (sessionId && !hasUserStarted && state === "WAITING") {
      setHasUserStarted(true);
      void startInterview();
    }
  }, [sessionId, hasUserStarted, state, startInterview]);

  if ((state as string) === "INTERVIEW_COMPLETE" || (state as string) === "AI_PROCESSING") {
    return (
      <ProcessingReportView
        onComplete={() =>
          navigate(`/interview/${actualSessionId || sessionId || "sess-ai-demo"}/evaluation`)
        }
      />
    );
  }

  const handleStartSession = () => {
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

  const safeCurrentQText =
    activeQuestionPrompt ||
    currentQuestion?.question_text ||
    "Walk me through your architectural background and distributed systems experience.";
  const safeCurrentQCategory = currentQuestion?.category || "System Architecture";

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans relative overflow-x-hidden">
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
        <div className="max-w-md mx-auto mt-2 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono text-center font-bold animate-in fade-in z-50 shadow-lg">
          ⚠️ {turnWarning}
        </div>
      )}

      {/* ── Pre-Interview Lobby / Start Screen ── */}
      {!hasUserStarted && state === "WAITING" && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-20">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-[#0d101a]/95 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-[#39FF88]/40 shadow-[0_0_24px_rgba(57,255,136,0.3)] flex items-center justify-center text-[#39FF88]">
              <Bot className="h-9 w-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white font-display tracking-tight">
                AI Interview Studio
              </h2>
              <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                You are about to enter a live, multi-turn AI interview with <strong className="text-white">Alex</strong> ({persona.role} at GetHire). Voice synthesis, speech recognition, and real-time behavioral telemetry are enabled.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5">
                <Video className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-neutral-300">HD Webcam</span>
                <span className="text-[9px] text-[#39FF88] font-bold">FaceSense Ready</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5">
                <Mic className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-neutral-300">Microphone</span>
                <span className="text-[9px] text-[#39FF88] font-bold">VoiceSense Ready</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-mono text-neutral-300">Voice Synthesis</span>
                <span className="text-[9px] text-amber-300 font-bold">Alex Active</span>
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isStarting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-[#39FF88] hover:from-emerald-300 hover:to-[#39FF88] text-black font-extrabold text-sm font-display shadow-[0_0_25px_rgba(57,255,136,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {isStarting ? (
                <span>Connecting to Recruiter AI...</span>
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
            />

            <InterviewControlBar
              state={state}
              isMicMuted={isMicMuted}
              onToggleMic={() => setIsMicMuted(!isMicMuted)}
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

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { resumeApi, type ResumeDetail } from "@/services/resumeApi";
import { assessmentApi } from "@/services/assessmentApi";
import { interviewApi } from "@/services/interviewApi";
import { hireScoreApi } from "@/services/hireScoreApi";
import { ExecutiveHeader } from "@/components/dashboard/ExecutiveHeader";
import { ExecutiveSummaries } from "@/components/dashboard/ExecutiveSummaries";
import { ExecutiveIntelligenceDeck } from "@/components/dashboard/ExecutiveIntelligenceDeck";
import { ResumePdfPreview } from "@/components/resume/ResumePdfPreview";
import { ResumeIntelligenceCenterpiece } from "@/components/dashboard/ResumeIntelligenceCenterpiece";
import { CareerRoadmapTimeline } from "@/components/dashboard/CareerRoadmapTimeline";
import { PortfolioShareSection } from "@/components/dashboard/PortfolioShareSection";

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserState } = useAuthStore();

  useEffect(() => {
    let timer: number | undefined;
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        timer = window.setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [location.pathname, location.hash, location.key]);

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Summaries state
  const [assessmentScore, setAssessmentScore] = useState<number | undefined>(undefined);
  const [strongConcepts, setStrongConcepts] = useState<string[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [interviewCompletedCount, setInterviewCompletedCount] = useState<number>(0);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [hireScore, setHireScore] = useState<number | undefined>(undefined);

  const fetchExecutiveData = async () => {
    try {
      const latestResume = await resumeApi.getLatestResume().catch(() => null);
      setResume(latestResume);
      if (latestResume) updateUserState({ resume_uploaded: true });

      const latestAssessment = await assessmentApi.getLatestAssessment().catch(() => null);
      if (latestAssessment) {
        setAssessmentScore(latestAssessment.score);
        setStrongConcepts(latestAssessment.strong_concepts || []);
        setWeakConcepts(latestAssessment.weak_concepts || []);
      }

      const history = await interviewApi.getHistory(10, 0).catch(() => null);
      if (history?.sessions?.length) {
        const completed = history.sessions.filter((s) => s.status === "completed").length;
        setInterviewCompletedCount(completed);
        const running = history.sessions.find((s) => s.status === "running" || s.status === "paused");
        if (running) setActiveSessionId(running.id);
      }

      // Fetch real computed HireScore from backend
      const latestHs = await hireScoreApi.getLatestHireScore().catch(() => null);
      if (latestHs?.overall_score !== undefined && latestHs.overall_score > 0) {
        setHireScore(latestHs.overall_score);
      }
    } catch {
      // Graceful error handling
    }
  };

  useEffect(() => {
    void fetchExecutiveData();
  }, []);

  const candidateName = user?.full_name || "Candidate";
  const targetRole = user?.target_role || "Senior Full-Stack Engineer";
  const experienceLevel = user?.experience_level || "Senior";

  let overallStatus: "Baseline Set" | "Assessment Completed" | "Interview Completed" | "Evaluation Ready" = "Baseline Set";
  if (hireScore !== undefined) overallStatus = "Evaluation Ready";
  else if (interviewCompletedCount > 0) overallStatus = "Interview Completed";
  else if (assessmentScore !== undefined) overallStatus = "Assessment Completed";

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Executive Header & Candidate Overview */}
      <ExecutiveHeader
        candidateName={candidateName}
        targetRole={targetRole}
        experienceLevel={experienceLevel}
        overallStatus={overallStatus}
        resume={resume}
        onPreviewResume={() => setShowPreview(true)}
      />

      {/* Resume Intelligence Pipeline (Upload & Parse) */}
      <div id="resume">
        <ResumeIntelligenceCenterpiece 
          resume={resume} 
          onUploadSuccess={(newResume) => {
            setResume(newResume);
            updateUserState({ resume_uploaded: true });
          }}
          onDeleteSuccess={() => {
            setResume(null);
            updateUserState({ resume_uploaded: false });
          }}
          onPreviewClick={() => setShowPreview(true)}
        />
      </div>

      {/* Executive Summaries (Assessment, Interview, Evaluation, Continue Session) */}
      <ExecutiveSummaries
        assessmentScore={assessmentScore}
        strongConcepts={strongConcepts}
        weakConcepts={weakConcepts}
        interviewCompletedCount={interviewCompletedCount}
        hireScore={hireScore}
        activeSessionId={activeSessionId}
        onContinueSession={(sid) => navigate(`/interview/${sid}`)}
        onOpenEvaluation={() => navigate("/interview/sess-ai-demo/evaluation")}
      />

      {/* Career Roadmap Timeline */}
      <div id="roadmap" className="scroll-mt-24">
        <CareerRoadmapTimeline />
      </div>

      {/* Executive Intelligence Deck (Evolution Graph, Timeline, AI Recommendations) */}
      <ExecutiveIntelligenceDeck />

      {/* Recruiter Share Portfolio Section */}
      <div id="portfolio" className="scroll-mt-24">
        <PortfolioShareSection />
      </div>

      {showPreview && resume && (
        <ResumePdfPreview resumeId={resume.id} filename={resume.filename} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

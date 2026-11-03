import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { resumeApi, type ResumeDetail } from "@/services/resumeApi";
import { assessmentApi } from "@/services/assessmentApi";
import { interviewApi } from "@/services/interviewApi";
import { evaluationReportApi } from "@/services/evaluationReportApi";
import { careerApi, type ShareSettings } from "@/services/careerApi";
import { ExecutiveHeader } from "@/components/dashboard/ExecutiveHeader";
import { ExecutiveSummaries } from "@/components/dashboard/ExecutiveSummaries";
import { ExecutiveIntelligenceDeck } from "@/components/dashboard/ExecutiveIntelligenceDeck";
import { ResumePdfPreview } from "@/components/resume/ResumePdfPreview";
import { ResumeIntelligenceCenterpiece } from "@/components/dashboard/ResumeIntelligenceCenterpiece";
import { CareerRoadmapTimeline } from "@/components/dashboard/CareerRoadmapTimeline";
import { PortfolioShareSection } from "@/components/dashboard/PortfolioShareSection";
import { ResetProgressModal } from "@/components/dashboard/ResetProgressModal";

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
  const [showResetModal, setShowResetModal] = useState(false);

  // Summaries state
  const [assessmentScore, setAssessmentScore] = useState<number | undefined>(undefined);
  const [strongConcepts, setStrongConcepts] = useState<string[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [interviewCompletedCount, setInterviewCompletedCount] = useState<number>(0);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [hireScore, setHireScore] = useState<number | undefined>(undefined);
  const [latestReportId, setLatestReportId] = useState<string | undefined>(undefined);
  const [latestInterviewScore, setLatestInterviewScore] = useState<number | undefined>(undefined);
  const [evolutionScores, setEvolutionScores] = useState<number[]>([]);
  const [reportWeaknesses, setReportWeaknesses] = useState<string[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSettings | null>(null);

  const fetchExecutiveData = async () => {
    try {
      const latestResume = await resumeApi.getLatestResume().catch(() => null);
      setResume(latestResume);
      if (latestResume) updateUserState({ resume_uploaded: true });

      const latestAssessment = await assessmentApi.getLatestAssessment().catch(() => null);
      if (latestAssessment && typeof latestAssessment.score === "number") {
        setAssessmentScore(latestAssessment.score);
        setStrongConcepts(latestAssessment.strong_concepts || []);
        setWeakConcepts(latestAssessment.weak_concepts || []);
      } else {
        setAssessmentScore(undefined);
        setStrongConcepts([]);
        setWeakConcepts([]);
      }

      const history = await interviewApi.getHistory(10, 0).catch(() => null);
      if (history?.sessions?.length) {
        const completed = history.sessions.filter((s) => s.status === "completed");
        setInterviewCompletedCount(completed.length);
        const running = history.sessions.find((s) => s.status === "running" || s.status === "paused");
        setActiveSessionId(running ? running.id : undefined);
      } else {
        setInterviewCompletedCount(0);
        setActiveSessionId(undefined);
      }

      // Fetch real computed HireScore from Immutable Evaluation Reports history
      const reportHistory = await evaluationReportApi.getHistory().catch(() => []);
      if (reportHistory && reportHistory.length > 0 && reportHistory[0]) {
        setHireScore(reportHistory[0].hirescore);
        setLatestReportId(reportHistory[0].id);
        setLatestInterviewScore(reportHistory[0].interview_score);
        setEvolutionScores(reportHistory.map((r) => r.hirescore).reverse());
        setReportWeaknesses(reportHistory[0].weaknesses || []);
      } else {
        setHireScore(undefined);
        setLatestReportId(undefined);
        setLatestInterviewScore(undefined);
        setEvolutionScores([]);
        setReportWeaknesses([]);
      }

      const settings = await careerApi.getShareSettings().catch(() => null);
      setShareSettings(settings);
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

  // Build real activities list for deck
  const activities = [];
  if (hireScore !== undefined) {
    activities.push({
      id: "act-eval",
      title: `Evaluation Report Generated (${hireScore} HireScore)`,
      timestamp: "Audit Verified",
      type: "evaluation" as const,
    });
  }
  if (interviewCompletedCount > 0) {
    activities.push({
      id: "act-int",
      title: `${interviewCompletedCount} Mock Interview Session${interviewCompletedCount > 1 ? "s" : ""} Completed`,
      timestamp: "Verified",
      type: "interview" as const,
    });
  }
  if (assessmentScore !== undefined) {
    activities.push({
      id: "act-ass",
      title: `Technical Assessment Completed (${assessmentScore}%)`,
      timestamp: "Calibrated",
      type: "assessment" as const,
    });
  }
  if (resume) {
    activities.push({
      id: "act-res",
      title: `Resume Parsed: ${resume.filename}`,
      timestamp: "Indexed",
      type: "resume" as const,
    });
  }

  // Build real recommendations list for deck
  const recommendations: string[] = [];
  if (reportWeaknesses.length > 0) {
    reportWeaknesses.slice(0, 3).forEach((w) => recommendations.push(`Remediate gap: ${w}`));
  } else if (weakConcepts.length > 0) {
    weakConcepts.slice(0, 3).forEach((c) => recommendations.push(`Reinforce conceptual mastery: ${c}`));
  } else {
    recommendations.push(
      "Upload a tailored PDF resume to calibrate role-specific competencies.",
      "Execute the proctored technical assessment to establish your verified knowledge score.",
      "Complete an AI mock interview round to evaluate real-time architectural reasoning."
    );
  }

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
        onResetProgress={() => setShowResetModal(true)}
      />

      <ResetProgressModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onResetSuccess={() => {
          setAssessmentScore(undefined);
          setStrongConcepts([]);
          setWeakConcepts([]);
          setInterviewCompletedCount(0);
          setActiveSessionId(undefined);
          setHireScore(undefined);
          setLatestReportId(undefined);
          setLatestInterviewScore(undefined);
          setEvolutionScores([]);
          setReportWeaknesses([]);
          void fetchExecutiveData();
        }}
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
        onOpenEvaluation={() => navigate(latestReportId ? `/evaluation/${latestReportId}` : "/evaluation")}
      />

      {/* Career Roadmap Timeline */}
      <div id="roadmap" className="scroll-mt-24">
        <CareerRoadmapTimeline
          hasResume={Boolean(resume)}
          skillsCount={resume?.parsed_data?.skills?.length || 0}
          assessmentScore={assessmentScore}
          interviewCompletedCount={interviewCompletedCount}
          latestInterviewScore={latestInterviewScore}
          hireScore={hireScore}
        />
      </div>

      {/* Executive Intelligence Deck (Evolution Graph, Timeline, AI Recommendations) */}
      <ExecutiveIntelligenceDeck
        evolutionScores={evolutionScores}
        activities={activities}
        recommendations={recommendations}
      />

      {/* Recruiter Share Portfolio Section */}
      <div id="portfolio" className="scroll-mt-24">
        <PortfolioShareSection
          shareSettings={shareSettings}
          onRefreshSettings={fetchExecutiveData}
        />
      </div>

      {showPreview && resume && (
        <ResumePdfPreview resumeId={resume.id} filename={resume.filename} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

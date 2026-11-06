import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { careerApi, PublicPortfolioData } from "@/services/careerApi";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Award,
  Cpu,
  Code2,
  BrainCircuit,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function PublicPortfolioPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PublicPortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPortfolio = async () => {
      if (!token) {
        setError("Invalid portfolio link.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await careerApi.getPublicPortfolio(token);
        if (mounted) {
          setPortfolio(data);
        }
      } catch (err: any) {
        if (mounted) {
          if (err.response?.status === 404) {
            setError(
              "This candidate portfolio is currently private or the share link has expired."
            );
          } else {
            setError(
              "Unable to load candidate portfolio at this time. Please try again later."
            );
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchPortfolio();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-[#A8D8C3]/40" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-t-[#1E8C5A] animate-spin" />
          </div>
          <p className="text-xs font-mono font-semibold text-[#5A6E8C] uppercase tracking-widest">
            Verifying Recruiter Portfolio Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-glass-modal flex flex-col items-center text-center gap-5">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#263D68]">
              Portfolio Unavailable
            </h2>
            <p className="text-xs text-[#5A6E8C] mt-2 leading-relaxed">
              {error || "This recruiter portfolio link is either private or invalid."}
            </p>
          </div>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-[#263D68] text-white text-xs font-bold hover:bg-[#1f3153] transition-colors"
          >
            Return to GetHire
          </Link>
        </div>
      </div>
    );
  }

  const {
    candidate_name,
    target_role,
    experience_level,
    overall_hirescore,
    hiring_verdict,
    skills,
    assessment_score,
    assessment_concepts,
    components,
  } = portfolio;

  return (
    <div className="min-h-screen bg-transparent text-[#263D68] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Navigation Bar / Recruiter Verification Header */}
        <header className="flex items-center justify-between border-b border-[#E4EDF5] pb-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-[#263D68]">
              GetHire<span className="text-[#1E8C5A]">.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/50">
            <ShieldCheck className="h-4 w-4" />
            <span>AUDIT VERIFIED PORTFOLIO</span>
          </div>
        </header>

        {/* Hero Card */}
        <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5245A4]">
              Verified Candidate
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263D68]">
              {candidate_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A6E8C] font-medium">
              <span>{target_role}</span>
              <span>•</span>
              <span>{experience_level}</span>
            </div>
          </div>

          {/* HireScore Showcase Box */}
          <div className="p-5 rounded-2xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex items-center gap-5 shrink-0">
            <div className="text-center">
              <span className="text-[10px] font-mono text-[#5A6E8C] uppercase block">
                Composite HireScore
              </span>
              <span className="text-3xl font-black text-[#263D68]">
                {overall_hirescore > 0 ? overall_hirescore : "--"}
                <span className="text-xs font-normal text-[#5A6E8C]">/100</span>
              </span>
            </div>
            <div className="h-10 w-px bg-[#D0DCE8]" />
            <div>
              <span className="text-[10px] font-mono text-[#5A6E8C] uppercase block">
                Readiness Verdict
              </span>
              <span className="text-sm font-bold text-[#1E8C5A] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {hiring_verdict}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Performance Components */}
        {components && Object.keys(components).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E8C] mb-1">
                <Cpu className="h-4 w-4 text-[#2B7FAD]" />
                <span>Technical</span>
              </div>
              <span className="text-xl font-bold text-[#263D68]">
                {components.technical_accuracy ?? "--"}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E8C] mb-1">
                <BrainCircuit className="h-4 w-4 text-[#1E8C5A]" />
                <span>Problem Solving</span>
              </div>
              <span className="text-xl font-bold text-[#263D68]">
                {components.problem_solving ?? "--"}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E8C] mb-1">
                <MessageSquare className="h-4 w-4 text-[#5245A4]" />
                <span>Communication</span>
              </div>
              <span className="text-xl font-bold text-[#263D68]">
                {components.communication ?? "--"}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E8C] mb-1">
                <Award className="h-4 w-4 text-amber-600" />
                <span>STAR Delivery</span>
              </div>
              <span className="text-xl font-bold text-[#263D68]">
                {components.star_structure ?? "--"}%
              </span>
            </div>
          </div>
        )}

        {/* Verified Skills */}
        {skills && skills.length > 0 && (
          <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#2B7FAD]" />
              Verified Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 text-xs font-mono font-medium text-[#263D68]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technical Assessment Concept Analysis */}
        {assessment_score !== null && assessment_score !== undefined && (
          <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E4EDF5] pb-3">
              <h3 className="text-sm font-bold text-[#263D68] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#1E8C5A]" />
                Proctored Technical Assessment
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/50">
                Score: {assessment_score}%
              </span>
            </div>

            {assessment_concepts?.strong_concepts && assessment_concepts.strong_concepts.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-[#5A6E8C] uppercase block mb-2">
                  Validated Conceptual Strengths
                </span>
                <div className="flex flex-wrap gap-2">
                  {assessment_concepts.strong_concepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#F0FAF5] border border-[#A8D8C3]/60 text-xs text-[#1E8C5A] font-medium"
                    >
                      ✓ {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security & Privacy Transparency Notice */}
        <div className="p-4 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 text-[11px] text-[#5A6E8C] leading-relaxed flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#1E8C5A] shrink-0" />
          <span>
            Candidate privacy verified: Raw interview transcripts, webcam telemetry logs, and personal credentials are protected and excluded from public recruiter portfolios.
          </span>
        </div>

      </div>
    </div>
  );
}

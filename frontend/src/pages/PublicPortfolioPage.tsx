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
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090B] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-t-emerald-500 animate-spin" />
          </div>
          <p className="text-xs font-mono font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-widest">
            Verifying Recruiter Portfolio Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090B] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center text-center gap-5">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Portfolio Unavailable
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2 leading-relaxed">
              {error || "This recruiter portfolio link is either private or invalid."}
            </p>
          </div>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090B] text-slate-900 dark:text-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Navigation Bar / Recruiter Verification Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              GetHire<span className="text-emerald-500">.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            <span>AUDIT VERIFIED PORTFOLIO</span>
          </div>
        </header>

        {/* Hero Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Verified Executive Candidate
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {candidate_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-neutral-400 font-medium">
              <span>{target_role}</span>
              <span>•</span>
              <span>{experience_level}</span>
            </div>
          </div>

          {/* HireScore Showcase Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-5 shrink-0">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase block">
                Composite HireScore
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {overall_hirescore > 0 ? overall_hirescore : "--"}
                <span className="text-xs font-normal text-slate-400 dark:text-neutral-500">/100</span>
              </span>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase block">
                Readiness Verdict
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {hiring_verdict}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Performance Components */}
        {components && Object.keys(components).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span>Technical</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {components.technical_accuracy ?? "--"}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                <BrainCircuit className="h-4 w-4 text-emerald-500" />
                <span>Problem Solving</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {components.problem_solving ?? "--"}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span>Communication</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {components.communication ?? "--"}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                <Award className="h-4 w-4 text-amber-500" />
                <span>STAR Delivery</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {components.star_structure ?? "--"}%
              </span>
            </div>
          </div>
        )}

        {/* Verified Skills */}
        {skills && skills.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-500" />
              Verified Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-800 dark:text-neutral-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technical Assessment Concept Analysis (Included if enabled by candidate) */}
        {assessment_score !== null && assessment_score !== undefined && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111217] border border-slate-200 dark:border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Proctored Technical Assessment
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Score: {assessment_score}%
              </span>
            </div>

            {assessment_concepts?.strong_concepts && assessment_concepts.strong_concepts.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500 uppercase block mb-2">
                  Validated Conceptual Strengths
                </span>
                <div className="flex flex-wrap gap-2">
                  {assessment_concepts.strong_concepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium"
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
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>
            Candidate privacy verified: Raw interview transcripts, webcam telemetry logs, and personal credentials are protected and excluded from public recruiter portfolios.
          </span>
        </div>

      </div>
    </div>
  );
}

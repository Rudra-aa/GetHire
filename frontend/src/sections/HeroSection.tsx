import { lazy, Suspense, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Lock, CheckCircle, Crosshair, Zap, Trophy } from "lucide-react";

const BiometricScan = lazy(() => import("@/components/hero/BiometricScan"));

const outcomeHighlights = [
  {
    icon: <Crosshair className="h-4 w-4 text-[#1E8C5A]" />,
    iconBg: "bg-[#A8D8C3]/25 border-[#A8D8C3]/40 text-[#1E8C5A]",
    title: "Your Resume As Blueprint",
    desc: "Every question is generated directly from your actual production experience.",
  },
  {
    icon: <Zap className="h-4 w-4 text-[#2B7FAD]" />,
    iconBg: "bg-[#B9D9EC]/30 border-[#B9D9EC]/50 text-[#2B7FAD]",
    title: "Zero-Latency Multimodal Simulation",
    desc: "Real-time voice pacing, facial composure, and STAR rigor analyzed seamlessly.",
  },
  {
    icon: <Trophy className="h-4 w-4 text-[#6E5EBB]" />,
    iconBg: "bg-[#DCD5F0]/35 border-[#DCD5F0]/50 text-[#6E5EBB]",
    title: "Pre-Emptive Recruiter Scoring",
    desc: "Know your exact HireScore™ and benchmark before the recruiter does.",
  },
];

export const HeroSection = memo(function HeroSection() {
  return (
    <section id="hero" className="relative w-full bg-transparent pt-24 sm:pt-28 pb-14 sm:pb-20 overflow-hidden">
      {/* Soft Ambient Chromatic Glows behind Hero */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#B9D9EC]/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-[#A8D8C3]/18 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 rounded-full bg-[#DCD5F0]/20 blur-[90px] pointer-events-none" />

      <div className="section-container relative z-10 flex flex-col">
        {/* ── Upper fold: 2 Columns ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[48fr_52fr] items-center gap-8 lg:gap-12">

          {/* Left: Editorial headline and CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start gap-5 max-w-xl"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A] text-[11px] font-sans font-bold tracking-wider uppercase shadow-[0_1px_4px_rgba(168,216,195,0.25)]">
              <span className="h-2 w-2 rounded-full bg-[#1E8C5A]" />
              Intelligent Career Operating System
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.08] font-black tracking-tight text-[#263D68]">
              Master Your Next <br />
              Interview <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#263D68] via-[#2B7FAD] to-[#1E8C5A]">
                Before You Walk In <br />
                The Room
              </span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-xs sm:text-[13px] text-[#5A6E8C] leading-relaxed max-w-lg">
              GetHire decodes your resume, constructs an adaptive technical gauntlet, evaluates your responses live with multi-signal intelligence, and ensures you meet top-tier engineering standards.
            </p>

            {/* Outcome transformation bullet cards */}
            <div className="flex flex-col gap-2.5 w-full">
              {outcomeHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/75 backdrop-blur-md hover:bg-white/90 border border-[#D0DCE8]/80 hover:border-[#B9D9EC] shadow-[0_4px_20px_-2px_rgba(38,61,104,0.05),0_2px_6px_-1px_rgba(38,61,104,0.03)] hover:shadow-[0_8px_25px_-4px_rgba(38,61,104,0.08)] transition-all duration-300 group"
                >
                  <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-bold text-[#263D68] group-hover:text-[#1E8C5A] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[#5A6E8C] leading-snug mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full sm:w-auto">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-[13px] font-black text-[#1A2D52] shadow-[0_2px_8px_rgba(168,216,195,0.40)] hover:brightness-105 transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
              >
                <span>Start Free Practice Session</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <a
                href="#workflow"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs sm:text-[13px] font-bold text-[#263D68] hover:text-[#1A2D52] bg-white/80 backdrop-blur-sm hover:bg-white border border-[#D0DCE8]/80 transition-all w-full sm:w-auto shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-[#1E8C5A] text-[#1E8C5A]" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Trust marks */}
            <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-[#D0DCE8] text-[11px] font-medium text-[#5A6E8C]">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#1E8C5A]" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#2B7FAD]" />
                <span>Private & Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-[#6E5EBB]" />
                <span>Tier 1 Calibrated</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Platform ecosystem centerpiece */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <Suspense fallback={<div className="w-full h-full min-h-[380px]" />}>
              <BiometricScan />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;

import { lazy, Suspense, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Lock, CheckCircle, Crosshair, Zap, Trophy } from "lucide-react";

const BiometricScan = lazy(() => import("@/components/hero/BiometricScan"));

const outcomeHighlights = [
  {
    icon: <Crosshair className="h-4 w-4 text-[#39FF88]" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/30 text-[#39FF88]",
    title: "Your Resume As Blueprint",
    desc: "Every question is generated directly from your actual production experience.",
  },
  {
    icon: <Zap className="h-4 w-4 text-[#4DA8FF]" />,
    iconBg: "bg-blue-500/10 border-blue-500/30 text-[#4DA8FF]",
    title: "Zero-Latency Multimodal Simulation",
    desc: "Real-time voice pacing, facial composure, and STAR rigor analyzed at 60 FPS.",
  },
  {
    icon: <Trophy className="h-4 w-4 text-[#FFD54A]" />,
    iconBg: "bg-amber-500/10 border-amber-500/30 text-[#FFD54A]",
    title: "Pre-Emptive Recruiter Scoring",
    desc: "Know your exact HireScore™ and L5/L6 benchmark before the recruiter does.",
  },
];

export const HeroSection = memo(function HeroSection() {
  return (
    <section id="hero" className="relative w-full bg-transparent pt-24 sm:pt-28 pb-14 sm:pb-20 overflow-hidden">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#39FF88] text-[11px] font-mono font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(57,255,136,0.15)]">
              <span className="h-2 w-2 rounded-full bg-[#39FF88] shadow-[0_0_8px_#39FF88] animate-pulse" />
              AI Career Operating System
            </div>

            {/* Headline matching screenshot 2 */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.08] font-black tracking-tight text-white">
              Master Your Next <br />
              Interview <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86EFAC] via-[#39FF88] via-[#60A5FA] to-[#A78BFA]">
                Before You Walk In <br />
                The Room
              </span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed max-w-lg">
              GetHire decodes your resume, constructs an adaptive technical gauntlet, grades your answers live with multi-signal AI, and guarantees you meet Senior & Staff engineering standards.
            </p>

            {/* Outcome transformation bullet cards */}
            <div className="flex flex-col gap-2.5 w-full">
              {outcomeHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group"
                >
                  <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-bold text-white group-hover:text-[#39FF88] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] sm:text-xs text-neutral-400 leading-snug mt-0.5">
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-[13px] font-black text-black bg-gradient-to-r from-[#86EFAC] via-[#39FF88] to-[#60A5FA] shadow-[0_0_25px_rgba(57,255,136,0.4)] hover:brightness-110 transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
              >
                <span>Start Free Practice Session</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <a
                href="#workflow"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs sm:text-[13px] font-bold text-neutral-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors w-full sm:w-auto"
              >
                <Play className="h-3.5 w-3.5 fill-[#39FF88] text-[#39FF88]" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Trust marks */}
            <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#39FF88]" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#4DA8FF]" />
                <span>Private & Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-[#FFD54A]" />
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

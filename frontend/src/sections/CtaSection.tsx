import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Trophy, Zap } from "lucide-react";

export const CtaSection = memo(function CtaSection() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      {/* Background Matrix & Center Glow */}
      <div className="absolute inset-0 bg-grid-matrix opacity-35 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 vignette-radial pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="p-10 sm:p-16 rounded-[2.5rem] glass-card-luxury bg-[#111217]/95 border border-white/[0.12] relative overflow-hidden flex flex-col items-center text-center gap-8 shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
          {/* Ambient center radial */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-emerald-500/[0.06] via-transparent to-blue-500/[0.04]" />

          {/* Eyebrow */}
          <div className="eyebrow-pill relative z-10">
            <Sparkles className="h-3.5 w-3.5 text-[#39FF88]" />
            Join 12,000+ Hired Candidates
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight relative z-10">
            Walk into Your Next Interview <br />
            <span className="gradient-text-luxury">With Complete Confidence</span>
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed relative z-10">
            Upload your resume now, run your first adaptive simulation, and receive your comprehensive HireScore™ and gap remediation roadmap in under 10 minutes.
          </p>

          {/* Magnetic Final Launch CTA Button */}
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              to="/register"
              className="gradient-btn-luxury inline-flex items-center gap-3 px-9 py-4 rounded-full text-xs sm:text-sm font-black shadow-[0_0_35px_rgba(57,255,136,0.35)] tracking-wide"
            >
              <span>Start Free Practice Session</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust and Feature Micro-Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-neutral-400 relative z-10">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#39FF88]" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#4DA8FF]" />
              <span>Instant AI Simulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-[#FFD54A]" />
              <span>Tier 1 Calibrated Rubrics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CtaSection;

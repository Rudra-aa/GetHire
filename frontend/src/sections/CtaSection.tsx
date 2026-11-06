import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Trophy, Zap } from "lucide-react";

export const CtaSection = memo(function CtaSection() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="p-10 sm:p-16 rounded-[2.5rem] bg-white/75 backdrop-blur-xl border border-[#D0DCE8]/80 relative overflow-hidden flex flex-col items-center text-center gap-8 shadow-glass-hover">
          {/* Eyebrow */}
          <div className="eyebrow-pill relative z-10">
            <Sparkles className="h-3.5 w-3.5 text-[#1E8C5A]" />
            Join 12,000+ Candidates
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#263D68] max-w-3xl leading-tight relative z-10">
            Walk into Your Next Interview <br />
            <span className="gradient-text-luxury">With Complete Confidence</span>
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#5A6E8C] max-w-xl leading-relaxed relative z-10">
            Upload your resume now, run your first simulation, and receive your comprehensive HireScore™ and gap remediation roadmap in under 10 minutes.
          </p>

          {/* Final Launch CTA Button */}
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full text-xs sm:text-sm font-bold text-[#1A2D52] shadow-[0_2px_12px_rgba(168,216,195,0.45)] hover:brightness-105 transition-all tracking-wide hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
            >
              <span>Start Free Practice Session</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust and Feature Micro-Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-[#D0DCE8] text-[11px] font-sans font-medium text-[#5A6E8C] relative z-10">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#1E8C5A]" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#2B7FAD]" />
              <span>Instant Simulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-[#6E5EBB]" />
              <span>Tier 1 Calibrated Rubrics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CtaSection;

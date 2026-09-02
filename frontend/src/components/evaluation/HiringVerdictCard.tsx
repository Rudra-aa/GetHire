/**
 * HiringVerdictCard.tsx
 * ──────────────────────
 * Hiring Recommendation Card matching exact reference specs:
 * Large verdict title, star rating, recommendation paragraph, confidence gauge.
 * Occupies 4 columns of the 12-column grid in Row 2.
 */
import React from "react";
import { GlassCard } from "./GlassCard";
import { Crown, Star } from "lucide-react";

interface HiringVerdictCardProps {
  overallScore: number;
}

const getHiringVerdict = (score: number) => {
  if (score >= 88) {
    return {
      title: "Strong Hire",
      color: "text-[#39FF88]",
      stars: 5,
      confidence: 94,
      paragraph: "Exceptional candidate. Demonstrated deep architectural understanding, clean code practices, and strong communication skills.",
    };
  }
  if (score >= 72) {
    return {
      title: "Leaning Hire",
      color: "text-[#FFD54A]",
      stars: 3,
      confidence: 72,
      paragraph: "Good potential. With further improvement in core concepts and optimization, you are suitable for mid-level roles.",
    };
  }
  if (score >= 55) {
    return {
      title: "Borderline",
      color: "text-[#FFD54A]",
      stars: 2,
      confidence: 58,
      paragraph: "Foundational knowledge present, but key areas in problem-solving and communication need refinement before hiring.",
    };
  }
  return {
    title: "Needs Improvement",
    color: "text-rose-400",
    stars: 1,
    confidence: 40,
    paragraph: "Significant skill gaps identified in technical accuracy and concept coverage. Further study and practice required.",
  };
};

export const HiringVerdictCard: React.FC<HiringVerdictCardProps> = ({ overallScore }) => {
  const verdict = getHiringVerdict(overallScore);

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-gold-400" />
        <h3 className="text-sm font-bold text-white">Hiring Recommendation</h3>
      </div>

      {/* Main Verdict Content */}
      <div className="flex flex-col items-center justify-center text-center my-3 gap-2">
        <h4 className={`text-2xl font-black ${verdict.color} tracking-tight font-display`}>
          {verdict.title}
        </h4>

        {/* Stars */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < verdict.stars
                  ? "text-gold-400 fill-gold-400"
                  : "text-neutral-600 fill-neutral-800"
              }`}
            />
          ))}
        </div>

        {/* Recommendation Paragraph */}
        <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mt-1">
          {verdict.paragraph}
        </p>
      </div>

      {/* Footer Confidence Bar */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-neutral-400">Confidence Level</span>
        <div className="flex items-center gap-2.5 flex-1 max-w-[150px]">
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-[#39FF88] rounded-full transition-all duration-700"
              style={{ width: `${verdict.confidence}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#39FF88] font-mono shrink-0">
            {verdict.confidence}%
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

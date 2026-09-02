/**
 * StrengthsPanel.tsx
 * ───────────────────
 * Top 5 Strengths panel matching exact reference specs:
 * Shows top 5 green checkmark items initially with "View All →" button.
 */
import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface StrengthsPanelProps {
  strengths: string[];
}

const DEFAULT_STRENGTHS = [
  "Clear understanding of core backend concepts",
  "Good use of examples in explanations",
  "Strong grasp of React fundamentals",
  "Logical approach to problem solving",
  "Effective communication of ideas",
  "Solid error handling awareness",
  "Clean code structure and formatting",
];

const PREVIEW_LIMIT = 5;

export const StrengthsPanel: React.FC<StrengthsPanelProps> = ({ strengths }) => {
  const items = strengths.length > 0 ? strengths : DEFAULT_STRENGTHS;
  const [expanded, setExpanded] = useState(false);

  const displayItems = expanded ? items : items.slice(0, PREVIEW_LIMIT);

  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#39FF88]" />
          Top Strengths
        </h3>
        {items.length > PREVIEW_LIMIT && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-[10px] font-bold text-[#39FF88] hover:underline flex items-center gap-1"
          >
            {expanded ? "Show Less" : "View All →"}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {displayItems.map((str, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-snug">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#39FF88] shrink-0 mt-0.5" />
            <span>{str}</span>
          </div>
        ))}
      </div>

      {/* Footer Toggle */}
      {items.length > PREVIEW_LIMIT && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center justify-center gap-1 pt-1 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> Collapse Strengths</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> Show {items.length - PREVIEW_LIMIT} More</>
          )}
        </button>
      )}
    </GlassCard>
  );
};

/**
 * ImprovementPanel.tsx
 * ────────────────────
 * Areas to Improve panel matching exact reference specs:
 * Shows top 5 amber warning items initially with "View All →" button.
 */
import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface ImprovementPanelProps {
  improvements: string[];
  weaknesses: string[];
}

const DEFAULT_IMPROVEMENTS = [
  "Optimize code for better performance",
  "Improve database query optimization",
  "Add more test cases in solutions",
  "Explain time & space complexity clearly",
  "Strengthen system design explanations",
  "Elaborate on edge case handling",
];

const PREVIEW_LIMIT = 5;

export const ImprovementPanel: React.FC<ImprovementPanelProps> = ({
  improvements,
  weaknesses,
}) => {
  const combined = Array.from(new Set([...improvements, ...weaknesses]));
  const items = combined.length > 0 ? combined : DEFAULT_IMPROVEMENTS;
  const [expanded, setExpanded] = useState(false);

  const displayItems = expanded ? items : items.slice(0, PREVIEW_LIMIT);

  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#263D68] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Areas to Improve
        </h3>
        {items.length > PREVIEW_LIMIT && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {expanded ? "Show Less" : "View All →"}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#5A6E8C] leading-snug">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Footer Toggle */}
      {items.length > PREVIEW_LIMIT && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center justify-center gap-1 pt-1 text-[10px] text-[#5A6E8C] hover:text-[#263D68] transition-colors cursor-pointer"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> Collapse Improvements</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> Show {items.length - PREVIEW_LIMIT} More</>
          )}
        </button>
      )}
    </GlassCard>
  );
};

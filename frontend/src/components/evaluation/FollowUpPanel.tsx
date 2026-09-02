/**
 * FollowUpPanel.tsx
 * ──────────────────
 * Collapsible Follow-up Questions card matching exact design specs:
 * Collapsed by default, showing only 1st recommendation, expandable to reveal remaining.
 */
import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { HelpCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import type { EvaluationDetail } from "@/services/evaluationApi";

interface FollowUpPanelProps {
  evaluations: EvaluationDetail[];
}

const DEFAULT_FOLLOWUPS = [
  "Can you explain the trade-offs in your caching approach?",
  "How would you handle a high traffic scenario during database migration?",
  "What strategies would you use to prevent SQL injection in raw query execution?",
  "Could you elaborate on the time complexity of your LRU cache get and put operations?",
];

export const FollowUpPanel: React.FC<FollowUpPanelProps> = ({ evaluations }) => {
  const extracted = evaluations
    .map((e) => e.follow_up?.suggested_follow_up)
    .filter(Boolean) as string[];

  const items = extracted.length > 0 ? extracted : DEFAULT_FOLLOWUPS;
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, 1);

  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#8B5CF6]" />
          Follow-up Recommendations
        </h3>
        {items.length > 1 && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-[10px] font-bold text-[#8B5CF6] hover:underline"
          >
            {expanded ? "Collapse" : `View All (${items.length})`}
          </button>
        )}
      </div>

      {/* Visible List */}
      <div className="flex flex-col gap-2">
        {visible.map((q, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 flex items-start gap-2 text-xs text-neutral-200"
          >
            <ArrowRight className="h-3.5 w-3.5 text-[#8B5CF6] shrink-0 mt-0.5" />
            <span className="italic font-medium">"{q}"</span>
          </div>
        ))}
      </div>

      {/* Expand/Collapse footer */}
      {items.length > 1 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center justify-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors pt-1"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> Show Less</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> Reveal {items.length - 1} More Recommendations</>
          )}
        </button>
      )}
    </GlassCard>
  );
};

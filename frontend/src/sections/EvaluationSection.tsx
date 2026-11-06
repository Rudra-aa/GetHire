import { useState, memo } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Trophy } from "lucide-react";

const rubricTabs = [
  {
    id: "star",
    label: "STAR Framework Rigor",
    desc: "Evaluates whether your response clearly articulates Situation, Task, Action, and measurable Results.",
    checklist: [
      { label: "Situation Context", status: "pass", note: "Clearly articulated production constraints (10M TPS scale and legacy monolith bottlenecks)." },
      { label: "Task Objective", status: "pass", note: "Identified exact performance requirements (P99 < 80ms and zero data loss SLAs)." },
      { label: "Action Specificity", status: "pass", note: "Deep architectural dive into Redis Lua atomic scripts and PostgreSQL sharding." },
      { label: "Quantified Result", status: "pass", note: "Verified measurable impact: 42% latency reduction and $180K/year cloud savings." },
    ],
  },
  {
    id: "technical",
    label: "Technical Depth & Trade-offs",
    desc: "Grades algorithmic correctness, trade-off depth, security implications, and edge-case handling.",
    checklist: [
      { label: "Algorithmic Complexity", status: "pass", note: "Correctly justified O(1) hash lookup vs O(log N) B-Tree indexing." },
      { label: "Trade-off Justification", status: "pass", note: "Explicitly contrasted Redis LRU vs LFU eviction strategies for hot keys." },
      { label: "Failure Mode Recovery", status: "pass", note: "Addressed circuit breakers, exponential backoff, and dead-letter queues." },
      { label: "Data Consistency", status: "warning", note: "Clarify eventual consistency bounds across multi-region read replicas." },
    ],
  },
  {
    id: "communication",
    label: "Vocal Cadence & Delivery",
    desc: "Measures speech pacing, filler word density, vocal composure, and structural signposting.",
    checklist: [
      { label: "Pacing Velocity", status: "pass", note: "138 words per minute (ideal conversational bandwidth for technical interviews)." },
      { label: "Filler Word Ratio", status: "pass", note: "Ultra-low filler density (<0.9% 'um' / 'like' occurrences)." },
      { label: "Structural Signposting", status: "pass", note: "Clear verbal markers between architectural tiers and execution phases." },
      { label: "Conciseness & Punch", status: "pass", note: "Delivered comprehensive system overview in under 2.5 minutes." },
    ],
  },
];

export const EvaluationSection = memo(function EvaluationSection() {
  const [activeTab, setActiveTab] = useState(rubricTabs[0]?.id ?? "star");
  const currentRubric = rubricTabs.find((r) => r.id === activeTab) || rubricTabs[0] || {
    id: "star",
    label: "STAR Framework Rigor",
    desc: "Evaluates whether your response clearly separates Situation, Task, Action, and Results.",
    checklist: [],
  };

  return (
    <section id="evaluation" className="py-24 bg-transparent relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E5EBB]" />
            Multi-Signal Evaluation System
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight">
            Know Your Interview Performance <br />
            <span className="gradient-text-luxury">Before The Recruiter Does</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            Every practice response is audited using structured, objective rubrics calibrated directly against Staff and Principal engineering interviewer standards.
          </p>
        </div>

        {/* Evaluation Rubric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
          {/* Tab Selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A6E8C] font-mono">
              Evaluation Rubrics
            </span>
            {rubricTabs.map((tab) => {
              const isSelected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all duration-300 ${
                    isSelected
                      ? "bg-white border-[#DCD5F0] shadow-[0_4px_20px_-2px_rgba(110,94,187,0.20)] ring-1 ring-[#DCD5F0]"
                      : "bg-white/75 backdrop-blur-md border border-[#D0DCE8]/80 hover:border-[#DCD5F0] hover:bg-white/90 shadow-xs"
                  }`}
                >
                  <h3 className={`text-xs font-bold ${isSelected ? "text-[#263D68]" : "text-[#5A6E8C]"}`}>
                    {tab.label}
                  </h3>
                  <p className="text-xs text-[#5A6E8C] leading-relaxed">{tab.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Detailed Rubric Sheet */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col justify-between gap-6 shadow-[0_8px_30px_-4px_rgba(38,61,104,0.08)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DCE8] text-xs">
              <span className="font-bold text-[#263D68] uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#6E5EBB]" />
                {currentRubric.label} Breakdown
              </span>
              <span className="font-mono text-[#6E5EBB] bg-[#DCD5F0]/35 px-2 py-0.5 rounded border border-[#DCD5F0]/50 text-[11px]">
                Tier 1 Staff Engineering Bar
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {currentRubric.checklist.map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-sm flex items-start gap-3.5">
                  {item.status === "pass" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#1E8C5A] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-[#D4921A] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-[#263D68]">{item.label}</h4>
                    <p className="text-xs text-[#5A6E8C] mt-1 leading-relaxed">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#D0DCE8] flex flex-wrap justify-between items-center text-xs text-[#5A6E8C] gap-2">
              <span className="font-mono text-[11px]">Objective Standard: STAR + Trade-off Rigor</span>
              <span className="text-[#1E8C5A] font-semibold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Calibrated & Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default EvaluationSection;

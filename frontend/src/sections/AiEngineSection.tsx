import { useState, memo } from "react";
import { Cpu, ArrowRight, Sparkles, Bot } from "lucide-react";

const interviewModes = [
  {
    id: "technical",
    name: "Technical Architecture",
    badge: "System Design · High-Throughput · Algorithms",
    desc: "Questions derived directly from your resume's stated technologies and production systems. Follow-ups adapt dynamically based on your trade-off justifications.",
    questions: [
      {
        q: "In your payments service, how did you handle distributed idempotency and atomic deduplication during network partitions with Redis?",
        tag: "System Design · Distributed State · High Concurrency",
      },
      {
        q: "When sharding your PostgreSQL database across multi-region clusters, how did you maintain transactional consistency for cross-shard ledger operations?",
        tag: "Databases · Sharding · ACID Guarantees",
      },
      {
        q: "How would you architect a Kafka consumer group to eliminate head-of-line blocking and prevent consumer rebalance storms under 50k RPS spike load?",
        tag: "Streaming · Kafka · Fault Tolerance",
      },
    ],
  },
  {
    id: "behavioral",
    name: "Executive Behavioral",
    badge: "STAR Framework · Engineering Leadership · Scope",
    desc: "Behavioral questions target leadership signals, high-stakes trade-offs, and cross-functional alignment extracted from your work experience.",
    questions: [
      {
        q: "Describe a high-stakes disagreement with a Principal Engineer regarding migrating from microservices back to a modular monolith. How did you resolve it?",
        tag: "Leadership · STAR · Technical Conflict",
      },
      {
        q: "Walk me through an incident where a critical production outage occurred under your on-call shift. What was your containment and post-mortem communication strategy?",
        tag: "Incident Command · Accountability · Post-Mortem",
      },
      {
        q: "How did you ramp up a distributed team of 8 engineers when inheriting a legacy codebase with zero integration test coverage?",
        tag: "Team Scaling · Mentorship · Engineering Culture",
      },
    ],
  },
  {
    id: "mixed",
    name: "Staff / Principal Hybrid",
    badge: "System Design + Engineering Strategy",
    desc: "Seamlessly alternates between deep technical architecture and organizational execution based on the depth and clarity of your spoken responses.",
    questions: [
      {
        q: "Your resume states you reduced P99 latency by 42%. What architectural trade-offs did you make, and how did you convince product leadership to prioritize tech debt?",
        tag: "Hybrid · Architecture · Product Alignment",
      },
      {
        q: "If your primary Redis cache cluster suffers catastrophic memory exhaustion during peak Cyber Monday traffic, what is your automated degradation fallback?",
        tag: "Reliability · Resilience · Circuit Breakers",
      },
      {
        q: "As a senior individual contributor, how do you mathematically decide when to build internal infrastructure vs buying commercial SaaS platforms?",
        tag: "Strategy · Build vs Buy · ROI Analysis",
      },
    ],
  },
];

export const AiEngineSection = memo(function AiEngineSection() {
  const [activeMode, setActiveMode] = useState(interviewModes[0]!.id);
  const current = interviewModes.find((m) => m.id === activeMode) ?? interviewModes[0]!;

  return (
    <section id="interview-engine" className="py-24 bg-[#F0F5F9]/30 relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2B7FAD]" />
            Adaptive Interview Engine
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight">
            Every Question Is Generated From <br />
            <span className="gradient-text-luxury">Your Exact Experience</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            No static question banks. If your resume mentions Redis caching or Kubernetes ingress, the system initiates a targeted system design probe that deepens based on your answers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
          {/* Mode selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A6E8C] font-mono">
              Select Assessment Dimension
            </span>
            {interviewModes.map((mode) => {
              const isActive = mode.id === activeMode;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-300 ${
                    isActive
                      ? "bg-white border-[#B9D9EC] shadow-[0_4px_20px_-2px_rgba(43,127,173,0.22)] ring-1 ring-[#B9D9EC]"
                      : "bg-white/75 backdrop-blur-md border border-[#D0DCE8]/80 hover:border-[#B9D9EC] hover:bg-white/90 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg border border-[#D0DCE8] bg-[#F0F5F9] flex items-center justify-center">
                        <Cpu className={`h-4 w-4 ${isActive ? "text-[#2B7FAD]" : "text-[#8FA3BC]"}`} />
                      </div>
                      <h3 className={`text-xs font-bold ${isActive ? "text-[#263D68]" : "text-[#5A6E8C]"}`}>
                        {mode.name}
                      </h3>
                    </div>
                    <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "text-[#2B7FAD] translate-x-0.5" : "text-[#8FA3BC]"}`} />
                  </div>
                  <p className="text-[11px] text-[#5A6E8C] font-mono leading-relaxed">{mode.badge}</p>
                </button>
              );
            })}
          </div>

          {/* Live question preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-5 shadow-[0_8px_30px_-4px_rgba(38,61,104,0.08)]">
            {/* Mode header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DCE8] text-xs">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#263D68] flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#2B7FAD]" />
                {current.name} Engine
              </span>
              <span className="font-mono text-[#2B7FAD] bg-[#B9D9EC]/30 px-2 py-0.5 rounded border border-[#B9D9EC]/50 text-[11px]">
                {current.badge}
              </span>
            </div>

            {/* Mode description */}
            <p className="text-xs text-[#5A6E8C] leading-relaxed">{current.desc}</p>

            {/* Sample questions */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E8C]">
                Generated Adaptive Sequence
              </span>
              {current.questions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 hover:border-[#B9D9EC] hover:bg-white/95 transition-all flex flex-col gap-2 group shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[11px] text-[#2B7FAD] font-bold mt-0.5 shrink-0 bg-[#B9D9EC]/30 px-1.5 py-0.2 rounded border border-[#B9D9EC]/50">
                      Q{idx + 1}
                    </span>
                    <p className="text-xs text-[#263D68] leading-relaxed font-medium">
                      {item.q}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#5A6E8C] ml-8">{item.tag}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#D0DCE8] flex items-center justify-between text-xs text-[#5A6E8C]">
              <span className="flex items-center gap-1.5 text-[#2B7FAD] font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Adaptive depth escalation active
              </span>
              <span className="font-mono text-[11px]">Inference Latency: 84ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AiEngineSection;

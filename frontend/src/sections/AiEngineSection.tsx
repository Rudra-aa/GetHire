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
    <section id="interview-engine" className="py-24 bg-transparent relative overflow-hidden">
      {/* ── Background Depth Matrix & Blue Ambient Lighting ────────────────── */}
      <div className="absolute inset-0 bg-dot-matrix opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 vignette-radial pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4DA8FF]" />
            Adaptive Interview Engine
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Every Question Is Generated From <br />
            <span className="gradient-text-luxury">Your Exact Experience</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
            No static question banks. If your resume mentions Redis caching or Kubernetes ingress, the AI initiates a targeted system design probe that deepens based on your answers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
          {/* Mode selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
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
                      ? "bg-[#111217] border-blue-500/40 shadow-[0_0_25px_rgba(77,168,255,0.15)]"
                      : "glass-card-luxury bg-[#111217]/70 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                        <Cpu className={`h-4 w-4 ${isActive ? "text-[#4DA8FF]" : "text-neutral-400"}`} />
                      </div>
                      <h3 className={`text-xs font-bold ${isActive ? "text-white" : "text-neutral-300"}`}>
                        {mode.name}
                      </h3>
                    </div>
                    <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "text-[#4DA8FF] translate-x-0.5" : "text-neutral-600"}`} />
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono leading-relaxed">{mode.badge}</p>
                </button>
              );
            })}
          </div>

          {/* Live question preview */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card-luxury bg-[#111217]/90 border border-white/[0.08] flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Mode header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-xs">
              <span className="font-bold uppercase tracking-wider text-[11px] text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#4DA8FF]" />
                {current.name} Engine
              </span>
              <span className="font-mono text-[#4DA8FF] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[11px]">
                {current.badge}
              </span>
            </div>

            {/* Mode description */}
            <p className="text-xs text-neutral-300 leading-relaxed">{current.desc}</p>

            {/* Sample questions */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Generated Adaptive Sequence
              </span>
              {current.questions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-blue-500/30 transition-colors flex flex-col gap-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[11px] text-[#4DA8FF] font-bold mt-0.5 shrink-0 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                      Q{idx + 1}
                    </span>
                    <p className="text-xs text-white leading-relaxed font-medium group-hover:text-neutral-100 transition-colors">
                      {item.q}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 ml-8">{item.tag}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-[#4DA8FF] font-semibold">
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

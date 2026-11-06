import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, CheckCircle2, FileText, Code2, Briefcase, Star, Sparkles, ShieldCheck } from "lucide-react";

const sampleProfiles = [
  {
    role: "Senior Distributed Systems Lead (Go / Kubernetes / Raft)",
    filename: "alex_systems_lead_resume.pdf",
    score: 92,
    extraction: [
      {
        category: "Technical Architecture",
        icon: <Code2 className="h-3.5 w-3.5 text-[#2B7FAD]" />,
        items: [
          "Go · gRPC · Envoy Service Mesh",
          "PostgreSQL Multi-Master Sharding",
          "Kafka Event Sourcing (10M TPS)",
          "Distributed Raft Consensus & Redis LRU",
        ],
        confidence: 97,
      },
      {
        category: "High-Impact Systems",
        icon: <Briefcase className="h-3.5 w-3.5 text-[#1E8C5A]" />,
        items: [
          "Core Payments Engine (Zero Loss SLAs)",
          "Global Distributed Rate Limiter Service",
          "Multi-Region Active-Active Replication",
          "Chaos Engineering & Automated Failover",
        ],
        confidence: 94,
      },
      {
        category: "Staff Leadership Scope",
        icon: <Star className="h-3.5 w-3.5 text-[#6E5EBB]" />,
        items: [
          "Led 8-engineer distributed systems team",
          "Authored 14 Architecture Decision Records (ADRs)",
          "Primary Tier 1 On-Call Incident Commander",
          "Cross-functional latency reduction (-42% P99)",
        ],
        confidence: 91,
      },
    ],
  },
  {
    role: "Staff Fullstack Architect (TypeScript / React 19 / Cloud)",
    filename: "sarah_staff_architect.pdf",
    score: 95,
    extraction: [
      {
        category: "Technical Architecture",
        icon: <Code2 className="h-3.5 w-3.5 text-[#2B7FAD]" />,
        items: [
          "TypeScript · React 19 Fiber · Next.js SSR",
          "GraphQL Federation · Node.js Worker Threads",
          "AWS Cloudflare Workers Edge Caching",
          "Observability: OpenTelemetry & Datadog",
        ],
        confidence: 96,
      },
      {
        category: "High-Impact Systems",
        icon: <Briefcase className="h-3.5 w-3.5 text-[#1E8C5A]" />,
        items: [
          "Enterprise SaaS Core (250K Daily MAU)",
          "Design System Component Library (Zero CLS)",
          "Core Web Vitals Audit (LCP 0.8s, INP <50ms)",
          "Real-time Collaboration Engine (WebSockets)",
        ],
        confidence: 93,
      },
      {
        category: "Staff Leadership Scope",
        icon: <Star className="h-3.5 w-3.5 text-[#6E5EBB]" />,
        items: [
          "Principal Engineer for Frontend Guild (40+ devs)",
          "Tech Spec Authorship & RFC Governance",
          "Mentored 6 Senior Engineers into Staff Roles",
          "Established Enterprise Security & ISO27001",
        ],
        confidence: 95,
      },
    ],
  },
];

function ResumeScoreMeter({ score }: { score: number }) {
  const tier = score >= 90 ? "Staff / Tier 1 Ready" : score >= 80 ? "Senior Competent" : "Developing";
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#F0F5F9] border border-[#D0DCE8]">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#5A6E8C] font-medium">Calibrated Resume ATS Quality</span>
        <span className="font-mono font-bold text-[#1E8C5A] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          {score} / 100 · {tier}
        </span>
      </div>
      <div className="w-full h-2.5 bg-[#D0DCE8] rounded-full overflow-hidden p-0.5">
        <motion.div
          className="h-full bg-gradient-to-r from-[#A8D8C3] to-[#B9D9EC] rounded-full shadow-sm"
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        />
      </div>
    </div>
  );
}

export const ResumeIntelligenceSection = memo(function ResumeIntelligenceSection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentProfile = sampleProfiles[selectedIdx] ?? sampleProfiles[0]!;

  return (
    <section id="resume-intelligence" className="py-24 bg-transparent relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A]" />
            Resume Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight">
            Your Resume Becomes <br />
            <span className="gradient-text-luxury">Your Interview Blueprint</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            GetHire doesn't just read words—it decodes technical complexity, architectural scale, and leadership scope to construct your personalized interview gauntlet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
          {/* Left: Profile selector */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A6E8C] font-mono">
              Live Verified Candidate Profiles
            </span>
            {sampleProfiles.map((profile, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={profile.role}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-300 ${
                    isSelected
                      ? "bg-white border-[#A8D8C3] shadow-[0_4px_20px_-2px_rgba(168,216,195,0.30)] ring-1 ring-[#A8D8C3]"
                      : "bg-white/75 backdrop-blur-md border border-[#D0DCE8]/80 hover:border-[#B9D9EC] hover:bg-white/90 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-[#5A6E8C] font-mono">
                    <FileText className="h-3.5 w-3.5 text-[#1E8C5A]" />
                    <span>{profile.filename}</span>
                  </div>
                  <h3 className={`text-xs font-bold ${isSelected ? "text-[#263D68]" : "text-[#5A6E8C]"}`}>
                    {profile.role}
                  </h3>
                </button>
              );
            })}

            {/* Upload CTA Card */}
            <div className="p-5 rounded-2xl bg-[#F0F5F9] border border-[#D0DCE8] flex items-center gap-3 mt-1">
              <FileUp className="h-5 w-5 text-[#1E8C5A] shrink-0" />
              <p className="text-xs text-[#5A6E8C] leading-relaxed">
                PDF and DOCX supported. Zero data retention mode available.
              </p>
            </div>
          </div>

          {/* Right: Extraction output */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProfile.role}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-6 shadow-[0_8px_30px_-4px_rgba(38,61,104,0.08)]"
            >
              {/* Header row */}
              <div className="flex items-center justify-between pb-4 border-b border-[#D0DCE8] text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#1E8C5A]" />
                  <span className="font-bold text-[#263D68]">Semantic Extraction Complete</span>
                </div>
                <span className="font-mono text-[#1E8C5A] bg-[#A8D8C3]/20 px-2 py-0.5 rounded border border-[#A8D8C3]/40">
                  97.4% confidence match
                </span>
              </div>

              {/* Resume score meter */}
              <ResumeScoreMeter score={currentProfile.score} />

              {/* Extraction categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentProfile.extraction.map((cat) => (
                  <div key={cat.category} className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#263D68]">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {cat.items.map((item) => (
                        <div key={item} className="flex items-start gap-1.5 text-xs text-[#3D5370] leading-snug">
                          <CheckCircle2 className="h-3 w-3 text-[#1E8C5A] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[#E4EDF5]">
                      <span className="font-mono text-[10px] text-[#5A6E8C]">Confidence: {cat.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#D0DCE8] flex items-center justify-between text-xs text-[#5A6E8C]">
                <span className="flex items-center gap-1.5 text-[#1E8C5A] font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Calibrated for Real-Time Simulation
                </span>
                <span className="font-mono text-[11px]">Taxonomy Schema v3.8</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

export default ResumeIntelligenceSection;

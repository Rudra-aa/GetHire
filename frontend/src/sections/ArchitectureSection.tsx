import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Cpu, Database, MessageSquare,
  Activity, BarChart2, FileCheck, ArrowRight, CheckCircle2
} from "lucide-react";

const pipelineStages = [
  {
    id: "parser",
    number: "01",
    icon: <FileText className="h-5 w-5 text-[#39FF88]" />,
    title: "Resume Semantic Parser",
    sub: "Deep Ingestion & AST Extraction",
    desc: "Ingests PDF/DOCX resumes and parses structured work histories, production scales, and architectural achievements using semantic NLP extraction models.",
    features: ["AST Section segmentation", "Project impact & TPS extraction", "Modern tech stack ontology identification"],
  },
  {
    id: "extractor",
    number: "02",
    icon: <Cpu className="h-5 w-5 text-[#4DA8FF]" />,
    title: "Skill Ontology Extractor",
    sub: "Enterprise Taxonomy Mapping",
    desc: "Maps extracted technical terms against a verified taxonomy of 1,800+ programming languages, frameworks, system design concepts, and leadership signals.",
    features: ["Standardized taxonomy normalization", "Experience level calibration", "Domain tagging & confidence bounds"],
  },
  {
    id: "retrieval",
    number: "03",
    icon: <Database className="h-5 w-5 text-[#8B5CF6]" />,
    title: "Vector Knowledge Retrieval",
    sub: "Domain Question Knowledge Base",
    desc: "Queries the verified 3,800+ question bank to select calibrated prompts matching candidate seniority, tech stack, and production scope.",
    features: ["Vector similarity search", "Difficulty stratification (Staff / Principal)", "System design & coding balance"],
  },
  {
    id: "generator",
    number: "04",
    icon: <MessageSquare className="h-5 w-5 text-[#39FF88]" />,
    title: "Adaptive Question Generator",
    sub: "Context-Aware Probe Synthesis",
    desc: "Dynamically constructs situational questions and follow-ups tailored specifically to the candidate's exact experience without generic filler.",
    features: ["Dynamic context injection", "Adaptive difficulty escalation", "Realistic follow-up probe generation"],
  },
  {
    id: "simulation",
    number: "05",
    icon: <Activity className="h-5 w-5 text-[#4DA8FF]" />,
    title: "Multimodal Simulation Core",
    sub: "WebRTC Telemetry Stream",
    desc: "Coordinates the mock interview session with real-time audio cadence tracking, speech pacing analysis, and 60 FPS facial composure monitoring.",
    features: ["Real-time speech pacing tracking", "Response structure capture", "Composure indicator monitoring"],
  },
  {
    id: "evaluator",
    number: "06",
    icon: <BarChart2 className="h-5 w-5 text-[#8B5CF6]" />,
    title: "Multi-Signal Evaluator",
    sub: "STAR & Accuracy Audit",
    desc: "Evaluates answers across 9 objective dimensions including STAR framework completeness, algorithmic correctness, and trade-off depth.",
    features: ["STAR method adherence verification", "Technical rigor grading", "Clarity & filler word audit"],
  },
  {
    id: "report",
    number: "07",
    icon: <FileCheck className="h-5 w-5 text-[#FFD54A]" />,
    title: "Executive HireScore™ Report",
    sub: "Actionable Gap Remediation",
    desc: "Synthesizes all signals into an actionable interview report containing calibrated readiness scores, strengths, and specific gap remediations.",
    features: ["Calibrated HireScore breakdown", "Specific question-by-question feedback", "Targeted practice recommendations"],
  },
];

export const ArchitectureSection = memo(function ArchitectureSection() {
  const [activeStage, setActiveStage] = useState(pipelineStages[0]?.id ?? "parser");
  const current = pipelineStages.find((s) => s.id === activeStage) || pipelineStages[0] || {
    id: "parser",
    number: "01",
    icon: <FileText className="h-5 w-5 text-[#39FF88]" />,
    title: "Resume Semantic Parser",
    sub: "Deep Ingestion & AST Extraction",
    desc: "Ingests PDF/DOCX resumes and parses structured work histories.",
    features: ["AST Section segmentation", "Project impact & TPS extraction", "Modern tech stack ontology identification"],
  };

  return (
    <section id="architecture" className="py-24 bg-transparent relative overflow-hidden">
      {/* Background Matrix & Subtle Gradient */}
      <div className="absolute inset-0 bg-dot-matrix opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 vignette-radial pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4DA8FF]" />
            Enterprise Infrastructure
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Enterprise-Grade AI Architecture <br />
            <span className="gradient-text-luxury">Built For Real-Time Intelligence</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
            Seven micro-orchestrated stages powering sub-100ms multimodal inference with zero candidate latency.
          </p>
        </div>

        {/* Pipeline Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Stage Nodes Flow */}
          <div className="flex flex-col gap-3">
            {pipelineStages.map((stage) => {
              const isActive = stage.id === activeStage;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                    isActive
                      ? "bg-[#111217] border-blue-500/40 shadow-[0_0_30px_rgba(77,168,255,0.15)]"
                      : "glass-card-luxury bg-[#111217]/70 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-neutral-500">{stage.number}</span>
                    <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                      {stage.icon}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold ${isActive ? "text-white" : "text-neutral-300"}`}>
                        {stage.title}
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-mono">{stage.sub}</p>
                    </div>
                  </div>
                  <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "text-[#4DA8FF] translate-x-1" : "text-neutral-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Active Node Detail Card */}
          <div className="lg:sticky lg:top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="p-7 rounded-3xl glass-card-luxury bg-[#111217]/95 border border-white/[0.1] flex flex-col gap-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center">
                      {current.icon}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[#4DA8FF] uppercase tracking-wider font-bold">
                        Stage {current.number} Pipeline
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{current.title}</h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed border-t border-white/10 pt-4">
                  {current.desc}
                </p>

                <div className="flex flex-col gap-2.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Execution Capabilities
                  </h5>
                  {current.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#39FF88] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ArchitectureSection;

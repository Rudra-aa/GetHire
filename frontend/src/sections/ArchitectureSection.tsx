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
    icon: <FileText className="h-5 w-5 text-[#1E8C5A]" />,
    title: "Resume Semantic Parser",
    sub: "Deep Ingestion & AST Extraction",
    desc: "Ingests PDF/DOCX resumes and parses structured work histories, production scales, and architectural achievements using semantic NLP extraction models.",
    features: ["AST Section segmentation", "Project impact & scale extraction", "Modern tech stack ontology identification"],
  },
  {
    id: "extractor",
    number: "02",
    icon: <Cpu className="h-5 w-5 text-[#2B7FAD]" />,
    title: "Skill Ontology Extractor",
    sub: "Enterprise Taxonomy Mapping",
    desc: "Maps extracted technical terms against a verified taxonomy of 1,800+ programming languages, frameworks, system design concepts, and leadership signals.",
    features: ["Standardized taxonomy normalization", "Experience level calibration", "Domain tagging & confidence bounds"],
  },
  {
    id: "retrieval",
    number: "03",
    icon: <Database className="h-5 w-5 text-[#6E5EBB]" />,
    title: "Vector Knowledge Retrieval",
    sub: "Domain Question Knowledge Base",
    desc: "Queries the verified 3,800+ question bank to select calibrated prompts matching candidate seniority, tech stack, and production scope.",
    features: ["Vector similarity search", "Difficulty stratification (Staff / Principal)", "System design & coding balance"],
  },
  {
    id: "generator",
    number: "04",
    icon: <MessageSquare className="h-5 w-5 text-[#1E8C5A]" />,
    title: "Adaptive Question Generator",
    sub: "Context-Aware Probe Synthesis",
    desc: "Dynamically constructs situational questions and follow-ups tailored specifically to the candidate's exact experience without generic filler.",
    features: ["Dynamic context injection", "Adaptive difficulty escalation", "Realistic follow-up probe generation"],
  },
  {
    id: "simulation",
    number: "05",
    icon: <Activity className="h-5 w-5 text-[#2B7FAD]" />,
    title: "Multimodal Simulation Core",
    sub: "Real-Time Telemetry Stream",
    desc: "Coordinates the mock interview session with real-time audio cadence tracking, speech pacing analysis, and facial composure monitoring.",
    features: ["Real-time speech pacing tracking", "Response structure capture", "Composure indicator monitoring"],
  },
  {
    id: "evaluator",
    number: "06",
    icon: <BarChart2 className="h-5 w-5 text-[#6E5EBB]" />,
    title: "Multi-Signal Evaluator",
    sub: "STAR & Accuracy Audit",
    desc: "Evaluates answers across 9 objective dimensions including STAR framework completeness, algorithmic correctness, and trade-off depth.",
    features: ["STAR method adherence verification", "Technical rigor grading", "Clarity & filler word audit"],
  },
  {
    id: "report",
    number: "07",
    icon: <FileCheck className="h-5 w-5 text-[#D4921A]" />,
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
    icon: <FileText className="h-5 w-5 text-[#1E8C5A]" />,
    title: "Resume Semantic Parser",
    sub: "Deep Ingestion & AST Extraction",
    desc: "Ingests PDF/DOCX resumes and parses structured work histories.",
    features: ["AST Section segmentation", "Project impact & scale extraction", "Modern tech stack ontology identification"],
  };

  return (
    <section id="architecture" className="py-24 bg-transparent relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2B7FAD]" />
            Enterprise Infrastructure
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight">
            Enterprise Architecture <br />
            <span className="gradient-text-luxury">Built For Real-Time Intelligence</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
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
                      ? "bg-white border-[#B9D9EC] shadow-[0_4px_20px_-2px_rgba(43,127,173,0.22)] ring-1 ring-[#B9D9EC]"
                      : "bg-white/75 backdrop-blur-md border border-[#D0DCE8]/80 hover:border-[#B9D9EC] hover:bg-white/90 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-[#8FA3BC]">{stage.number}</span>
                    <div className="h-9 w-9 rounded-xl border border-[#D0DCE8] bg-[#F0F5F9] flex items-center justify-center">
                      {stage.icon}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold ${isActive ? "text-[#263D68]" : "text-[#5A6E8C]"}`}>
                        {stage.title}
                      </h3>
                      <p className="text-[11px] text-[#8FA3BC] font-mono">{stage.sub}</p>
                    </div>
                  </div>
                  <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "text-[#2B7FAD] translate-x-1" : "text-[#8FA3BC]"}`} />
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
                className="p-7 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-6 shadow-[0_8px_30px_-4px_rgba(38,61,104,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl border border-[#D0DCE8] bg-[#F0F5F9] flex items-center justify-center">
                      {current.icon}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[#2B7FAD] uppercase tracking-wider font-bold">
                        Stage {current.number} Pipeline
                      </span>
                      <h4 className="text-sm font-bold text-[#263D68] mt-0.5">{current.title}</h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#5A6E8C] leading-relaxed border-t border-[#E4EDF5] pt-4">
                  {current.desc}
                </p>

                <div className="flex flex-col gap-2.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E8C]">
                    Execution Capabilities
                  </h5>
                  {current.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-[#3D5370]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1E8C5A] shrink-0" />
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

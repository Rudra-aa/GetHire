import { memo } from "react";
import { motion } from "framer-motion";
import {
  Upload, FileSearch, Cpu, Video, ScanFace, BarChart2, Trophy, FileDown, ArrowRight
} from "lucide-react";

const stages = [
  {
    number: "01",
    icon: <Upload className="h-5 w-5" />,
    color: "text-[#39FF88]",
    bgColor: "bg-emerald-500/10 border-emerald-500/20 text-[#39FF88]",
    title: "Career Ingestion",
    desc: "Ingest PDF/DOCX resumes and extract verified achievements.",
    tech: "Secure Parsing · Fast",
  },
  {
    number: "02",
    icon: <FileSearch className="h-5 w-5" />,
    color: "text-[#39FF88]",
    bgColor: "bg-emerald-500/10 border-emerald-500/20 text-[#39FF88]",
    title: "Skill Ontology Graph",
    desc: "NLP constructs a verified matrix of your production stack & scale.",
    tech: "Qwen2.5 · Ontology",
  },
  {
    number: "03",
    icon: <Cpu className="h-5 w-5" />,
    color: "text-[#4DA8FF]",
    bgColor: "bg-blue-500/10 border-blue-500/20 text-[#4DA8FF]",
    title: "Adaptive Synthesis",
    desc: "Questions engineered specifically from your stated architectural work.",
    tech: "Llama 3.2 · Adaptive",
  },
  {
    number: "04",
    icon: <Video className="h-5 w-5" />,
    color: "text-[#4DA8FF]",
    bgColor: "bg-blue-500/10 border-blue-500/20 text-[#4DA8FF]",
    title: "Multimodal Simulation",
    desc: "Real-time mock interview with dynamic follow-up escalation.",
    tech: "WebRTC · 60 FPS",
  },
  {
    number: "05",
    icon: <ScanFace className="h-5 w-5" />,
    color: "text-[#8B5CF6]",
    bgColor: "bg-purple-500/10 border-purple-500/20 text-[#8B5CF6]",
    title: "Biometric & Vocal Telemetry",
    desc: "FaceSense and VoiceSense track composure, eye contact, and cadence.",
    tech: "PyTorch · Librosa",
  },
  {
    number: "06",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "text-[#8B5CF6]",
    bgColor: "bg-purple-500/10 border-purple-500/20 text-[#8B5CF6]",
    title: "Multi-Signal Evaluation",
    desc: "Objective STAR framework, algorithmic rigor, and tradeoff grading.",
    tech: "Rubric Engine · L5/L6",
  },
  {
    number: "07",
    icon: <Trophy className="h-5 w-5" />,
    color: "text-[#FFD54A]",
    bgColor: "bg-amber-500/10 border-amber-500/20 text-[#FFD54A]",
    title: "Predictive HireScore™",
    desc: "Calibrated composite index benchmarked against Tier 1 standards.",
    tech: "Multi-Signal Index",
  },
  {
    number: "08",
    icon: <FileDown className="h-5 w-5" />,
    color: "text-[#FFD54A]",
    bgColor: "bg-amber-500/10 border-amber-500/20 text-[#FFD54A]",
    title: "Executive Action Plan",
    desc: "Granular gap remediation roadmap and downloadable intelligence report.",
    tech: "Instant PDF Export",
  },
];

export const WorkflowSection = memo(function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 bg-transparent relative overflow-hidden">
      {/* ── Background Depth Matrix & Subtle Gradients ─────────────────────── */}
      <div className="absolute inset-0 bg-dot-matrix opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 vignette-radial pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Section Header with strong reading flow */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39FF88]" />
            Intelligent Progression
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            From Resume Upload to{" "}
            <span className="gradient-text-luxury">Guaranteed Offer-Ready</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
            Eight coordinated phases eliminate every point of failure between your application and the offer letter.
          </p>
        </div>

        {/* Stage boxes grid — 4 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, idx) => (
            <motion.div
              key={stage.number}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: idx * 0.04, duration: 0.38 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card-luxury p-5 rounded-2xl flex flex-col justify-between gap-4 group relative overflow-hidden bg-[#111217]/80 border border-white/[0.08]"
            >
              {/* Inter-stage connector arrow (desktop only, within each row of 4) */}
              {idx < stages.length - 1 && (idx + 1) % 4 !== 0 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center pointer-events-none">
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-600" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${stage.bgColor} ${stage.color}`}>
                  {stage.icon}
                </div>
                <span className="font-mono text-xs font-bold text-neutral-500 group-hover:text-[#39FF88] transition-colors">
                  {stage.number}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#39FF88] transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{stage.desc}</p>
              </div>

              <div className="pt-2.5 border-t border-white/[0.07] flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500">{stage.tech}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-[#39FF88] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default WorkflowSection;

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Upload, FileSearch, Cpu, Video, ScanFace, BarChart2, Trophy, FileDown, ArrowRight
} from "lucide-react";

const stages = [
  {
    number: "01",
    icon: <Upload className="h-5 w-5" />,
    color: "text-[#1E8C5A]",
    bgColor: "bg-[#A8D8C3]/25 border-[#A8D8C3]/40 text-[#1E8C5A]",
    title: "Career Ingestion",
    desc: "Ingest PDF/DOCX resumes and extract verified achievements.",
    tech: "Secure Parsing · Fast",
  },
  {
    number: "02",
    icon: <FileSearch className="h-5 w-5" />,
    color: "text-[#1E8C5A]",
    bgColor: "bg-[#A8D8C3]/25 border-[#A8D8C3]/40 text-[#1E8C5A]",
    title: "Skill Ontology Graph",
    desc: "NLP constructs a verified matrix of your production stack & scale.",
    tech: "Structured Ontology",
  },
  {
    number: "03",
    icon: <Cpu className="h-5 w-5" />,
    color: "text-[#2B7FAD]",
    bgColor: "bg-[#B9D9EC]/30 border-[#B9D9EC]/50 text-[#2B7FAD]",
    title: "Adaptive Synthesis",
    desc: "Questions engineered specifically from your stated architectural work.",
    tech: "Dynamic Synthesis",
  },
  {
    number: "04",
    icon: <Video className="h-5 w-5" />,
    color: "text-[#2B7FAD]",
    bgColor: "bg-[#B9D9EC]/30 border-[#B9D9EC]/50 text-[#2B7FAD]",
    title: "Multimodal Simulation",
    desc: "Real-time mock interview with dynamic follow-up escalation.",
    tech: "WebRTC · Low Latency",
  },
  {
    number: "05",
    icon: <ScanFace className="h-5 w-5" />,
    color: "text-[#6E5EBB]",
    bgColor: "bg-[#DCD5F0]/35 border-[#DCD5F0]/50 text-[#6E5EBB]",
    title: "Biometric & Vocal Telemetry",
    desc: "FaceSense and VoiceSense track composure, eye contact, and cadence.",
    tech: "Real-time Telemetry",
  },
  {
    number: "06",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "text-[#6E5EBB]",
    bgColor: "bg-[#DCD5F0]/35 border-[#DCD5F0]/50 text-[#6E5EBB]",
    title: "Multi-Signal Evaluation",
    desc: "Objective STAR framework, algorithmic rigor, and tradeoff grading.",
    tech: "Rubric Engine",
  },
  {
    number: "07",
    icon: <Trophy className="h-5 w-5" />,
    color: "text-[#1E8C5A]",
    bgColor: "bg-[#A8D8C3]/25 border-[#A8D8C3]/40 text-[#1E8C5A]",
    title: "Predictive HireScore™",
    desc: "Calibrated composite index benchmarked against top-tier standards.",
    tech: "Multi-Signal Index",
  },
  {
    number: "08",
    icon: <FileDown className="h-5 w-5" />,
    color: "text-[#2B7FAD]",
    bgColor: "bg-[#B9D9EC]/30 border-[#B9D9EC]/50 text-[#2B7FAD]",
    title: "Executive Action Plan",
    desc: "Granular gap remediation roadmap and downloadable intelligence report.",
    tech: "Executive PDF Export",
  },
];

export const WorkflowSection = memo(function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 bg-[#F0F5F9]/40 relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A]" />
            Intelligent Progression
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight">
            From Resume Upload to{" "}
            <span className="gradient-text-luxury">Offer-Ready Confidence</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
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
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl flex flex-col justify-between gap-4 group relative overflow-hidden bg-white/75 backdrop-blur-md border border-[#D0DCE8]/80 shadow-[0_4px_20px_-2px_rgba(38,61,104,0.05)] hover:bg-white/90 hover:border-[#B9D9EC] hover:shadow-[0_8px_30px_-4px_rgba(38,61,104,0.09)] transition-all"
            >
              {/* Inter-stage connector arrow (desktop only, within each row of 4) */}
              {idx < stages.length - 1 && (idx + 1) % 4 !== 0 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center pointer-events-none">
                  <ArrowRight className="h-3.5 w-3.5 text-[#8FA3BC]" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${stage.bgColor} ${stage.color}`}>
                  {stage.icon}
                </div>
                <span className="font-mono text-xs font-bold text-[#8FA3BC] group-hover:text-[#1E8C5A] transition-colors">
                  {stage.number}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#263D68] tracking-tight group-hover:text-[#1E8C5A] transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs text-[#5A6E8C] mt-1 leading-relaxed">{stage.desc}</p>
              </div>

              <div className="pt-2.5 border-t border-[#E4EDF5] flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#5A6E8C]">{stage.tech}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#D0DCE8] group-hover:bg-[#1E8C5A] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default WorkflowSection;

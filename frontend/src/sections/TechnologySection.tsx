import { memo } from "react";
import { Shield, Zap, Lock, Database } from "lucide-react";

const pillars = [
  {
    icon: <Shield className="h-5 w-5 text-[#2B7FAD]" />,
    title: "Zero Data Retention Option",
    desc: "Candidates can enable ephemeral session mode where resume text and voice transcripts are permanently wiped upon session completion.",
  },
  {
    icon: <Lock className="h-5 w-5 text-[#6E5EBB]" />,
    title: "AES-256 & TLS 1.3",
    desc: "All stored candidate metrics and session histories are encrypted with AES-256 at rest and communicated over TLS 1.3 in transit.",
  },
  {
    icon: <Zap className="h-5 w-5 text-[#2B7FAD]" />,
    title: "Sub-180ms TTFT Streaming",
    desc: "Edge-cached vector indexes and streaming response pipelines ensure question follow-ups feel immediate and conversational.",
  },
  {
    icon: <Database className="h-5 w-5 text-[#1E8C5A]" />,
    title: "3,876+ Knowledge Index",
    desc: "Domain knowledge base calibrated across 24 software engineering specializations without generic prompts.",
  },
];

export const TechnologySection = memo(function TechnologySection() {
  return (
    <section id="technology" className="py-8 bg-white relative overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-10">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2B7FAD]" />
            Infrastructure & Security
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#263D68]">
            Built for Privacy. <br />
            <span className="gradient-text-luxury">Engineered for Performance.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            Enterprise-grade data security and sub-second execution speed, engineered for serious technical candidates.
          </p>
        </div>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 p-6 rounded-3xl flex flex-col justify-between gap-6 shadow-glass hover:bg-white/95 hover:border-[#B9D9EC] transition-all">
              <div className="h-11 w-11 rounded-2xl border border-[#D0DCE8]/80 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                {p.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#263D68] tracking-tight">{p.title}</h3>
                <p className="text-xs text-[#5A6E8C] mt-2 leading-relaxed">{p.desc}</p>
              </div>
              <div className="pt-3 border-t border-[#E4EDF5]">
                <span className="text-[10px] font-mono text-[#8FA3BC] uppercase font-bold">Standard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TechnologySection;

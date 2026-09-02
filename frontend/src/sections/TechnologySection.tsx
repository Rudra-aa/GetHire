import { memo } from "react";
import { Shield, Zap, Lock, Database } from "lucide-react";

const pillars = [
  {
    icon: <Shield className="h-5 w-5 text-blue-400" />,
    title: "Zero Data Retention Option",
    desc: "Candidates can enable ephemeral session mode where resume text and voice transcripts are permanently wiped upon session completion.",
  },
  {
    icon: <Lock className="h-5 w-5 text-indigo-400" />,
    title: "AES-256 & TLS 1.3",
    desc: "All stored candidate metrics and session histories are encrypted with AES-256 at rest and communicated over TLS 1.3 in transit.",
  },
  {
    icon: <Zap className="h-5 w-5 text-purple-400" />,
    title: "Sub-180ms TTFT Streaming",
    desc: "Edge-cached vector indexes and streaming response pipelines ensure question follow-ups feel immediate and conversational.",
  },
  {
    icon: <Database className="h-5 w-5 text-emerald-400" />,
    title: "3,876+ Knowledge Index",
    desc: "Domain knowledge base calibrated across 24 software engineering specializations without generic hallucinated prompts.",
  },
];

export const TechnologySection = memo(function TechnologySection() {
  return (
    <section id="technology" className="section-padding bg-bg-primary relative overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-14">
          <div className="eyebrow-pill mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Infrastructure & Security
          </div>
          <h2 className="text-display font-black tracking-tight text-white">
            Built for Privacy. <br />
            <span className="gradient-text-luxury">Engineered for Performance.</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-4 leading-relaxed">
            Enterprise-grade data security and sub-second execution speed, engineered for serious technical candidates.
          </p>
        </div>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="glass-card-luxury p-6 rounded-3xl flex flex-col justify-between gap-6">
              <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                {p.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{p.title}</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>
              <div className="pt-3 border-t border-white/10">
                <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Standard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TechnologySection;

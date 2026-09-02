import { memo } from "react";
import { motion } from "framer-motion";
import { Eye, Smile, Target, Sparkles } from "lucide-react";

const emotionTimeline = [
  { time: "0:00", emotion: "Neutral",   confidence: 62, color: "bg-graphite-400" },
  { time: "0:45", emotion: "Focused",   confidence: 74, color: "bg-gold-400" },
  { time: "1:30", emotion: "Confident", confidence: 83, color: "bg-emerald-400" },
  { time: "2:15", emotion: "Stressed",  confidence: 55, color: "bg-warning" },
  { time: "3:00", emotion: "Recovering",confidence: 70, color: "bg-gold-400" },
  { time: "3:45", emotion: "Confident", confidence: 88, color: "bg-emerald-400" },
  { time: "4:30", emotion: "Confident", confidence: 91, color: "bg-emerald-400" },
];

const signals = [
  {
    icon: <Eye className="h-5 w-5 text-emerald-400" />,
    label: "Eye Contact",
    value: "87%",
    desc: "Consistent gaze toward camera — strong interviewer engagement.",
    bar: 87,
  },
  {
    icon: <Smile className="h-5 w-5 text-emerald-400" />,
    label: "Expression Baseline",
    value: "Calm",
    desc: "Neutral-to-confident baseline maintained across most of the session.",
    bar: 82,
  },
  {
    icon: <Target className="h-5 w-5 text-emerald-400" />,
    label: "Confidence Trend",
    value: "↑ Rising",
    desc: "Started at 62% confidence, recovered to 91% by session end.",
    bar: 88,
  },
  {
    icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
    label: "Stress Detection",
    value: "Low",
    desc: "One stress spike at Q3 (microservices failure mode), self-corrected.",
    bar: 30,
  },
];

export const FaceSenseSection = memo(function FaceSenseSection() {
  return (
    <section id="facesense" className="section-padding bg-bg-secondary relative overflow-hidden">
      {/* Emerald ambient glow — FaceSense signature */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 60% 50%, rgba(52,211,153,0.04) 0%, transparent 65%)",
        }}
      />

      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-14">
          <div className="eyebrow-pill-emerald mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            FaceSense — Facial Analysis
          </div>
          <h2 className="text-display font-black tracking-tight text-ivory-100">
            Real-Time Expression <br />
            <span style={{ background: "linear-gradient(135deg, #6EE7B7 0%, #34D399 50%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              and Confidence Tracking
            </span>
          </h2>
          <p className="text-sm text-graphite-400 mt-4 leading-relaxed">
            FaceSense uses your webcam and OpenCV + TensorFlow to detect facial expressions and track confidence trends throughout the interview. All processing is local — no video is stored or transmitted.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left: 4 signal cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {signals.map((sig, idx) => (
              <motion.div
                key={sig.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                className="glass-card-luxury p-5 rounded-2xl flex flex-col gap-3"
                style={{ borderColor: "rgba(52,211,153,0.22)", borderTopColor: "rgba(52,211,153,0.40)" }}
              >
                <div className="flex items-center gap-2">
                  {sig.icon}
                  <span className="text-xs font-bold text-ivory-200">{sig.label}</span>
                  <span className="ml-auto font-mono text-sm font-bold text-emerald-400">{sig.value}</span>
                </div>
                <p className="text-[11px] text-graphite-400 leading-relaxed">{sig.desc}</p>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${sig.bar}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Emotion timeline */}
          <div className="glass-card-luxury p-6 rounded-3xl flex flex-col gap-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ivory-200">Confidence Timeline</span>
              <span className="font-mono text-graphite-500">Session: 4m 30s</span>
            </div>

            {/* Timeline bars */}
            <div className="flex flex-col gap-3">
              {emotionTimeline.map((point) => (
                <div key={point.time} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-[10px] text-graphite-500 w-8 flex-shrink-0">{point.time}</span>
                  <div className="flex-1 h-5 bg-white/[0.04] rounded-md overflow-hidden relative">
                    <motion.div
                      className={`absolute inset-y-0 left-0 ${point.color} opacity-80 rounded-md`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${point.confidence}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                    <span className={`h-1.5 w-1.5 rounded-full ${point.color} flex-shrink-0`} />
                    <span className="text-[10px] text-graphite-400">{point.emotion}</span>
                    <span className="ml-auto font-mono text-[10px] text-graphite-500">{point.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-graphite-500">
              Included in the final HireScore and downloadable report.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FaceSenseSection;

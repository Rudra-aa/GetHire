import { memo } from "react";
import { motion } from "framer-motion";
import { Eye, Smile, Target, Sparkles } from "lucide-react";

const emotionTimeline = [
  { time: "0:00", emotion: "Neutral",   confidence: 62, color: "bg-[#8FA3BC]" },
  { time: "0:45", emotion: "Focused",   confidence: 74, color: "bg-[#2B7FAD]" },
  { time: "1:30", emotion: "Confident", confidence: 83, color: "bg-[#1E8C5A]" },
  { time: "2:15", emotion: "Stressed",  confidence: 55, color: "bg-[#D4921A]" },
  { time: "3:00", emotion: "Recovering",confidence: 70, color: "bg-[#2B7FAD]" },
  { time: "3:45", emotion: "Confident", confidence: 88, color: "bg-[#1E8C5A]" },
  { time: "4:30", emotion: "Confident", confidence: 91, color: "bg-[#1E8C5A]" },
];

const signals = [
  {
    icon: <Eye className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Eye Contact",
    value: "87%",
    desc: "Consistent gaze toward camera — strong interviewer engagement.",
    bar: 87,
  },
  {
    icon: <Smile className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Expression Baseline",
    value: "Calm",
    desc: "Neutral-to-confident baseline maintained across most of the session.",
    bar: 82,
  },
  {
    icon: <Target className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Confidence Trend",
    value: "↑ Rising",
    desc: "Started at 62% confidence, recovered to 91% by session end.",
    bar: 88,
  },
  {
    icon: <Sparkles className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Stress Detection",
    value: "Low",
    desc: "One brief stress signal during failure mode probe, self-corrected.",
    bar: 30,
  },
];

export const FaceSenseSection = memo(function FaceSenseSection() {
  return (
    <section id="facesense" className="py-8 bg-white relative overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-10">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A]" />
            FaceSense — Facial Composure Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#263D68]">
            Real-Time Expression <br />
            <span className="gradient-text-luxury">
              and Composure Tracking
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            FaceSense uses your webcam to evaluate facial expressions and track composure trends throughout the interview. All processing runs locally — no video is stored or transmitted.
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
                className="p-5 rounded-2xl flex flex-col gap-3 bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass hover:bg-white/95 hover:border-[#A8D8C3] transition-all"
              >
                <div className="flex items-center gap-2">
                  {sig.icon}
                  <span className="text-xs font-bold text-[#263D68]">{sig.label}</span>
                  <span className="ml-auto font-mono text-sm font-bold text-[#1E8C5A]">{sig.value}</span>
                </div>
                <p className="text-[11px] text-[#5A6E8C] leading-relaxed">{sig.desc}</p>
                <div className="w-full h-1.5 bg-[#E4EDF5] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#A8D8C3] rounded-full"
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
          <div className="p-6 rounded-3xl flex flex-col gap-5 bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#263D68]">Confidence Timeline</span>
              <span className="font-mono text-[#5A6E8C]">Session: 4m 30s</span>
            </div>

            {/* Timeline bars */}
            <div className="flex flex-col gap-3">
              {emotionTimeline.map((point) => (
                <div key={point.time} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-[10px] text-[#8FA3BC] w-8 flex-shrink-0">{point.time}</span>
                  <div className="flex-1 h-5 bg-[#E4EDF5] rounded-md overflow-hidden relative">
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
                    <span className="text-[10px] text-[#5A6E8C]">{point.emotion}</span>
                    <span className="ml-auto font-mono text-[10px] text-[#8FA3BC]">{point.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E4EDF5] text-[11px] text-[#5A6E8C]">
              Included in the final HireScore and downloadable report.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FaceSenseSection;

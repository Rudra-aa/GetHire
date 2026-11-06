import { memo } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, TrendingUp, AlertCircle } from "lucide-react";

const fillerWords = [
  { word: "um",   count: 3, severity: "low" },
  { word: "like", count: 5, severity: "low" },
  { word: "you know", count: 2, severity: "low" },
  { word: "uh",   count: 1, severity: "low" },
];

const voiceSignals = [
  {
    icon: <TrendingUp className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Speech Rate",
    value: "142 WPM",
    note: "Optimal range: 130–160 WPM. Clear and well-paced.",
    score: 92,
    good: true,
  },
  {
    icon: <Volume2 className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Tone Confidence",
    value: "High",
    note: "Upward inflection minimal. Declarative tone throughout.",
    score: 85,
    good: true,
  },
  {
    icon: <Mic className="h-5 w-5 text-[#1E8C5A]" />,
    label: "Pitch Stability",
    value: "Stable",
    note: "Low pitch variance — measured delivery across all questions.",
    score: 88,
    good: true,
  },
  {
    icon: <AlertCircle className="h-5 w-5 text-[#2B7FAD]" />,
    label: "Filler Word Ratio",
    value: "1.2%",
    note: "11 filler words across 4 minutes. Acceptable — below 2% threshold.",
    score: 78,
    good: false,
  },
];

const waveformBars = Array.from({ length: 60 }, (_, i) => {
  const base = Math.sin(i * 0.35) * 0.4 + Math.sin(i * 0.7) * 0.2 + Math.random() * 0.4;
  return Math.max(0.1, Math.min(1, base));
});

export const VoiceSenseSection = memo(function VoiceSenseSection() {
  return (
    <section id="voicesense" className="py-8 bg-white relative overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-10">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A]" />
            VoiceSense — Vocal Delivery Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#263D68]">
            Pitch, Pace, and <br />
            <span className="gradient-text-luxury">
              Clarity Analysis
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            VoiceSense evaluates your speech in real time. It measures speaking rate, vocal composure, pitch stability, and filler word frequency without cloud processing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: Signal cards grid */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {voiceSignals.map((sig, idx) => (
                <motion.div
                  key={sig.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  className="p-5 rounded-2xl flex flex-col gap-3 bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass hover:bg-white/95 hover:border-[#A8D8C3] transition-all"
                >
                  <div className="flex items-center gap-2">
                    {sig.icon}
                    <span className="text-xs font-bold text-[#263D68]">{sig.label}</span>
                    <span className={`ml-auto font-mono text-sm font-bold ${sig.good ? "text-[#1E8C5A]" : "text-[#2B7FAD]"}`}>
                      {sig.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6E8C] leading-relaxed">{sig.note}</p>
                  <div className="w-full h-1.5 bg-[#E4EDF5] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${sig.good ? "bg-[#A8D8C3]" : "bg-[#B9D9EC]"}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${sig.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Waveform visualization */}
            <div className="p-5 rounded-2xl flex flex-col gap-3 bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-[#263D68]">
                  <Mic className="h-3.5 w-3.5 text-[#1E8C5A]" />
                  Voice Waveform — Audio Stream
                </span>
                <span className="font-mono text-[#5A6E8C]">Duration: 1m 43s</span>
              </div>
              <div className="flex items-end gap-0.5 h-14">
                {waveformBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-[#A8D8C3]"
                    style={{ height: `${h * 100}%`, minHeight: "10%" }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.008, duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Filler word analysis panel */}
          <div className="p-6 rounded-3xl flex flex-col gap-5 bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#263D68]">Filler Word Analysis</span>
              <span className="font-mono text-[#5A6E8C]">Total: 11 instances</span>
            </div>

            <div className="flex flex-col gap-3">
              {fillerWords.map((fw) => (
                <div key={fw.word} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-[#263D68] w-16 flex-shrink-0">&ldquo;{fw.word}&rdquo;</span>
                  <div className="flex-1 h-5 bg-[#E4EDF5] rounded-md overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[#B9D9EC] rounded-md"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(fw.count / 6) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#5A6E8C] w-10 text-right flex-shrink-0">
                    ×{fw.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="pt-3 border-t border-[#E4EDF5] flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A6E8C]">Total filler ratio</span>
                <span className="font-mono text-[#1E8C5A] font-bold">1.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6E8C]">Threshold</span>
                <span className="font-mono text-[#5A6E8C]">&lt;2% = Acceptable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6E8C]">Verdict</span>
                <span className="font-mono text-[#1E8C5A] font-bold">Within Range</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4EDF5] text-[11px] text-[#5A6E8C]">
              Audio Telemetry Engine · Local Processing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default VoiceSenseSection;

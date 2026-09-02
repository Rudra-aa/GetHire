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
    icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
    label: "Speech Rate",
    value: "142 WPM",
    note: "Optimal range: 130–160 WPM. Clear and well-paced.",
    score: 92,
    good: true,
  },
  {
    icon: <Volume2 className="h-5 w-5 text-emerald-400" />,
    label: "Tone Confidence",
    value: "High",
    note: "Upward inflection minimal. Declarative tone throughout.",
    score: 85,
    good: true,
  },
  {
    icon: <Mic className="h-5 w-5 text-emerald-400" />,
    label: "Pitch Stability",
    value: "Stable",
    note: "Low pitch variance — measured delivery across all questions.",
    score: 88,
    good: true,
  },
  {
    icon: <AlertCircle className="h-5 w-5 text-gold-400" />,
    label: "Filler Word Ratio",
    value: "1.2%",
    note: "11 filler words across 4 minutes. Acceptable — below 2% threshold.",
    score: 78,
    good: false,
  },
];

// Simulated waveform bars for visual representation
const waveformBars = Array.from({ length: 60 }, (_, i) => {
  const base = Math.sin(i * 0.35) * 0.4 + Math.sin(i * 0.7) * 0.2 + Math.random() * 0.4;
  return Math.max(0.1, Math.min(1, base));
});

export const VoiceSenseSection = memo(function VoiceSenseSection() {
  return (
    <section id="voicesense" className="section-padding bg-bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 40% 50%, rgba(52,211,153,0.03) 0%, transparent 65%)",
        }}
      />

      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-14">
          <div className="eyebrow-pill-emerald mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            VoiceSense — Voice Analysis
          </div>
          <h2 className="text-display font-black tracking-tight text-ivory-100">
            Pitch, Pace, and <br />
            <span style={{ background: "linear-gradient(135deg, #6EE7B7 0%, #34D399 50%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Clarity Analysis
            </span>
          </h2>
          <p className="text-sm text-graphite-400 mt-4 leading-relaxed">
            VoiceSense uses PyTorch and Librosa to analyze your speech in real time. It measures your speaking rate, tonal confidence, pitch stability, and filler word frequency — all without cloud processing.
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
                  className="glass-card-luxury p-5 rounded-2xl flex flex-col gap-3"
                  style={{
                    borderColor: sig.good ? "rgba(52,211,153,0.22)" : "rgba(226,184,74,0.24)",
                    borderTopColor: sig.good ? "rgba(52,211,153,0.40)" : "rgba(226,184,74,0.45)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    {sig.icon}
                    <span className="text-xs font-bold text-ivory-200">{sig.label}</span>
                    <span className={`ml-auto font-mono text-sm font-bold ${sig.good ? "text-emerald-400" : "text-gold-400"}`}>
                      {sig.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-graphite-400 leading-relaxed">{sig.note}</p>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${sig.good ? "bg-emerald-400" : "bg-gold-400"}`}
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
            <div className="glass-card-luxury p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-ivory-200">
                  <Mic className="h-3.5 w-3.5 text-emerald-400" />
                  Voice Waveform — Q3 Answer
                </span>
                <span className="font-mono text-graphite-500">Duration: 1m 43s</span>
              </div>
              <div className="flex items-end gap-0.5 h-14">
                {waveformBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-emerald-400/60"
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
          <div className="glass-card-luxury p-6 rounded-3xl flex flex-col gap-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ivory-200">Filler Word Analysis</span>
              <span className="font-mono text-graphite-500">Total: 11 instances</span>
            </div>

            <div className="flex flex-col gap-3">
              {fillerWords.map((fw) => (
                <div key={fw.word} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-graphite-400 w-16 flex-shrink-0">&ldquo;{fw.word}&rdquo;</span>
                  <div className="flex-1 h-5 bg-white/[0.04] rounded-md overflow-hidden relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gold-400/50 rounded-md"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(fw.count / 6) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-graphite-500 w-10 text-right flex-shrink-0">
                    ×{fw.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-graphite-500">Total filler ratio</span>
                <span className="font-mono text-emerald-400 font-bold">1.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Threshold</span>
                <span className="font-mono text-graphite-400">&lt;2% = Acceptable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Verdict</span>
                <span className="font-mono text-emerald-400 font-bold">Within Range</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-graphite-500">
              PyTorch + Librosa · Zero cloud processing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default VoiceSenseSection;

import { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Mic, CheckCircle2, Sparkles } from "lucide-react";

const sampleQuestion =
  "Design a high-throughput URL shortening service like TinyURL. How do you handle 100M daily writes, guarantee zero key collisions, and ensure sub-10ms read latencies?";

const sampleResponse =
  "To design TinyURL for 100M daily writes (~1,160 writes/sec), I generate a 7-character Base62 string yielding 3.5 trillion unique keys. To guarantee zero hash collisions, we utilize a distributed Snowflake ID generator combined with a pre-allocated key cache in Redis. For sub-10ms reads, hot keys are cached in Redis cluster with LRU eviction and memory tiers, while PostgreSQL handles persistent storage with consistent hash sharding across database partitions.";

const LiveSimulationConsole = memo(function LiveSimulationConsole() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedText = sampleResponse.slice(0, typedChars);
  const progressRatio = typedChars / sampleResponse.length;

  const technicalScore = Math.min(94, Math.round(55 + progressRatio * 39));
  const structureScore = Math.min(91, Math.round(50 + progressRatio * 41));
  const clarityScore = Math.min(88, Math.round(60 + progressRatio * 28));
  const compositeHireScore = Math.round((technicalScore + structureScore + clarityScore) / 3);

  const reset = () => {
    setIsPlaying(false);
    setTypedChars(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (typedChars < sampleResponse.length) {
      timerRef.current = setTimeout(() => {
        setTypedChars((c) => c + 1);
      }, 20);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, typedChars]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      {/* Left Column: Interview Prompt & Live Candidate Stream */}
      <div className="flex flex-col gap-5">
        {/* Interviewer Question Box */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-3 shadow-glass">
          <div className="flex items-center justify-between text-xs">
            <span className="eyebrow-pill text-[10px] py-0.5 px-2.5">
              <Sparkles className="h-3 w-3" />
              Interviewer Prompt
            </span>
            <span className="font-mono text-[#5A6E8C]">System Design (Staff / L6)</span>
          </div>
          <p className="text-sm font-semibold text-[#263D68] leading-relaxed mt-1">
            {sampleQuestion}
          </p>
        </div>

        {/* Candidate Response Terminal */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 min-h-[220px] flex flex-col justify-between shadow-glass">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4EDF5] text-xs">
              <span className="flex items-center gap-2 text-[#263D68] font-bold">
                <Mic className="h-4 w-4 text-[#1E8C5A]" />
                Candidate Spoken & Written Stream
              </span>
              {isPlaying && typedChars < sampleResponse.length && (
                <span className="flex items-center gap-1.5 text-[#1E8C5A] font-mono text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-[#1E8C5A] animate-ping" />
                  Streaming Response
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#3D5370] leading-relaxed font-sans mt-4">
              {displayedText}
              {isPlaying && typedChars < sampleResponse.length && (
                <span className="inline-block h-4 w-0.5 bg-[#1E8C5A] ml-1 animate-pulse" />
              )}
            </p>
          </div>

          {/* Complete Feedback Banner */}
          {typedChars === sampleResponse.length && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-4 border-t border-[#E4EDF5] flex flex-wrap items-center gap-3 text-xs"
            >
              <span className="inline-flex items-center gap-1 text-[#1E8C5A] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> High throughput capacity addressed
              </span>
              <span className="inline-flex items-center gap-1 text-[#2B7FAD] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Collision-free Base62 strategy
              </span>
            </motion.div>
          )}
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-[#1A2D52] shadow-[0_2px_8px_rgba(168,216,195,0.40)] hover:brightness-105 transition-all"
            style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isPlaying ? "Pause Simulation" : typedChars > 0 ? "Resume Stream" : "Run Live Simulation"}
          </button>
          <button
            onClick={reset}
            className="px-5 py-3 rounded-full text-xs font-bold text-[#5A6E8C] hover:text-[#263D68] bg-white/80 backdrop-blur-sm hover:bg-white/95 border border-[#D0DCE8]/80 transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Right Column: Live Calibrated Score Breakdown */}
      <div className="flex flex-col gap-5">
        {/* Aggregate Score Card */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col items-center text-center gap-2.5 shadow-glass">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#5A6E8C] font-bold">
            Live Calibrated HireScore™
          </span>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E8C5A] via-[#2B7FAD] to-[#6E5EBB] font-display leading-none">
            {compositeHireScore}
          </div>
          <span className="text-xs font-bold text-[#1E8C5A] bg-[#A8D8C3]/20 px-2.5 py-0.5 rounded-full border border-[#A8D8C3]/40">
            {compositeHireScore >= 85 ? "Staff Hire Recommendation" : "Evaluating Stream..."}
          </span>
        </div>

        {/* Granular Dimension Meters */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-4 shadow-glass">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#3D5370] font-medium">Technical Depth</span>
              <span className="font-mono font-bold text-[#1E8C5A]">{technicalScore}%</span>
            </div>
            <div className="h-2 bg-[#E4EDF5] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#A8D8C3] rounded-full transition-all duration-300"
                style={{ width: `${technicalScore}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#3D5370] font-medium">STAR Structure</span>
              <span className="font-mono font-bold text-[#2B7FAD]">{structureScore}%</span>
            </div>
            <div className="h-2 bg-[#E4EDF5] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#B9D9EC] rounded-full transition-all duration-300"
                style={{ width: `${structureScore}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#3D5370] font-medium">Communication Cadence</span>
              <span className="font-mono font-bold text-[#6E5EBB]">{clarityScore}%</span>
            </div>
            <div className="h-2 bg-[#E4EDF5] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#DCD5F0] rounded-full transition-all duration-300"
                style={{ width: `${clarityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const LiveDemoSection = memo(function LiveDemoSection() {
  return (
    <section id="demo" className="py-24 bg-transparent relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="eyebrow-pill mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8C5A]" />
            Live Product Simulation
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight">
            Watch Real-Time Performance <br />
            <span className="gradient-text-luxury">Evaluation in Action</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
            Experience how GetHire grades technical rigor, STAR framework adherence, and system trade-offs live during an interview.
          </p>
        </div>

        {/* Memoized Simulation Layout */}
        <LiveSimulationConsole />
      </div>
    </section>
  );
});

export default LiveDemoSection;

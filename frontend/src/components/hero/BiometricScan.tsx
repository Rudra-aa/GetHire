import type { PointerEvent } from "react";
import { useState, useRef, useEffect, memo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FileText, Cpu, Eye, Mic, BarChart2, Trophy, FileCheck
} from "lucide-react";
import { useAdaptiveQuality } from "@/services/qualityManager";

// ── 7 Platform Module Widget Cards ───────────────────────────────────────────
const leftModules = [
  {
    id: "resume-iq",
    icon: <FileText className="h-3.5 w-3.5 text-[#1E8C5A]" />,
    tag: "ResumeIQ",
    tagColor: "text-[#1E8C5A] bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "Extracting Skills",
    line2: "97.4% confidence",
    indicator: { color: "bg-[#1E8C5A]", width: "97%" },
    pulse: false,
  },
  {
    id: "interview-ai",
    icon: <Cpu className="h-3.5 w-3.5 text-[#2B7FAD]" />,
    tag: "InterviewEngine",
    tagColor: "text-[#2B7FAD] bg-[#B9D9EC]/30 border border-[#B9D9EC]/50 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "Adaptive Question #5",
    line2: "System Design · Active",
    indicator: { color: "bg-[#2B7FAD]", width: "70%" },
    pulse: false,
  },
  {
    id: "facesense",
    icon: <Eye className="h-3.5 w-3.5 text-[#1E8C5A]" />,
    tag: "FaceSense",
    tagColor: "text-[#1E8C5A] bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "Eye Contact: 87%",
    line2: "Expression: Composed",
    indicator: { color: "bg-[#1E8C5A]", width: "87%" },
    pulse: true,
  },
];

const rightModules = [
  {
    id: "voicesense",
    icon: <Mic className="h-3.5 w-3.5 text-[#1E8C5A]" />,
    tag: "VoiceSense",
    tagColor: "text-[#1E8C5A] bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "138 WPM · Cadence",
    line2: "Filler Ratio: 0.8%",
    indicator: { color: "bg-[#1E8C5A]", width: "92%" },
    pulse: true,
  },
  {
    id: "eval-engine",
    icon: <BarChart2 className="h-3.5 w-3.5 text-[#6E5EBB]" />,
    tag: "Eval Engine",
    tagColor: "text-[#6E5EBB] bg-[#DCD5F0]/35 border border-[#DCD5F0]/50 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "Technical Rigor",
    line2: "92% · STAR Complete",
    indicator: { color: "bg-[#6E5EBB]", width: "92%" },
    pulse: false,
  },
  {
    id: "hirescore",
    icon: <Trophy className="h-3.5 w-3.5 text-[#D4921A]" />,
    tag: "HireScore™",
    tagColor: "text-[#D4921A] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "88 / 100",
    line2: "Staff Engineer Bar",
    indicator: { color: "bg-[#D4921A]", width: "88%" },
    pulse: false,
  },
  {
    id: "report-engine",
    icon: <FileCheck className="h-3.5 w-3.5 text-[#5A6E8C]" />,
    tag: "Report",
    tagColor: "text-[#5A6E8C] bg-[#F0F5F9] border border-[#D0DCE8] px-1.5 py-0.5 rounded text-[10px] font-sans font-bold",
    line1: "Executive PDF",
    line2: "24 Gap Insights",
    indicator: { color: "bg-[#263D68]", width: "100%" },
    pulse: false,
  },
];

// ── Biometric landmark nodes on the midline ───────────────────────────────────
const biometricNodes = [
  { id: "axis-top",      x: 39.8, y: 5.2,  size: "h-2 w-2",     color: "bg-[#1E8C5A]" },
  { id: "axis-forehead", x: 39.8, y: 19.5, size: "h-1.5 w-1.5", color: "bg-[#1E8C5A]" },
  { id: "axis-nose",     x: 39.8, y: 68.2, size: "h-1.5 w-1.5", color: "bg-[#1E8C5A]" },
  { id: "axis-chin",     x: 39.8, y: 73.5, size: "h-1.5 w-1.5", color: "bg-[#1E8C5A]" },
  { id: "axis-base",     x: 39.8, y: 89.0, size: "h-2 w-2",     color: "bg-[#1E8C5A]" },
  { id: "left-pupil",    x: 25.5, y: 38.5, size: "h-1.5 w-1.5", color: "bg-[#1E8C5A]" },
  { id: "right-pupil",   x: 43.5, y: 38.0, size: "h-1.5 w-1.5", color: "bg-[#1E8C5A]" },
];

function ModuleWidget({
  mod,
  initial,
  delay,
}: {
  mod: typeof leftModules[number];
  initial: { x: number };
  delay: number;
}) {
  return (
    <motion.div
      key={mod.id}
      initial={{ x: initial.x, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto p-3 rounded-2xl w-[155px] sm:w-[170px] xl:w-[185px] flex flex-col gap-2 bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-[0_8px_24px_-4px_rgba(38,61,104,0.08),0_2px_6px_-1px_rgba(38,61,104,0.04)] select-none"
    >
      <div className="flex items-center gap-1.5 justify-between">
        <span className={mod.tagColor}>
          {mod.tag}
        </span>
        {mod.pulse && (
          <span className="h-2 w-2 rounded-full bg-[#1E8C5A]" />
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-[#263D68] leading-tight truncate">{mod.line1}</p>
        <p className="text-[10.5px] text-[#5A6E8C] mt-0.5 leading-tight truncate">{mod.line2}</p>
      </div>
      <div className="w-full h-1 bg-[#F0F5F9] rounded-full overflow-hidden">
        <div
          className={`h-full ${mod.indicator.color} rounded-full`}
          style={{ width: mod.indicator.width }}
        />
      </div>
    </motion.div>
  );
}

export const BiometricScan = memo(function BiometricScan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const { profile } = useAdaptiveQuality();

  // 3D Mouse Parallax with spring dynamics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 200, mass: 0.75 };
  const rotateXParallax = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfig);
  const rotateYParallax = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]),  springConfig);
  const glareX          = useSpring(useTransform(mouseX, [-0.5, 0.5], [30, 70]), springConfig);
  const glareY          = useSpring(useTransform(mouseY, [-0.5, 0.5], [30, 70]), springConfig);

  const combinedRotateX = useTransform(rotateXParallax, (v) => v + 2);
  const combinedRotateY = useTransform(rotateYParallax, (v) => v - 15);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
  }, []);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const shouldAnimate = inView && tabVisible;

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="GetHire interview intelligence biometric scan"
      className="relative w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center select-none overflow-visible"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: 1200 }}
    >
      {/* ── Ambient Soft Volumetric Backlight ─────────────────────────────── */}
      <div
        className="absolute w-[460px] sm:w-[560px] lg:w-[640px] aspect-square rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(168,216,195,0.35) 0%, rgba(185,217,236,0.2) 50%, transparent 70%)",
        }}
      />

      {/* ── 3D Interactive Biometric Centerpiece ── */}
      <motion.div
        className="relative w-[280px] sm:w-[340px] lg:w-[390px] xl:w-[430px] max-w-full aspect-[877/1024] flex items-center justify-center -mt-2"
        style={{
          rotateX: combinedRotateX,
          rotateY: combinedRotateY,
          rotateZ: 0,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ── Left Module Stack ────────────────────────────────────────────── */}
        <div
          className="absolute -left-36 sm:-left-40 xl:-left-48 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 z-30 pointer-events-none"
          style={{ transform: "translateZ(30px) translateY(-50%)" }}
        >
          {leftModules.map((mod, idx) => (
            <ModuleWidget
              key={mod.id}
              mod={mod}
              initial={{ x: -16 }}
              delay={0.12 + idx * 0.08}
            />
          ))}
        </div>

        {/* ── Right Module Stack ───────────────────────────────────────────── */}
        <div
          className="absolute -right-36 sm:-right-40 xl:-right-48 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 z-30 pointer-events-none"
          style={{ transform: "translateZ(30px) translateY(-50%)" }}
        >
          {rightModules.map((mod, idx) => (
            <ModuleWidget
              key={mod.id}
              mod={mod}
              initial={{ x: 16 }}
              delay={0.12 + idx * 0.08}
            />
          ))}
        </div>

        {/* ── Face Centerpiece ─────────────────────────────────────────────── */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transform: "translateZ(15px)", transformStyle: "preserve-3d" }}
        >
          {/* Specular Glare */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen z-10"
            style={{
              background: useTransform(
                [glareX, glareY],
                ([x, y]) =>
                  `radial-gradient(circle at ${x}% ${y}%, rgba(168,216,195,0.6) 0%, transparent 55%)`
              ),
            }}
          />

          {/* Primary Face Cutout */}
          <img
            src="/hero-face-cutout.png"
            alt="GetHire Biometric Scan"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_30px_rgba(38,61,104,0.14)]"
            loading="eager"
            decoding="async"
            draggable={false}
          />

          {/* Laser Pulse Sweep */}
          {shouldAnimate && profile.enableLaserAnimation && (
            <div
              className="absolute inset-x-4 h-2 pointer-events-none overflow-visible z-20"
              style={{ animation: "biometricLaserSweep 4.2s ease-in-out infinite" }}
            >
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#A8D8C3] to-transparent shadow-[0_0_8px_rgba(168,216,195,0.7)]" />
              <div className="w-full h-8 -mt-4 bg-gradient-to-b from-[#A8D8C3]/20 via-[#B9D9EC]/20 to-transparent blur-sm" />
            </div>
          )}

          {/* Midline Landmark Energy Nodes */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            style={{ transform: "translateZ(12px)" }}
          >
            {biometricNodes.map((node) => (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span className={`rounded-full ${node.size} ${node.color}`} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Laser scan keyframe */}
      <style>{`
        @keyframes biometricLaserSweep {
          0%   { top: 10%; opacity: 0.1; }
          15%  { opacity: 0.85; }
          85%  { opacity: 0.85; }
          100% { top: 90%; opacity: 0.1; }
        }
      `}</style>
    </div>
  );
});

export default BiometricScan;

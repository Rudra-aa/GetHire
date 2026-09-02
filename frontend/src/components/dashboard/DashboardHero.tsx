import { useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function QuantumWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    let time = 0;
    const cols = 28;
    const rows = 14;

    const render = () => {
      time += 0.022;
      ctx.clearRect(0, 0, width, height);

      const cellW = width / (cols - 1);
      const cellH = height / (rows - 1);

      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(57, 255, 136, ${0.12 + (j / rows) * 0.25})`;
        ctx.lineWidth = 1.2;

        for (let i = 0; i < cols; i++) {
          const x = i * cellW;
          const wave1 = Math.sin(time + i * 0.28 + j * 0.35) * 16;
          const wave2 = Math.cos(time * 0.8 + i * 0.15 - j * 0.2) * 10;
          const y = j * cellH * 0.6 + height * 0.22 + wave1 + wave2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          if ((i + j) % 3 === 0 && j > 2) {
            const glowAlpha = Math.abs(Math.sin(time * 1.5 + i + j));
            ctx.fillStyle = `rgba(57, 255, 136, ${0.4 + glowAlpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.8 + glowAlpha * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(77, 168, 255, 0.45)";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < cols; i++) {
        const x = i * cellW;
        const y = height * 0.52 + Math.sin(time * 1.2 + i * 0.3) * 22;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none opacity-85"
      aria-hidden="true"
    />
  );
}

export const DashboardHero = memo(function DashboardHero() {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] || "Rudra";

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-card-luxury p-6 sm:p-8 bg-[#111217]/70 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] items-center gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide shadow-[0_0_12px_rgba(57,255,136,0.15)]">
            <span className="h-2 w-2 rounded-full bg-[#39FF88] animate-pulse shadow-[0_0_8px_#39FF88]" />
            <span>AI Career Operating System · Active</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-3 flex-wrap">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF88] via-[#4DA8FF] to-[#8B5CF6]">
                {firstName}
              </span>
              <span className="inline-block animate-bounce text-2xl">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 mt-2 max-w-xl leading-relaxed">
              Your AI Career Copilot is actively optimizing your resume, interview confidence, and skill readiness for{" "}
              <span className="text-white font-semibold">{user?.target_role || "Frontend Developer"}</span> roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#39FF88]" />
              <span>ATS Profile: <strong className="text-white">Synced (91%)</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-300">
              <Zap className="h-3.5 w-3.5 text-[#4DA8FF]" />
              <span>Next Milestone: <strong className="text-white">System Design Round</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-300">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>Readiness: <strong className="text-white">Tier 1 Calibrated</strong></span>
            </div>
          </div>
        </motion.div>

        <div className="relative w-full h-[180px] sm:h-[200px] lg:h-[220px] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06] flex items-center justify-center">
          <QuantumWaveCanvas />
          
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#39FF88]" />
                NEURAL CONSTELLATION
              </span>
              <span className="text-[#39FF88]">60 FPS · LATENCY 12ms</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>MULTIMODAL HARMONICS</span>
              <span className="text-[#4DA8FF]">COGNITIVE LOAD: LOW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardHero;

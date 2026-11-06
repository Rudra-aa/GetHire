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
        ctx.strokeStyle = `rgba(168, 216, 195, ${0.18 + (j / rows) * 0.3})`;
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
            ctx.fillStyle = `rgba(168, 216, 195, ${0.4 + glowAlpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.8 + glowAlpha * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(185, 217, 236, 0.5)";
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
    <div className="relative w-full rounded-3xl overflow-hidden p-6 sm:p-8 bg-[#EEF6FB]/85 backdrop-blur-xl border border-[#B9D9EC]/60 shadow-glass">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A8D8C3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#DCD5F0]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] items-center gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8D8C3]/30 border border-[#A8D8C3]/50 text-[#1E8C5A] text-xs font-semibold tracking-wide shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#2DA870] animate-pulse" />
            <span>AI Career Operating System · Active</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#263D68] tracking-tight leading-tight flex items-center gap-3 flex-wrap">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E8C5A] via-[#2B7FAD] to-[#5245A4]">
                {firstName}
              </span>
              <span className="inline-block animate-bounce text-2xl">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5A6E8C] mt-2 max-w-xl leading-relaxed">
              Your AI Career Copilot is actively optimizing your resume, interview confidence, and skill readiness for{" "}
              <span className="text-[#263D68] font-semibold">{user?.target_role || "Frontend Developer"}</span> roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-white/95 text-[#5A6E8C] shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2DA870]" />
              <span>ATS Profile: <strong className="text-[#263D68]">Synced (91%)</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-white/95 text-[#5A6E8C] shadow-xs">
              <Zap className="h-3.5 w-3.5 text-[#2B7FAD]" />
              <span>Next Milestone: <strong className="text-[#263D68]">System Design Round</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-white/95 text-[#5A6E8C] shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-[#5245A4]" />
              <span>Readiness: <strong className="text-[#263D68]">Tier 1 Calibrated</strong></span>
            </div>
          </div>
        </motion.div>

        <div className="relative w-full h-[180px] sm:h-[200px] lg:h-[220px] rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/95 shadow-glass flex items-center justify-center">
          <QuantumWaveCanvas />
          
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5A6E8C]">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#2DA870]" />
                NEURAL CONSTELLATION
              </span>
              <span className="text-[#2DA870]">60 FPS · LATENCY 12ms</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5A6E8C]">
              <span>MULTIMODAL HARMONICS</span>
              <span className="text-[#2B7FAD]">COGNITIVE LOAD: LOW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardHero;

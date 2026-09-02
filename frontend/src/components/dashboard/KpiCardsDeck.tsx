import { memo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Brain,
  Video,
  Trophy,
  Target,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

interface KpiProps {
  resumeScore?: number;
  skillsCount?: number;
  interviewsCount?: number;
  readinessScore?: number;
}

export const KpiCardsDeck = memo(function KpiCardsDeck({
  resumeScore = 78,
  skillsCount = 18,
  interviewsCount = 3,
  readinessScore = 72,
}: KpiProps) {
  const cards = [
    {
      id: "resume-score",
      title: "Resume Score",
      icon: <FileText className="h-4 w-4 text-[#39FF88]" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-[#39FF88]",
      glowColor: "rgba(57,255,136,0.15)",
      renderMetric: () => (
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#39FF88]"
                strokeDasharray={`${resumeScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                style={{ filter: "drop-shadow(0 0 6px #39FF88)" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-extrabold text-white font-mono">{resumeScore}</span>
              <span className="text-[8px] text-neutral-400 -mt-1 font-mono">/100</span>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#39FF88] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" /> +4 pts this week
            </span>
            <p className="text-xs text-neutral-300 font-medium mt-1">Good · ATS Calibrated</p>
          </div>
        </div>
      ),
    },
    {
      id: "skills-detected",
      title: "Skills Detected",
      icon: <Brain className="h-4 w-4 text-[#8B5CF6]" />,
      iconBg: "bg-purple-500/10 border-purple-500/20 text-[#8B5CF6]",
      glowColor: "rgba(139,92,246,0.15)",
      renderMetric: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{skillsCount}</span>
            <span className="text-xs text-[#8B5CF6] font-semibold">Strong Skills</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {["React", "TypeScript", "Tailwind", "+15"].map((skill, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-neutral-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "mock-interviews",
      title: "Mock Interviews",
      icon: <Video className="h-4 w-4 text-[#4DA8FF]" />,
      iconBg: "bg-blue-500/10 border-blue-500/20 text-[#4DA8FF]",
      glowColor: "rgba(77,168,255,0.15)",
      renderMetric: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{interviewsCount}</span>
            <span className="text-xs text-neutral-400 font-semibold">Completed</span>
          </div>
          <div className="h-4 w-full flex items-end gap-1 pt-1">
            {[40, 65, 88, 72, 94].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#4DA8FF] rounded-t-sm opacity-80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "overall-readiness",
      title: "Overall Readiness",
      icon: <Trophy className="h-4 w-4 text-[#FFD54A]" />,
      iconBg: "bg-amber-500/10 border-amber-500/20 text-[#FFD54A]",
      glowColor: "rgba(255,213,74,0.15)",
      renderMetric: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{readinessScore}%</span>
            <span className="text-[11px] text-[#FFD54A] font-bold">Keep Going!</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-[#FFD54A] rounded-full shadow-[0_0_8px_#FFD54A]"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      id: "next-milestone",
      title: "Next Milestone",
      icon: <Target className="h-4 w-4 text-rose-400" />,
      iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      glowColor: "rgba(244,63,94,0.15)",
      renderMetric: () => (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-white leading-snug">
              Complete 5 mock interviews this week
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">2 remaining · +120 XP</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:border-white/30 transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative p-5 rounded-2xl glass-card-luxury bg-[#111217]/80 border border-white/[0.08] flex flex-col justify-between gap-4 overflow-hidden group shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
        >
          <div
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: card.glowColor }}
          />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-semibold text-neutral-300 tracking-wide">
              {card.title}
            </span>
            <div className={`h-7 w-7 rounded-lg border flex items-center justify-center ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          <div className="relative z-10">{card.renderMetric()}</div>
        </motion.div>
      ))}
    </div>
  );
});

export default KpiCardsDeck;

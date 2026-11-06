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
      icon: <FileText className="h-4 w-4 text-[#2DA870]" />,
      iconBg: "bg-[#A8D8C3]/20 border-[#A8D8C3]/50 text-[#2DA870]",
      glowColor: "rgba(168,216,195,0.2)",
      renderMetric: () => (
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#D0DCE8]"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#A8D8C3]"
                strokeDasharray={`${resumeScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-extrabold text-[#263D68] font-mono">{resumeScore}</span>
              <span className="text-[8px] text-[#8FA3BC] -mt-1 font-mono">/100</span>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2DA870] bg-[#A8D8C3]/20 px-2 py-0.5 rounded-md border border-[#A8D8C3]/50">
              <TrendingUp className="h-3 w-3" /> +4 pts this week
            </span>
            <p className="text-xs text-[#5A6E8C] font-medium mt-1">Good · ATS Calibrated</p>
          </div>
        </div>
      ),
    },
    {
      id: "skills-detected",
      title: "Skills Detected",
      icon: <Brain className="h-4 w-4 text-[#5245A4]" />,
      iconBg: "bg-[#DCD5F0]/30 border-[#DCD5F0]/60 text-[#5245A4]",
      glowColor: "rgba(220,213,240,0.3)",
      renderMetric: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#263D68] font-mono">{skillsCount}</span>
            <span className="text-xs text-[#5245A4] font-semibold">Strong Skills</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {["React", "TypeScript", "Tailwind", "+15"].map((skill, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0F5F9] border border-[#D0DCE8] text-[#5A6E8C]"
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
      icon: <Video className="h-4 w-4 text-[#2B7FAD]" />,
      iconBg: "bg-[#B9D9EC]/30 border-[#B9D9EC]/60 text-[#2B7FAD]",
      glowColor: "rgba(185,217,236,0.3)",
      renderMetric: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#263D68] font-mono">{interviewsCount}</span>
            <span className="text-xs text-[#8FA3BC] font-semibold">Completed</span>
          </div>
          <div className="h-4 w-full flex items-end gap-1 pt-1">
            {[40, 65, 88, 72, 94].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#B9D9EC] rounded-t-sm opacity-80"
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
      icon: <Trophy className="h-4 w-4 text-[#D4921A]" />,
      iconBg: "bg-amber-50 border-amber-200 text-[#D4921A]",
      glowColor: "rgba(212,146,26,0.15)",
      renderMetric: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#263D68] font-mono">{readinessScore}%</span>
            <span className="text-[11px] text-[#D4921A] font-bold">Keep Going!</span>
          </div>
          <div className="w-full h-2 bg-[#D0DCE8] rounded-full overflow-hidden flex gap-0.5 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-[#D4921A] rounded-full"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      id: "next-milestone",
      title: "Next Milestone",
      icon: <Target className="h-4 w-4 text-[#E05C5C]" />,
      iconBg: "bg-rose-50 border-rose-200 text-[#E05C5C]",
      glowColor: "rgba(224,92,92,0.1)",
      renderMetric: () => (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#263D68] leading-snug">
              Complete 5 mock interviews this week
            </p>
            <p className="text-[11px] text-[#8FA3BC] mt-1">2 remaining · +120 XP</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#F0F5F9] border border-[#D0DCE8] flex items-center justify-center text-[#5A6E8C] hover:text-[#263D68] hover:border-[#B9D9EC] transition-colors">
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
          className="relative p-5 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] flex flex-col justify-between gap-4 overflow-hidden group shadow-glass hover:shadow-glass-hover transition-all duration-300"
        >
          <div
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: card.glowColor }}
          />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-semibold text-[#5A6E8C] tracking-wide">
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

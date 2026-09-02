import { memo } from "react";
import { Flame, Activity } from "lucide-react";

interface WeeklyProgressProps {
  percentage?: number;
  streakDays?: number;
}

const daysOfWeek = [
  { day: "Mon", count: 2, height: "45%", completed: true },
  { day: "Tue", count: 3, height: "65%", completed: true },
  { day: "Wed", count: 4, height: "85%", completed: true },
  { day: "Thu", count: 5, height: "100%", isToday: true, completed: true },
  { day: "Fri", count: 0, height: "20%", completed: false },
  { day: "Sat", count: 0, height: "20%", completed: false },
  { day: "Sun", count: 0, height: "20%", completed: false },
];

export const WeeklyProgressChart = memo(function WeeklyProgressChart({
  percentage = 67,
  streakDays = 5,
}: WeeklyProgressProps) {
  return (
    <div className="relative w-full rounded-3xl p-6 glass-card-luxury bg-[#111217]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between gap-5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#39FF88] flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Weekly Progress</h3>
            <p className="text-[11px] text-neutral-400">Target: 6 Mock Rounds / Week</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#FFD54A] text-xs font-bold shadow-[0_0_12px_rgba(255,213,74,0.15)]">
          <Flame className="h-3.5 w-3.5 fill-[#FFD54A]" />
          <span>{streakDays}-Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#39FF88]"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                style={{ filter: "drop-shadow(0 0 8px #39FF88)" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-extrabold text-white font-mono">{percentage}%</span>
              <span className="text-[9px] text-neutral-400 font-medium">Goal</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">4 of 6 Completed</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
              2 more simulations to beat last week's record!
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-20 pt-2 px-2 bg-black/30 rounded-2xl border border-white/[0.04]">
          {daysOfWeek.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full max-w-[14px] rounded-t-md transition-all ${
                  item.isToday
                    ? "bg-[#39FF88] shadow-[0_0_10px_#39FF88]"
                    : item.completed
                    ? "bg-white/40"
                    : "bg-white/10"
                }`}
                style={{ height: item.height }}
              />
              <span
                className={`text-[9.5px] font-mono ${
                  item.isToday ? "text-[#39FF88] font-bold" : "text-neutral-400"
                }`}
              >
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default WeeklyProgressChart;

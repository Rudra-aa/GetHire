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
    <div className="relative w-full rounded-3xl p-6 bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col justify-between gap-5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 text-[#1E8C5A] flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#263D68]">Weekly Progress</h3>
            <p className="text-[11px] text-[#5A6E8C]">Target: 6 Mock Rounds / Week</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#D4921A] text-xs font-bold">
          <Flame className="h-3.5 w-3.5 fill-[#D4921A]" />
          <span>{streakDays}-Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#D0DCE8]"
                strokeWidth="3.4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#A8D8C3]"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-extrabold text-[#263D68] font-mono">{percentage}%</span>
              <span className="text-[9px] text-[#5A6E8C] font-medium">Goal</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#263D68]">4 of 6 Completed</h4>
            <p className="text-[11px] text-[#5A6E8C] mt-0.5 leading-snug">
              2 more simulations to beat last week's record!
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-20 pt-2 px-2 bg-[#FAFBFC] rounded-2xl border border-[#D0DCE8]">
          {daysOfWeek.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full max-w-[14px] rounded-t-md transition-all ${
                  item.isToday
                    ? "bg-[#A8D8C3]"
                    : item.completed
                    ? "bg-[#B9D9EC]"
                    : "bg-[#E4EDF5]"
                }`}
                style={{ height: item.height }}
              />
              <span
                className={`text-[9.5px] font-mono ${
                  item.isToday ? "text-[#1E8C5A] font-bold" : "text-[#8FA3BC]"
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

import { memo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Video,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Edit3,
  Zap,
  Clock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface RightUtilityPanelProps {
  onLaunchInterview?: () => void;
  onRunAtsCheck?: () => void;
}

export const RightUtilityPanel = memo(function RightUtilityPanel({
  onLaunchInterview,
}: RightUtilityPanelProps) {
  const { user } = useAuthStore();
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "R";

  return (
    <aside className="w-full flex flex-col gap-6 sticky top-24">
      {/* ── 1. Profile Snapshot Card (Subtle Powder Blue Section) ─────────── */}
      <div className="p-6 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col gap-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#B9D9EC]/40 pb-3">
          <span className="text-xs font-bold text-[#263D68] tracking-wide">Profile Snapshot</span>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A6E8C] hover:text-[#263D68] hover:bg-white/80 px-2 py-1 rounded-lg transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </Link>
        </div>

        {/* User Identity & Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#A8D8C3]/30 via-[#B9D9EC]/30 to-[#DCD5F0]/30 border border-[#D0DCE8] flex items-center justify-center text-lg font-black text-[#263D68] shadow-sm">
            {user?.profile_photo || user?.avatar_url ? (
              <img
                src={(user.profile_photo || user.avatar_url) ?? undefined}
                alt={user.full_name || "Profile"}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span>{initials}</span>
            )}
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#1E8C5A] border-2 border-white" />
          </div>

          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-bold text-[#263D68]">{user?.full_name || "Candidate"}</h4>
            <p className="text-xs text-[#5A6E8C] font-medium">{user?.target_role || "Software Engineer"}</p>
            <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40 w-fit">
              {user?.experience_level ? `${user.experience_level.toUpperCase()} LEVEL` : "ENTRY LEVEL"}
            </span>
          </div>
        </div>

        {/* Meta Attributes Table */}
        <div className="flex flex-col divide-y divide-[#B9D9EC]/30 text-xs pt-1">
          <div className="flex items-center justify-between py-2">
            <span className="text-[#5A6E8C]">Target Role</span>
            <span className="font-semibold text-[#263D68] flex items-center gap-1">
              {user?.target_role || "Software Engineer"}
              <ChevronRight className="h-3 w-3 text-[#5A6E8C]" />
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#5A6E8C]">Experience</span>
            <span className="font-semibold text-[#263D68] capitalize flex items-center gap-1">
              {user?.experience_level || "Entry Level"}
              <ChevronRight className="h-3 w-3 text-[#5A6E8C]" />
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#5A6E8C]">Location</span>
            <span className="font-semibold text-[#263D68] flex items-center gap-1">
              India / Remote
              <ChevronRight className="h-3 w-3 text-[#5A6E8C]" />
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#5A6E8C]">Member Since</span>
            <span className="font-semibold text-[#263D68]">May 2025</span>
          </div>
        </div>
      </div>

      {/* ── 2. Smart Recommendation Tip Card ───────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#F0FAF5] to-white border border-[#A8D8C3]/60 shadow-sm flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#1E8C5A] text-xs font-bold">
          <Sparkles className="h-4 w-4" />
          <span>Preparation Tip</span>
        </div>
        <p className="text-xs text-[#5A6E8C] leading-relaxed">
          Focus on improving your <strong className="text-[#263D68]">JavaScript Event Loop</strong> and <strong className="text-[#263D68]">System Design</strong> explanations to boost your next interview score by +12%.
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-[#5A6E8C]">Predicted Yield: 88%</span>
          <button
            onClick={onLaunchInterview}
            className="text-xs font-bold text-[#1E8C5A] hover:underline flex items-center gap-1"
          >
            <span>Practice Now</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── 3. Upcoming Schedule Widget ───────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 flex flex-col gap-4 shadow-[0_4px_20px_-2px_rgba(38,61,104,0.05)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2B7FAD]" />
            <span className="text-xs font-bold text-[#263D68]">Upcoming Session</span>
          </div>
          <span className="text-[10px] font-mono text-[#5A6E8C]">View Calendar</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAFBFC] border border-[#E4EDF5] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#DCD5F0]/30 border border-[#DCD5F0] text-[#5245A4] flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h5 className="text-xs font-bold text-[#263D68]">System Design Mock Round</h5>
            <p className="text-[11px] text-[#5A6E8C] flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-[#5A6E8C]" />
              <span>Tomorrow · 10:00 AM</span>
            </p>
          </div>
        </div>

        {/* Instant Action CTA */}
        <button
          onClick={onLaunchInterview}
          className="w-full py-3 rounded-xl text-xs font-bold text-[#1E4D38] bg-[#A8D8C3] hover:bg-[#97ccb6] border border-[#72C9AD] transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
        >
          <Zap className="h-4 w-4 fill-[#1E4D38]" />
          <span>Launch Interview Simulator</span>
        </button>
      </div>
    </aside>
  );
});

export default RightUtilityPanel;

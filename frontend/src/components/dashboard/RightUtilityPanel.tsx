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
      {/* ── 1. Profile Snapshot Card ──────────────────────────────────────── */}
      <div className="p-6 rounded-3xl glass-card-luxury bg-[#111217]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <span className="text-xs font-bold text-white tracking-wide">Profile Snapshot</span>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white hover:bg-white/[0.06] px-2 py-1 rounded-lg transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </Link>
        </div>

        {/* User Identity & Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#39FF88]/20 via-[#4DA8FF]/20 to-[#8B5CF6]/20 border border-white/20 flex items-center justify-center text-lg font-black text-white shadow-[0_0_20px_rgba(57,255,136,0.2)]">
            {user?.profile_photo || user?.avatar_url ? (
              <img
                src={(user.profile_photo || user.avatar_url) ?? undefined}
                alt={user.full_name || "Profile"}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span>{initials}</span>
            )}
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#39FF88] border-2 border-[#111217]" />
          </div>

          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-bold text-white">{user?.full_name || "Rudra"}</h4>
            <p className="text-xs text-neutral-400 font-medium">{user?.target_role || "Frontend Developer"}</p>
            <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-[#39FF88] border border-emerald-500/20 w-fit">
              {user?.experience_level ? `${user.experience_level.toUpperCase()} LEVEL` : "ENTRY LEVEL"}
            </span>
          </div>
        </div>

        {/* Meta Attributes Table */}
        <div className="flex flex-col divide-y divide-white/[0.06] text-xs pt-1">
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Target Role</span>
            <span className="font-semibold text-white flex items-center gap-1">
              {user?.target_role || "Frontend Developer"}
              <ChevronRight className="h-3 w-3 text-neutral-500" />
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Experience</span>
            <span className="font-semibold text-white capitalize flex items-center gap-1">
              {user?.experience_level || "Entry Level"}
              <ChevronRight className="h-3 w-3 text-neutral-500" />
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Location</span>
            <span className="font-semibold text-white flex items-center gap-1">
              India / Remote
              <ChevronRight className="h-3 w-3 text-neutral-500" />
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400">Member Since</span>
            <span className="font-semibold text-white">May 2025</span>
          </div>
        </div>
      </div>

      {/* ── 2. AI Recommendation Smart Tip Card ───────────────────────────── */}
      <div className="p-5 rounded-3xl glass-card-luxury bg-gradient-to-b from-emerald-500/[0.08] to-[#111217] border border-emerald-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#39FF88] text-xs font-bold">
          <Sparkles className="h-4 w-4" />
          <span>AI Tip for You</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Focus on improving your <strong>JavaScript Event Loop</strong> and <strong>System Design</strong> explanations to boost your next interview score by +12%.
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-neutral-400">Predicted Yield: 88%</span>
          <button
            onClick={onLaunchInterview}
            className="text-xs font-bold text-[#39FF88] hover:underline flex items-center gap-1"
          >
            <span>Practice Now</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── 3. Upcoming Schedule Widget ───────────────────────────────────── */}
      <div className="p-5 rounded-3xl glass-card-luxury bg-[#111217]/90 border border-white/[0.08] flex flex-col gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#4DA8FF]" />
            <span className="text-xs font-bold text-white">Upcoming Session</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">View Calendar</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FFD54A] flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h5 className="text-xs font-bold text-white">System Design Mock Round</h5>
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-neutral-400" />
              <span>Tomorrow · 10:00 AM</span>
            </p>
          </div>
        </div>

        {/* Instant Action CTA */}
        <button
          onClick={onLaunchInterview}
          className="w-full py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#39FF88] via-[#4DA8FF] to-[#8B5CF6] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,136,0.3)] font-sans"
        >
          <Zap className="h-4 w-4 fill-black" />
          <span>Launch AI Interview Simulator</span>
        </button>
      </div>
    </aside>
  );
});

export default RightUtilityPanel;

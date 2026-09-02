import { memo } from "react";
import {
  Search,
  Bot,
  Bell,
  PanelLeft,
  Sparkles,
  Command
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface CommandBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot: () => void;
}

export const DashboardCommandBar = memo(function DashboardCommandBar({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenCommandPalette,
  onOpenCopilot,
}: CommandBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#09090B]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Sidebar Toggle & Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Command Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.09] hover:border-[#39FF88]/40 hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-all text-xs w-48 sm:w-72 md:w-96 text-left group shadow-sm"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Search className="h-4 w-4 text-neutral-400 group-hover:text-[#39FF88] transition-colors shrink-0" />
            <span className="truncate">Type a command or search...</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-neutral-300">
              <Command className="h-2.5 w-2.5 inline mr-0.5" />K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: AI Copilot Trigger, Role Pill & Notifications */}
      <div className="flex items-center gap-3">
        {/* Role Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#39FF88] text-xs font-bold font-mono">
          <Sparkles className="h-3.5 w-3.5 text-[#39FF88]" />
          <span>{user?.target_role || "Frontend Developer"}</span>
        </div>

        {/* AI Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-blue-500/15 border border-emerald-500/30 text-[#39FF88] text-xs font-bold hover:shadow-[0_0_20px_rgba(57,255,136,0.25)] hover:border-emerald-500/50 transition-all cursor-pointer"
        >
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI Copilot</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenCommandPalette}
          className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#39FF88] shadow-[0_0_8px_#39FF88]" />
        </button>
      </div>
    </header>
  );
});

export default DashboardCommandBar;

import { useState, useRef, useEffect, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Video,
  Award,
  Compass,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Headphones,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  CheckSquare,
  Share2
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { GetHireLogo } from "@/components/common/GetHireLogo";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSettings?: () => void;
  isMobile?: boolean;
}

const navItems = [
  { id: "dashboard", label: "Workspace", path: "/dashboard", icon: LayoutDashboard },
  { id: "resume-ai", label: "Resume Intelligence", path: "/dashboard#resume", icon: FileText },
  { id: "assessment", label: "Technical Assessment", path: "/dashboard#assessment", icon: CheckSquare },
  { id: "interview-engine", label: "AI Interview", path: "/interview", icon: Video },
  { id: "evaluation", label: "Evaluation Center", path: "/dashboard#evaluation", icon: Award },
  { id: "roadmap", label: "Career Roadmap", path: "/dashboard#roadmap", icon: Compass },
  { id: "evolution", label: "Candidate Evolution", path: "/dashboard#evolution", icon: TrendingUp },
  { id: "portfolio", label: "Portfolio & Share", path: "/dashboard#portfolio", icon: Share2 },
  { id: "settings", label: "Settings", path: "/profile", icon: Settings },
];

export const DashboardSidebar = memo(function DashboardSidebar({
  collapsed,
  onToggle,
  isMobile
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "R";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? 280 : (collapsed ? 76 : 280),
          x: isMobile && collapsed ? -280 : 0
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 h-screen z-50 bg-[#09090B] border-r border-white/[0.08] flex flex-col justify-between p-3 select-none"
      >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <GetHireLogo to="/dashboard" size="md" showText={!collapsed} />

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4 text-[#39FF88]" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.id === "dashboard" && location.pathname === "/dashboard" && !location.hash);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-emerald-500/10 text-[#39FF88] border border-emerald-500/20 shadow-[0_0_15px_rgba(57,255,136,0.1)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#39FF88]" : "text-neutral-400 group-hover:text-white"}`} />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {isActive && !collapsed && (
                  <ArrowRight className="h-3.5 w-3.5 text-[#39FF88]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.08]">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-8 w-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.profile_photo || user?.avatar_url ? (
                  <img
                    src={user.profile_photo || user.avatar_url || undefined}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#39FF88] border border-[#09090B]" />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {user?.full_name?.split(" ")[0] || "Rudra"}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate">
                    {user?.target_role || "Frontend Developer"}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            )}
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                className="absolute bottom-12 left-0 right-0 min-w-[190px] p-2 rounded-2xl bg-[#111217] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-1"
              >
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                >
                  <User className="h-3.5 w-3.5 text-[#39FF88]" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 w-full text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-400">
            <Headphones className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex flex-col text-[11px]">
              <span>Need Help?</span>
              <a
                href="mailto:support@gethire.ai"
                className="text-[#39FF88] hover:underline font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
    </>
  );
});

export default DashboardSidebar;

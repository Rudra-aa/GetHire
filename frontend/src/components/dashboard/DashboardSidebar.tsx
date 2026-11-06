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
  Share2,
  RotateCcw
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { GetHireLogo } from "@/components/common/GetHireLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ResetProgressModal } from "@/components/dashboard/ResetProgressModal";

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
  const [showResetModal, setShowResetModal] = useState(false);
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
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
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
        className="fixed top-0 left-0 h-screen z-50 bg-white/80 backdrop-blur-xl border-r border-white/85 shadow-glass flex flex-col justify-between p-3 select-none"
      >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <GetHireLogo to="/dashboard" size="md" showText={!collapsed} />

          <div className="flex items-center gap-1">
            <ThemeToggle compact={true} />
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4 text-[#1E8C5A]" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
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
                    ? "bg-[#EEF4F9] text-[#1E8C5A] border-l-2 border-[#A8D8C3] shadow-sm"
                    : "text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1E8C5A]" : "text-[#8FA3BC] group-hover:text-[#263D68]"}`} />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {isActive && !collapsed && (
                  <ArrowRight className="h-3.5 w-3.5 text-[#1E8C5A]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-[#E4EDF5]">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F0F5F9] transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-[#A8D8C3] to-[#B9D9EC] border border-[#D0DCE8] flex items-center justify-center text-xs font-bold text-[#1A2D52] shrink-0">
                {user?.profile_photo || user?.avatar_url ? (
                  <img
                    src={user.profile_photo || user.avatar_url || undefined}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#2DA870] border border-white" />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#263D68] truncate">
                    {user?.full_name?.split(" ")[0] || "Rudra"}
                  </span>
                  <span className="text-[10px] text-[#5A6E8C] truncate">
                    {user?.target_role || "Frontend Developer"}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronDown className="h-3.5 w-3.5 text-[#5A6E8C]" />
            )}
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                className="absolute bottom-12 left-0 right-0 min-w-[190px] p-2 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/85 shadow-glass-dropdown z-50 flex flex-col gap-1"
              >
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#263D68] hover:text-[#1A2D52] hover:bg-[#F0F5F9]"
                >
                  <User className="h-3.5 w-3.5 text-[#1E8C5A]" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowResetModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 w-full text-left font-medium cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                  <span>Reset Progress</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 w-full text-left cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ResetProgressModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onResetSuccess={() => {
            navigate("/dashboard");
            window.location.reload();
          }}
        />

        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#5A6E8C]">
            <Headphones className="h-4 w-4 text-[#8FA3BC] shrink-0" />
            <div className="flex flex-col text-[11px]">
              <span>Need Help?</span>
              <a
                href="mailto:support@gethire.ai"
                className="text-[#1E8C5A] hover:underline font-medium"
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

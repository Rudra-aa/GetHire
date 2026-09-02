import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu } from "lucide-react";
import { GetHireLogo } from "@/components/common/GetHireLogo";

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Hide sidebar during Technical Assessment and active AI Interview test modes
  const isAssessmentRoute = location.pathname.startsWith("/assessment");
  const isInterviewActiveRoute = location.pathname.startsWith("/interview") && !location.pathname.includes("/evaluation");
  const isDedicatedMode = isAssessmentRoute || isInterviewActiveRoute;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine the dynamic left margin for the main content
  const getMarginLeft = () => {
    if (isDedicatedMode) return "0px";
    if (isMobile) return "0px";
    return collapsed ? "76px" : "280px";
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans flex flex-col md:flex-row">
      {/* Mobile Top Navigation (only visible on mobile when sidebar is hidden/drawer) */}
      {!isDedicatedMode && isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#09090B] border-b border-white/[0.08] z-30 flex items-center justify-between px-4">
          <GetHireLogo size="sm" />
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-neutral-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
      )}

      {/* Reserved Sidebar Column — Hidden completely during Assessment & Interview Dedicated Modes */}
      {!isDedicatedMode && (
        <DashboardSidebar 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
          isMobile={isMobile}
        />
      )}

      {/* Main Content Area */}
      <main 
        id="main-content" 
        className={`flex-1 min-w-0 min-h-screen relative z-10 transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDedicatedMode ? "p-0" : "p-4 sm:p-6 lg:p-8 pt-20 md:pt-4 sm:pt-6 lg:pt-8"
        }`}
        style={{ 
          marginLeft: getMarginLeft(),
          width: isDedicatedMode || isMobile ? "100%" : `calc(100% - ${getMarginLeft()})` 
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

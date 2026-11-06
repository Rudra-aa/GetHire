import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu } from "lucide-react";
import { GetHireLogo } from "@/components/common/GetHireLogo";

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

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

  const getMarginLeft = () => {
    if (isDedicatedMode) return "0px";
    if (isMobile) return "0px";
    return collapsed ? "76px" : "280px";
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#263D68] font-sans flex flex-col md:flex-row relative overflow-x-clip">
      {/* ── Fixed Atmospheric Soft Tinted Ambient Canvas (z-index: 0) ──────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F9FB] via-[#F3F7FA] to-[#F5F2F9]" />
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-[#B9D9EC]/32 blur-[130px]" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full bg-[#A8D8C3]/28 blur-[130px]" />
        <div className="absolute top-[38%] right-[15%] w-[680px] h-[550px] rounded-full bg-[#DCD5F0]/30 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[8%] w-[650px] h-[650px] rounded-full bg-[#A8D8C3]/25 blur-[140px]" />
      </div>

      {!isDedicatedMode && isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white/85 backdrop-blur-md border-b border-[#D0DCE8]/80 z-30 flex items-center justify-between px-4 shadow-[0_1px_3px_rgba(38,61,104,0.04)]">
          <GetHireLogo size="sm" />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
      )}

      {!isDedicatedMode && (
        <DashboardSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          isMobile={isMobile}
        />
      )}

      <main
        id="main-content"
        className={`flex-1 min-w-0 min-h-screen relative z-10 transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-transparent ${
          isDedicatedMode ? "p-0" : "p-4 sm:p-6 lg:p-8 pt-20 md:pt-4 sm:pt-6 lg:pt-8"
        }`}
        style={{
          marginLeft: getMarginLeft(),
          width: isDedicatedMode || isMobile ? "100%" : `calc(100% - ${getMarginLeft()})`,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

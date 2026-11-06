import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

export default function RootLayout() {
  return (
    <div className="relative min-h-screen bg-transparent text-[#263D68] overflow-x-clip">
      {/* ── Fixed Atmospheric Soft Tinted Ambient Canvas (z-index: 0) ──────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      >
        {/* Base gentle gradient: light powder, lavender, and emerald tints */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F9FB] via-[#F3F7FA] to-[#F5F2F9]" />

        {/* Ambient Chromatic Glows strictly from the palette */}
        {/* Top-left: Powder Blue */}
        <div className="absolute -top-32 -left-32 w-[680px] h-[680px] rounded-full bg-[#B9D9EC]/35 blur-[130px]" />
        {/* Top-right: Soft Emerald */}
        <div className="absolute -top-20 -right-20 w-[620px] h-[620px] rounded-full bg-[#A8D8C3]/30 blur-[130px]" />
        {/* Mid-screen: Pale Soft Lavender */}
        <div className="absolute top-[35%] left-[20%] w-[750px] h-[600px] rounded-full bg-[#DCD5F0]/32 blur-[150px]" />
        {/* Lower-left: Soft Emerald */}
        <div className="absolute top-[65%] -left-20 w-[640px] h-[640px] rounded-full bg-[#A8D8C3]/25 blur-[140px]" />
        {/* Lower-right: Powder Blue */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[720px] h-[720px] rounded-full bg-[#B9D9EC]/32 blur-[150px]" />
      </div>

      {/* ── Application Content Layer (z-index: 1) ─────────────────────────── */}
      <div className="relative z-[1] flex flex-col min-h-screen">
        <Navbar />
        <main id="main-content" className="flex-1 bg-transparent">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

export default function RootLayout() {
  return (
    <div className="relative min-h-screen bg-transparent text-neutral-200 overflow-x-clip">
      {/* ── Single Global Fixed Heavy-Blurred Background Layer (z-index: 0) ─── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      >
        <img
          src="/landing-bg-wave.png"
          alt=""
          className="w-full h-full object-cover object-center filter blur-[48px] sm:blur-[70px] lg:blur-[90px] scale-125 opacity-95 transition-all"
        />
        {/* Subtle dark vignette overlay to preserve crisp contrast and readability */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55 pointer-events-none" />
      </div>

      {/* ── Application Content Layer (z-index: 1) ─────────────────────────── */}
      <div className="relative z-[1] flex flex-col min-h-screen">
        <Navbar />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

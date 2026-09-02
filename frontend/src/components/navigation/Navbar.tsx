import type { MouseEvent } from "react";
import { useEffect, useState, memo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { PanelId } from "@/pages/LandingPage";
import { GetHireLogo } from "@/components/common/GetHireLogo";

// ── Nav item type ─────────────────────────────────────────────────────────────
type NavItem =
  | { label: string; href: string; panel?: never }
  | { label: string; panel: PanelId; href?: never };

// On-page scroll links — sections rendered directly on the main page
const mainLinks: NavItem[] = [
  { label: "Home",             href: "#hero"               },
  { label: "Resume AI",        href: "#resume-intelligence" },
  { label: "Interview Engine", href: "#interview-engine"    },
  { label: "Evaluation",       href: "#evaluation"          },
  { label: "Architecture",     href: "#architecture"        },
  { label: "Demo",             href: "#demo"                },
];

// Panel links — open a glass overlay, never scroll
const panelLinks: NavItem[] = [
  { label: "FaceSense",  panel: "facesense"  },
  { label: "VoiceSense", panel: "voicesense" },
  { label: "Technology", panel: "technology" },
  { label: "FAQ",        panel: "faq"        },
];

function openPanel(id: PanelId) {
  window.dispatchEvent(new CustomEvent("gethire:open-panel", { detail: id }));
}

export const Navbar = memo(function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);
  const { accessToken, logout }       = useAuthStore();
  const location                      = useLocation();
  const isLanding                     = location.pathname === "/";

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    if (!moreOpen) return;
    const handler = () => setMoreOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [moreOpen]);

  const handlePanelLink = useCallback((e: MouseEvent, id: PanelId) => {
    e.preventDefault();
    openPanel(id);
    setMenuOpen(false);
    setMoreOpen(false);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <nav
        aria-label="Main navigation"
        className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3 w-full max-w-[1240px] transition-all duration-300 ${
          scrolled
            ? "bg-[#09090B]/40 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
            : "bg-black/20 backdrop-blur-xl border border-white/[0.06]"
        } rounded-full`}
      >
        {/* ── Brand with Isometric Green Layers Icon ─────────────────── */}
        <GetHireLogo to="/" size="md" />

        {/* ── Desktop: Main scroll links ────────────────────────────── */}
        {isLanding && (
          <ul role="list" className="hidden items-center gap-5 md:flex flex-1 justify-center">
            {mainLinks.map((link, idx) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`text-[13px] font-semibold transition-all duration-150 py-1 ${
                    idx === 0
                      ? "text-[#39FF88] drop-shadow-[0_0_8px_rgba(57,255,136,0.6)]"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}

            {/* "More" dropdown for panel links */}
            <li className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMoreOpen((o) => !o); }}
                className="flex items-center gap-1 text-[13px] font-semibold text-neutral-300 hover:text-white transition-colors duration-150 py-1"
              >
                <span>More</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180 text-[#39FF88]" : ""}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute top-9 left-1/2 -translate-x-1/2 w-48 rounded-2xl p-2 flex flex-col gap-1 bg-[#111217]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {panelLinks.map((item) => (
                      <button
                        key={item.label}
                        onClick={(e) => item.panel && handlePanelLink(e, item.panel)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] font-mono text-[#39FF88] bg-emerald-500/15 border border-emerald-500/30 rounded px-1.5 py-0.2">
                          View
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
        )}

        {/* ── Desktop: Auth + CTA (Lime Green Radiant Pill) ─────────── */}
        <div className="hidden items-center gap-3 sm:flex shrink-0">
          {accessToken ? (
            <>
              <Link
                to="/dashboard"
                className="text-[13px] font-bold text-[#39FF88] hover:underline transition-colors px-2 py-1"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-[13px] font-semibold text-neutral-300 hover:text-white transition-colors px-2 py-1"
              >
                Profile
              </Link>
              <button
                onClick={() => void logout()}
                className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/15 hover:border-rose-500/40 text-neutral-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-semibold text-neutral-200 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-black text-black bg-gradient-to-r from-[#86EFAC] via-[#39FF88] to-[#4ADE80] shadow-[0_0_20px_rgba(57,255,136,0.45)] hover:brightness-110 transition-all duration-200 hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ──────────────────────────────────────── */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg border border-white/[0.12] text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* ── Mobile Full Menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-[62px] inset-x-4 sm:hidden flex flex-col shadow-2xl overflow-hidden bg-[#111217]/95 backdrop-blur-2xl border border-white/15 rounded-2xl"
          >
            {/* On-page links */}
            {isLanding && (
              <div className="p-4 flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-2 mb-1">Navigate</p>
                {mainLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Panel links */}
            {isLanding && (
              <div className="p-4 flex flex-col gap-1 border-t border-white/[0.08]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-2 mb-1">Interactive Panels</p>
                {panelLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => item.panel && handlePanelLink(e, item.panel)}
                    className="w-full text-left text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-[#39FF88] border border-emerald-500/30 rounded px-1.5 py-0.5">Open</span>
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Auth CTAs */}
            <div className="p-4 border-t border-white/[0.08] flex flex-col gap-2">
              {accessToken ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-black bg-[#39FF88]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { void logout(); setMenuOpen(false); }}
                    className="w-full text-center py-2 text-xs font-semibold text-rose-400"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-3 rounded-full text-sm font-black text-black bg-gradient-to-r from-[#86EFAC] via-[#39FF88] to-[#4ADE80]"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-neutral-300 hover:text-white"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

export default Navbar;

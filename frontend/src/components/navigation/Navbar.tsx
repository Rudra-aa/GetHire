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
            ? "bg-white/80 backdrop-blur-xl border border-white/85 shadow-glass-dropdown"
            : "bg-white/70 backdrop-blur-md border border-white/75 shadow-glass"
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
                      ? "text-[#1E8C5A]"
                      : "text-[#5A6E8C] hover:text-[#263D68]"
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
                className="flex items-center gap-1 text-[13px] font-semibold text-[#5A6E8C] hover:text-[#263D68] transition-colors duration-150 py-1"
              >
                <span>More</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180 text-[#1E8C5A]" : ""}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute top-9 left-1/2 -translate-x-1/2 w-48 rounded-2xl p-2 flex flex-col gap-1 bg-white/85 backdrop-blur-xl border border-white/85 shadow-glass-dropdown z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {panelLinks.map((item) => (
                      <button
                        key={item.label}
                        onClick={(e) => item.panel && handlePanelLink(e, item.panel)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-all flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] font-mono text-[#1E8C5A] bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 rounded px-1.5 py-0.2">
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

        {/* ── Desktop: Auth + CTA (Emerald Pill) ─────────── */}
        <div className="hidden items-center gap-3 sm:flex shrink-0">
          {accessToken ? (
            <>
              <Link
                to="/dashboard"
                className="text-[13px] font-bold text-[#1E8C5A] hover:underline transition-colors px-2 py-1"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-[13px] font-semibold text-[#5A6E8C] hover:text-[#263D68] transition-colors px-2 py-1"
              >
                Profile
              </Link>
              <button
                onClick={() => void logout()}
                className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D0DCE8] hover:border-rose-300 text-[#5A6E8C] hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-semibold text-[#5A6E8C] hover:text-[#263D68] px-3 py-1.5 rounded-full hover:bg-[#F0F5F9] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-black text-[#1A2D52] shadow-[0_4px_12px_rgba(38,61,104,0.08)] hover:brightness-105 transition-all duration-200 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
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
          className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg border border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68] hover:bg-[#F0F5F9] transition-colors"
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
            className="pointer-events-auto absolute top-[62px] inset-x-4 sm:hidden flex flex-col shadow-glass-modal overflow-hidden bg-white/90 backdrop-blur-xl border border-white/85 rounded-2xl"
          >
            {/* On-page links */}
            {isLanding && (
              <div className="p-4 flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8FA3BC] px-2 mb-1">Navigate</p>
                {mainLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-semibold text-[#5A6E8C] hover:text-[#263D68] px-3 py-2.5 rounded-xl hover:bg-[#F0F5F9] transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Panel links */}
            {isLanding && (
              <div className="p-4 flex flex-col gap-1 border-t border-[#D0DCE8]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8FA3BC] px-2 mb-1">Interactive Panels</p>
                {panelLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => item.panel && handlePanelLink(e, item.panel)}
                    className="w-full text-left text-sm font-semibold text-[#5A6E8C] hover:text-[#263D68] px-3 py-2.5 rounded-xl hover:bg-[#F0F5F9] transition-all flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-[#1E8C5A] border border-[#A8D8C3]/40 rounded px-1.5 py-0.5">Open</span>
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Auth CTAs */}
            <div className="p-4 border-t border-[#D0DCE8] flex flex-col gap-2">
              {accessToken ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-[#1A2D52]"
                    style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { void logout(); setMenuOpen(false); }}
                    className="w-full text-center py-2 text-xs font-semibold text-rose-500"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-3 rounded-full text-sm font-black text-[#1A2D52]"
                    style={{ background: "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)" }}
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-[#5A6E8C] hover:text-[#263D68]"
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

import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { GetHireLogo } from "@/components/common/GetHireLogo";
import { Button } from "@/components/ui/Button";

interface AuthLayoutProps {
  mode: "login" | "register";
  error?: string | null;
  onClearError?: () => void;
  flashMessage?: string | null;
  children: ReactNode;
}

// ── Social Icons ─────────────────────────────────────────────────────────────
function GooglePlusIcon() {
  return (
    <span className="font-bold text-xs tracking-tighter font-sans">
      G<sup className="text-[9px] font-semibold">+</sup>
    </span>
  );
}

function FacebookIcon() {
  return (
    <span className="font-bold text-sm lowercase font-serif">
      f
    </span>
  );
}

// ── Floating Particle Dots ───────────────────────────────────────────────────
const particles = [
  { id: 1, left: "15%", top: "25%", size: 6, delay: 0, duration: 6 },
  { id: 2, left: "75%", top: "18%", size: 8, delay: 1, duration: 8 },
  { id: 3, left: "30%", top: "65%", size: 5, delay: 0.5, duration: 7 },
  { id: 4, left: "85%", top: "72%", size: 7, delay: 2, duration: 6.5 },
  { id: 5, left: "55%", top: "40%", size: 4, delay: 1.5, duration: 5.5 },
];

export function AuthLayout({
  mode,
  error,
  onClearError,
  flashMessage,
  children,
}: AuthLayoutProps) {
  const navigate = useNavigate();
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSocialClick = (name: string) => {
    setSocialNotice(`${name} sign-in is initialized. Use email for instant access.`);
    setTimeout(() => setSocialNotice(null), 4000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F0F8FD] to-[#F7F9FB] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden text-[#263D68] select-none">
      {/* ── Background Soft Glow ────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#B9D9EC]/[0.18] blur-[150px]" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#A8D8C3]/[0.14] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#DCD5F0]/[0.14] blur-[120px]" />
      </div>

      {/* ── 50/50 Split-Screen Outer Card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1100px] min-h-[660px] rounded-[28px] sm:rounded-[32px] bg-white/85 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_20px_50px_rgba(38,61,104,0.08),_inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10"
      >
        {/* ── Left Branding Panel (48% on desktop) ────────────────────────── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#EEF6FB]/80 to-[#F5F0FD]/80 backdrop-blur-md relative p-8 sm:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#D0DCE8]/80 min-h-[380px] lg:min-h-full">
          {/* Subtle Soft Glow in Panel */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#A8D8C3]/[0.12] rounded-full blur-[90px] pointer-events-none" />

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                animate={{
                  y: [0, -18, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
                className="absolute rounded-full bg-[#A8D8C3]"
                style={{
                  left: p.left,
                  top: p.top,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  boxShadow: "0 0 8px rgba(168,216,195,0.5)",
                }}
              />
            ))}
          </div>

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <GetHireLogo to="/" size="lg" />
          </div>

          {/* Center Graphic & Headlines */}
          <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
            {/* Stacked Badge */}
            <motion.div
              key={mode}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-24 h-24 rounded-3xl bg-white/90 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-glass flex items-center justify-center relative mb-8 group"
            >
              <div className="absolute inset-0 rounded-3xl bg-[#A8D8C3]/10 blur-md" />
              <svg viewBox="0 0 40 40" fill="none" className="h-12 w-12 relative z-10">
                <path
                  d="M20 5L6 12v16l14 7 14-7V12L20 5z"
                  stroke="#A8D8C3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12l14 7 14-7"
                  stroke="#A8D8C3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 19v14"
                  stroke="#A8D8C3"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M11 14.5l9 4.5 9-4.5"
                  stroke="#B9D9EC"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center max-w-sm"
              >
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#263D68]">
                  {isLogin ? (
                    <>
                      Welcome to <span className="text-[#1E8C5A]">GetHire</span>
                    </>
                  ) : (
                    <>
                      Welcome <span className="text-[#1E8C5A]">Back!</span>
                    </>
                  )}
                </h2>

                <p className="text-xs sm:text-sm text-[#5A6E8C] mt-3 leading-relaxed">
                  {isLogin
                    ? "Your AI Career Operating System for Resume Intelligence, Skill Analysis and Interview Success."
                    : "Enter your personal details to use all of GetHire features."}
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xs">
                  <p className="text-xs text-[#5A6E8C] font-medium">
                    {isLogin ? "Don't have an account yet?" : "Already have an account?"}
                  </p>

                  <Button
                    type="button"
                    variant="outlineGreen"
                    size="xl"
                    className="w-full h-12 rounded-2xl font-bold tracking-wider"
                    onClick={() => navigate(isLogin ? "/register" : "/login")}
                    iconRight={<ArrowRight className="h-4 w-4" />}
                  >
                    {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Soft Wave SVG Lines */}
          <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none opacity-40">
            <svg viewBox="0 0 400 120" fill="none" className="w-full h-full preserve-3d">
              <path
                d="M-50 100 Q 100 40, 200 80 T 450 20"
                stroke="url(#blueGradientWave)"
                strokeWidth="1.8"
              />
              <path
                d="M-50 110 Q 120 70, 240 90 T 450 40"
                stroke="url(#blueGradientWave)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <path
                d="M-50 80 Q 80 20, 180 60 T 450 10"
                stroke="#A8D8C3"
                strokeWidth="0.8"
                strokeOpacity="0.5"
              />
              <defs>
                <linearGradient id="blueGradientWave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A8D8C3" stopOpacity="0" />
                  <stop offset="50%" stopColor="#A8D8C3" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#B9D9EC" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ── Right Authentication Panel (52% on desktop) ────────────────── */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md p-8 sm:p-12 flex flex-col justify-center relative z-10">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#263D68]">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              {/* Emerald Accent Pill */}
              <div className="w-10 h-1 bg-[#A8D8C3] rounded-full mx-auto mt-2.5" />
            </div>

            {/* Social Login Row */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleSocialClick("Google")}
                aria-label="Sign in with Google"
                className="w-12 h-12 rounded-2xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 text-[#5A6E8C] hover:text-[#263D68] hover:border-[#A8D8C3] hover:bg-white transition-all duration-200"
              >
                <GooglePlusIcon />
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("Facebook")}
                aria-label="Sign in with Facebook"
                className="w-12 h-12 rounded-2xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 text-[#5A6E8C] hover:text-[#263D68] hover:border-[#A8D8C3] hover:bg-white transition-all duration-200"
              >
                <FacebookIcon />
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("GitHub")}
                aria-label="Sign in with GitHub"
                className="w-12 h-12 rounded-2xl bg-[#FAFBFC] border border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68] hover:border-[#A8D8C3] hover:bg-[#F0F5F9] flex items-center justify-center transition-all duration-200"
              >
                <Github className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("LinkedIn")}
                aria-label="Sign in with LinkedIn"
                className="w-12 h-12 rounded-2xl bg-[#FAFBFC] border border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68] hover:border-[#A8D8C3] hover:bg-[#F0F5F9] flex items-center justify-center transition-all duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D0DCE8]" />
              </div>
              <span className="relative px-3 bg-white text-xs text-[#5A6E8C] font-medium">
                {isLogin ? "or use your email for sign in" : "or use your email for registration"}
              </span>
            </div>

            {/* Notifications / Alerts */}
            {flashMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl border border-[#A8D8C3]/50 bg-[#A8D8C3]/15 text-[#1E8C5A] text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{flashMessage}</span>
              </motion.div>
            )}

            {socialNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl border border-[#D4921A]/30 bg-[#D4921A]/10 text-[#D4921A] text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{socialNotice}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl border border-[#E05C5C]/30 bg-[#E05C5C]/10 text-[#E05C5C] text-xs flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {onClearError && (
                  <button
                    type="button"
                    onClick={onClearError}
                    className="text-[10px] uppercase font-bold tracking-wider hover:text-[#263D68] transition-colors ml-2"
                  >
                    Clear
                  </button>
                )}
              </motion.div>
            )}

            {/* Form Slot */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>

            {/* Mobile / Secondary Bottom Navigation Link */}
            <div className="text-center text-xs text-[#5A6E8C] mt-6 pt-4 border-t border-[#D0DCE8]">
              {isLogin ? (
                <>
                  New to GetHire?{" "}
                  <Link
                    to="/register"
                    className="text-[#1E8C5A] hover:underline font-semibold transition-colors"
                  >
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#1E8C5A] hover:underline font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default AuthLayout;

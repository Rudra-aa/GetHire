/**
 * src/pages/LandingPage.tsx
 * --------------------------
 * Sprint 0 development status dashboard.
 *
 * Displays:
 * - GetHire branding
 * - Backend connectivity status (live API call to GET /api/v1/health)
 * - MongoDB status (from the health response)
 * - Redis status (from the health response)
 * - Service version and environment
 *
 * This page will be replaced by the full marketing landing page in Sprint 1.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchHealth } from "@/services/healthService";
import type { HealthResponse } from "@/types";

// ── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface StatusBadgeProps {
  label: string;
  status: string | null;
  loading: boolean;
}

function StatusBadge({ label, status, loading }: StatusBadgeProps) {
  const isConnected = status === "connected";
  const isHealthy = status === "healthy";
  const isDegraded = status === "degraded";

  const color = loading
    ? "bg-surface-800 text-surface-200 border-surface-700"
    : isConnected || isHealthy
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    : isDegraded
    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
    : "bg-red-500/10 text-red-400 border-red-500/30";

  const dot = loading
    ? "bg-surface-400 animate-pulse"
    : isConnected || isHealthy
    ? "bg-emerald-400"
    : isDegraded
    ? "bg-yellow-400"
    : "bg-red-400";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color} transition-all duration-300`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-sm font-medium min-w-[120px]">{label}</span>
      <span className="text-sm font-mono ml-auto">
        {loading ? "checking…" : (status ?? "unreachable")}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function checkHealth() {
    setLoading(true);
    const result = await fetchHealth();
    setHealth(result);
    setLoading(false);
    setLastChecked(new Date());
  }

  // Poll the health endpoint every 10 seconds
  useEffect(() => {
    void checkHealth();
    const interval = setInterval(() => void checkHealth(), 10_000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = loading ? null : health?.status ?? null;
  const headerStatusColor =
    overallStatus === "healthy"
      ? "text-emerald-400"
      : overallStatus === "degraded"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/8 blur-[80px]" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-10 max-w-lg w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Wordmark ── */}
        <motion.div className="text-center" variants={itemVariants}>
          <h1 className="text-5xl font-extrabold tracking-tight gradient-text mb-3">
            GetHire
          </h1>
          <p className="text-surface-200 text-lg font-medium">
            AI-Powered Interview Readiness Platform
          </p>
          <p className="text-surface-300 text-sm mt-1">
            Sprint 0 — Development Foundation
          </p>
        </motion.div>

        {/* ── Status Panel ── */}
        <motion.div
          className="glass-card w-full p-6 flex flex-col gap-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-surface-200 uppercase tracking-widest">
              System Status
            </h2>
            {!loading && (
              <span className={`text-sm font-bold ${headerStatusColor}`}>
                {overallStatus}
              </span>
            )}
          </div>

          <StatusBadge
            label="Backend API"
            status={health ? health.status : null}
            loading={loading}
          />
          <StatusBadge
            label="MongoDB"
            status={health?.services.database ?? null}
            loading={loading}
          />
          <StatusBadge
            label="Redis"
            status={health?.services.redis ?? null}
            loading={loading}
          />
        </motion.div>

        {/* ── Info Grid ── */}
        <motion.div
          className="grid grid-cols-2 gap-3 w-full"
          variants={itemVariants}
        >
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-surface-300 uppercase tracking-widest mb-1">
              Version
            </p>
            <p className="font-mono text-brand-300 font-semibold">
              {health?.version ?? "—"}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-surface-300 uppercase tracking-widest mb-1">
              Environment
            </p>
            <p className="font-mono text-brand-300 font-semibold capitalize">
              {health?.environment ?? "—"}
            </p>
          </div>
          <div className="glass-card p-4 text-center col-span-2">
            <p className="text-xs text-surface-300 uppercase tracking-widest mb-1">
              Uptime
            </p>
            <p className="font-mono text-brand-300 font-semibold">
              {health
                ? `${health.uptime_seconds.toFixed(1)}s`
                : "—"}
            </p>
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div className="flex gap-3" variants={itemVariants}>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold transition-colors duration-200"
          >
            Swagger Docs
          </a>
          <a
            href="http://localhost:8000/redoc"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/10 text-surface-200 text-sm font-semibold transition-colors duration-200"
          >
            ReDoc
          </a>
          <button
            onClick={() => void checkHealth()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/10 text-surface-200 text-sm font-semibold transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Refresh"}
          </button>
        </motion.div>

        {/* ── Last checked ── */}
        {lastChecked && (
          <motion.p
            className="text-surface-300 text-xs"
            variants={itemVariants}
          >
            Last checked: {lastChecked.toLocaleTimeString()}
          </motion.p>
        )}
      </motion.div>
    </main>
  );
}

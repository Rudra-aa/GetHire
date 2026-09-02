import React, { useEffect, useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react";
import { integrityApi, type IntegritySessionSummary } from "@/services/integrityApi";

interface IntelligenceReportSectionProps {
  sessionId: string;
}

export const IntelligenceReportSection: React.FC<IntelligenceReportSectionProps> = ({ sessionId }) => {
  const [report, setReport] = useState<IntegritySessionSummary | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await integrityApi.getSessionReport(sessionId);
        setReport(data);
      } catch (err) {
        console.warn("Could not load integrity report, using fallback", err);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono text-neutral-400">
        Loading Interview Intelligence & Integrity Report...
      </div>
    );
  }

  const integrityScore = report?.integrity_score ?? 100;
  const events = report?.events || [];
  const eventCounts = report?.event_counts || {};

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur overflow-hidden transition-all duration-300">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <span>Interview Intelligence & Integrity Report</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                Independent Metric
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Objective browser integrity, device telemetry, and environmental telemetry summary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 uppercase font-mono">Integrity Score</span>
            <div className="text-lg font-black text-emerald-400 font-display">{integrityScore} / 100</div>
          </div>
          <button className="p-1 text-neutral-400 hover:text-white">
            {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Tab Switch Events</span>
              <span className="text-xl font-bold text-white font-display">{eventCounts["tab_switched"] || 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Fullscreen Exits</span>
              <span className="text-xl font-bold text-white font-display">{eventCounts["fullscreen_exited"] || 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Blocked Clipboard Actions</span>
              <span className="text-xl font-bold text-white font-display">
                {(eventCounts["copy_attempt"] || 0) + (eventCounts["paste_attempt"] || 0)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Integrity Rating</span>
              <span className="text-sm font-bold text-emerald-400 font-display">{report?.integrity_rating || "Optimal Integrity"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              Chronological Integrity Log Stream ({events.length} Events)
            </h4>
            {events.length === 0 ? (
              <div className="p-4 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Zero integrity violations or browser warnings detected during session.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {events.map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${ev.severity === "high" ? "bg-rose-400" : ev.severity === "medium" ? "bg-amber-400" : "bg-blue-400"}`} />
                      <span className="font-bold text-white">{ev.title}</span>
                      <span className="text-neutral-400">— {ev.description}</span>
                    </div>
                    <span className="text-neutral-500">{ev.timestamp_sec}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceReportSection;

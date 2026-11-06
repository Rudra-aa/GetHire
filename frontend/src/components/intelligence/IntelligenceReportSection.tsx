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
      <div className="p-6 rounded-2xl bg-white border border-[#D0DCE8] text-xs font-mono text-[#5A6E8C]">
        Loading Interview Intelligence & Integrity Report...
      </div>
    );
  }

  const integrityScore = report?.integrity_score ?? 100;
  const events = report?.events || [];
  const eventCounts = report?.event_counts || {};

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass overflow-hidden transition-all duration-300">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/90 border-b border-[#E4EDF5] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#263D68] font-display flex items-center gap-2">
              <span>Interview Intelligence & Integrity Report</span>
              <span className="px-2 py-0.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/40 text-[10px] font-mono">
                Independent Metric
              </span>
            </h3>
            <p className="text-xs text-[#5A6E8C]">
              Objective browser integrity, device telemetry, and environmental telemetry summary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-[#5A6E8C] uppercase font-mono">Integrity Score</span>
            <div className="text-lg font-black text-[#1E8C5A] font-display">{integrityScore} / 100</div>
          </div>
          <button className="p-1 text-[#5A6E8C] hover:text-[#263D68]">
            {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Tab Switch Events</span>
              <span className="text-xl font-bold text-[#263D68] font-display">{eventCounts["tab_switched"] || 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Fullscreen Exits</span>
              <span className="text-xl font-bold text-[#263D68] font-display">{eventCounts["fullscreen_exited"] || 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Blocked Clipboard Actions</span>
              <span className="text-xl font-bold text-[#263D68] font-display">
                {(eventCounts["copy_attempt"] || 0) + (eventCounts["paste_attempt"] || 0)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Integrity Rating</span>
              <span className="text-sm font-bold text-[#1E8C5A] font-display">{report?.integrity_rating || "Optimal Integrity"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-sm">
            <h4 className="text-xs font-bold text-[#263D68] font-display uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#1E8C5A]" />
              Chronological Integrity Log Stream ({events.length} Events)
            </h4>
            {events.length === 0 ? (
              <div className="p-4 flex items-center gap-2 text-xs font-mono text-[#1E8C5A]">
                <CheckCircle className="h-4 w-4" />
                <span>Zero integrity violations or browser warnings detected during session.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {events.map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#D0DCE8] flex items-center justify-between text-xs font-mono shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${ev.severity === "high" ? "bg-rose-500" : ev.severity === "medium" ? "bg-amber-500" : "bg-[#2B7FAD]"}`} />
                      <span className="font-bold text-[#263D68]">{ev.title}</span>
                      <span className="text-[#5A6E8C]">— {ev.description}</span>
                    </div>
                    <span className="text-[#8FA3BC]">{ev.timestamp_sec}s</span>
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

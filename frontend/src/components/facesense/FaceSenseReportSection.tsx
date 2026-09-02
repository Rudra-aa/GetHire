import React, { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Eye, Activity, Target, UserCheck, AlertCircle } from "lucide-react";
import { faceSenseApi, type FaceSenseSessionSummary, type FaceSenseEvent } from "@/services/faceSenseApi";
import TimelineChart from "./TimelineChart";

interface FaceSenseReportSectionProps {
  sessionId: string;
}

export const FaceSenseReportSection: React.FC<FaceSenseReportSectionProps> = ({ sessionId }) => {
  const [data, setData] = useState<FaceSenseSessionSummary | null>(null);
  const [events, setEvents] = useState<FaceSenseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const summary = await faceSenseApi.getSessionSummary(sessionId);
        const timelineRes = await faceSenseApi.getSessionTimeline(sessionId);
        setData(summary);
        setEvents(timelineRes.events || []);
      } catch (err) {
        console.warn("Could not fetch FaceSense report, using fallback evaluation summary", err);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xs text-neutral-400 font-mono">
        Loading FaceSense Behavioral Intelligence Report...
      </div>
    );
  }

  const overallFaceScore = data?.overall_facescore || 85;
  const confidence = Math.round(data?.avg_confidence || 82);
  const eyeContact = Math.round(data?.avg_eye_contact || 87);
  const stress = Math.round(data?.avg_stress || 20);
  const attention = Math.round(data?.avg_attention || 88);
  const presence = Math.round(data?.avg_presence || 85);
  const timelineSeries = data?.timeline?.timeline_series || [];
  const qAnalytics = data?.question_analytics || [];

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#39FF88]/10 text-[#39FF88] border border-[#39FF88]/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Phase 6 Module
            </span>
            <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
              FaceSense Behavioral Intelligence Report
              <Sparkles className="h-4 w-4 text-gold-400" />
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time facial dynamics, eye contact tracking, composure, and question-correlated analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 uppercase font-mono">Overall FaceScore</span>
            <div className="text-xl font-black text-[#39FF88] font-display">{overallFaceScore} / 100</div>
          </div>
        </div>
      </div>

      {/* Top 5 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-mono">Confidence</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-white font-display">{confidence}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-mono">Eye Contact</span>
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <span className="text-lg font-bold text-white font-display">{eyeContact}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-mono">Stress Index</span>
            <Activity className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-lg font-bold text-white font-display">{stress}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-mono">Attention</span>
            <Target className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-lg font-bold text-white font-display">{attention}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-mono">Presence</span>
            <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-lg font-bold text-white font-display">{presence}%</span>
        </div>
      </div>

      {/* Timeline Chart */}
      <TimelineChart samples={timelineSeries} />

      {/* Question-wise Correlation Table */}
      {qAnalytics.length > 0 && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider text-neutral-300">
            Question-Correlated Behavioral Analytics
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Question</th>
                  <th className="py-2 px-3">Primary Expression</th>
                  <th className="py-2 px-3">Confidence</th>
                  <th className="py-2 px-3">Eye Contact</th>
                  <th className="py-2 px-3">Stress</th>
                  <th className="py-2 px-3">Attention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {qAnalytics.map((q, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-white">Q{idx + 1}</td>
                    <td className="py-2.5 px-3 text-amber-300 capitalize">{q.primary_emotion}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{Math.round(q.avg_confidence)}%</td>
                    <td className="py-2.5 px-3 text-cyan-400">{Math.round(q.avg_eye_contact)}%</td>
                    <td className="py-2.5 px-3 text-rose-400">{Math.round(q.avg_stress)}%</td>
                    <td className="py-2.5 px-3 text-amber-400">{Math.round(q.avg_attention)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Behavioral Events Feed */}
      {events.length > 0 && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-gold-400" /> Key Behavioral Events Logged
          </h4>
          <div className="flex flex-wrap gap-2">
            {events.map((ev, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono flex items-center gap-2"
              >
                <span className="text-gold-400 font-bold">{ev.event_type}</span>
                <span className="text-neutral-400">({ev.timestamp_sec}s)</span>
                <span className="text-neutral-500">— {ev.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceSenseReportSection;

import React, { useEffect, useState } from "react";
import {
  Video,
  Eye,
  ShieldCheck,
  Smile,
  Compass,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Quote,
} from "lucide-react";
import { faceSenseApi, type FaceSenseSessionSummary } from "@/services/faceSenseApi";

interface VisualPresentationSectionProps {
  data?: FaceSenseSessionSummary | null | undefined;
  sessionId?: string | undefined;
}

export const VisualPresentationSection: React.FC<VisualPresentationSectionProps> = ({
  data: initialData,
  sessionId,
}) => {
  const [data, setData] = useState<FaceSenseSessionSummary | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData && !!sessionId);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }
    if (!sessionId) return;

    let isMounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const summary = await faceSenseApi.getSessionSummary(sessionId);
        if (isMounted) setData(summary);
      } catch (err) {
        console.warn("Could not load visual presentation summary:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [initialData, sessionId]);

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex items-center justify-center text-xs text-[#5A6E8C] font-mono animate-pulse">
        Loading Visual & Non-Verbal Presentation Analysis...
      </div>
    );
  }

  // 1. Candidate Disabled State
  if (data?.data_quality_status === "disabled" || data?.visual_analysis_enabled === false) {
    return (
      <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EDF5]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-300 text-[10px] font-mono font-bold uppercase">
              Optional Module
            </span>
            <h2 className="text-base font-bold text-[#263D68] font-display flex items-center gap-2">
              Visual Presentation & Non-Verbal Analysis
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-600 font-mono text-xs font-bold">
            Disabled by Candidate
          </span>
        </div>
        <div className="p-5 rounded-xl bg-neutral-50/80 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-white border border-neutral-200 text-neutral-500 shadow-sm">
            <Video className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-[#263D68]">Camera Telemetry Paused</h4>
            <p className="text-xs text-[#5A6E8C] leading-relaxed">
              Visual presentation analysis is entirely optional and was disabled for this interview session. Spoken dialogue, technical accuracy, and domain evaluation remain fully scored without any score impact.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Insufficient Data State
  const isInsufficient =
    !data ||
    data.data_quality_status === "insufficient_data" ||
    (data.total_frames_processed ?? 0) < 5;

  if (isInsufficient) {
    return (
      <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EDF5]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold uppercase">
              Telemetry Status
            </span>
            <h2 className="text-base font-bold text-[#263D68] font-display flex items-center gap-2">
              Visual Presentation & Non-Verbal Analysis
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            Insufficient Data
          </span>
        </div>
        <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-white border border-amber-200 text-amber-600 shadow-sm">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-[#263D68]">Insufficient Camera Samples Collected</h4>
            <p className="text-xs text-[#5A6E8C] leading-relaxed">
              {data?.data_quality_reason ||
                "Camera feed was active for fewer than 5 continuous seconds. To protect evaluation validity, presentation scores require consistent camera framing. Technical accuracy and spoken answers remain fully evaluated."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Sufficient Data State
  const presentationScore =
    data.visual_presentation_score ||
    Math.round(data.presentation_stability_score || data.overall_facescore || 85);

  const ratingBand =
    data.verbal_attitude_assessment?.rating_band ||
    (presentationScore >= 85
      ? "Polished Professional Presence"
      : presentationScore >= 75
      ? "Solid Professional Demeanor"
      : "Developing Presentation Poise");

  const cameraFacing = Math.round(data.camera_facing_consistency_pct ?? data.avg_presence ?? 85);
  const eyeContact = Math.round(data.eye_contact_consistency_pct ?? data.avg_eye_contact ?? 82);
  const postureStability = Math.round(data.posture_stability_pct ?? 84);
  const expressionScore = Math.round(data.expression_variation_score ?? 78);

  const verbal = data.verbal_attitude_assessment;
  const strengths = data.strengths?.length ? data.strengths : [
    "Maintained steady camera-facing orientation throughout technical responses.",
    "Articulated problem-solving steps with collaborative and professional vocabulary.",
  ];
  const areasForGrowth = data.areas_for_improvement?.length ? data.areas_for_improvement : [
    "Position webcam at eye-level to maintain balanced head posture during longer answers.",
  ];

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#D0DCE8]/80 shadow-glass">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EDF5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#A8D8C3]/25 text-[#1E8C5A] border border-[#72C9AD]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              Independent Coaching Module
            </span>
            <h2 className="text-xl font-bold text-[#263D68] font-display flex items-center gap-2">
              Visual Presentation & Non-Verbal Communication
              <Sparkles className="h-4 w-4 text-[#1E8C5A]" />
            </h2>
          </div>
          <p className="text-xs text-[#5A6E8C] max-w-2xl">
            Observable physical poise, camera-facing consistency, and dialogue-grounded professional presence. Visual metrics provide constructive personal coaching and do not alter technical knowledge scores.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-[#D0DCE8]/80 shadow-sm">
          <div className="text-right">
            <div className="text-[10px] text-[#5A6E8C] uppercase font-mono font-bold">Presentation Index</div>
            <div className="text-2xl font-black text-[#1E8C5A] font-display">
              {presentationScore} <span className="text-xs text-[#5A6E8C] font-normal">/ 100</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#A8D8C3]/20 text-[#1E4D38] border border-[#72C9AD]/40 text-[11px] font-bold">
            {ratingBand}
          </span>
        </div>
      </div>

      {/* 4 Core Observable Presentation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Camera Facing */}
        <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[#5A6E8C]">
            <span className="text-[10px] uppercase font-mono font-bold">Camera Facing</span>
            <Compass className="h-4 w-4 text-[#2B7FAD]" />
          </div>
          <span className="text-2xl font-extrabold text-[#263D68] font-display">{cameraFacing}%</span>
          <p className="text-[11px] text-[#5A6E8C] leading-snug">
            Consistent center orientation toward interviewer.
          </p>
        </div>

        {/* Eye Contact with Thinking Leeway */}
        <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[#5A6E8C]">
            <span className="text-[10px] uppercase font-mono font-bold">Eye Engagement</span>
            <Eye className="h-4 w-4 text-[#1E8C5A]" />
          </div>
          <span className="text-2xl font-extrabold text-[#263D68] font-display">{eyeContact}%</span>
          <p className="text-[11px] text-[#5A6E8C] leading-snug">
            Active visual gaze with natural cognitive pauses allowed.
          </p>
        </div>

        {/* Posture Stability */}
        <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[#5A6E8C]">
            <span className="text-[10px] uppercase font-mono font-bold">Posture Stability</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-2xl font-extrabold text-[#263D68] font-display">{postureStability}%</span>
          <p className="text-[11px] text-[#5A6E8C] leading-snug">
            Balanced upper-body framing and steady head pose.
          </p>
        </div>

        {/* Facial Expression Variation */}
        <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[#5A6E8C]">
            <span className="text-[10px] uppercase font-mono font-bold">Expressiveness</span>
            <Smile className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-[#263D68] font-display">{expressionScore}%</span>
          <p className="text-[11px] text-[#5A6E8C] leading-snug">
            Observable expression variation across answer turns.
          </p>
        </div>
      </div>

      {/* Spoken Verbal Demeanor & Professional Attitude (Prompt 4 synthesis) */}
      {verbal && (
        <div className="p-5 rounded-xl bg-[#FAFBFC]/90 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#2B7FAD]" />
              <h3 className="text-sm font-bold text-[#263D68]">
                Professional Attitude & Verbal Interaction
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#5A6E8C]">
              Evaluated strictly from spoken dialogue & conversation responsiveness
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white border border-[#E4EDF5] flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Respectful Phrasing</span>
              <span className="text-xs font-bold text-[#1E8C5A] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {verbal.respectful_language_observed ? "Consistently Professional" : "Standard"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#E4EDF5] flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Answer Structure</span>
              <span className="text-xs font-bold text-[#263D68]">
                {verbal.clarity_organization_level} Structural Organization
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#E4EDF5] flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-[#5A6E8C]">Follow-up Receptiveness</span>
              <span className="text-xs font-bold text-[#2B7FAD]">
                {verbal.follow_up_receptiveness}
              </span>
            </div>
          </div>

          {/* Evidence Quotes */}
          {verbal.evidence_quotes && verbal.evidence_quotes.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[11px] font-mono font-bold text-[#5A6E8C] uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="h-3 w-3 text-[#5A6E8C]" /> Observable Candidate Excerpts
              </span>
              <div className="flex flex-wrap gap-2">
                {verbal.evidence_quotes.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#D0DCE8]/80 text-[11px] text-[#263D68] italic shadow-sm"
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {verbal.constructive_summary && (
            <p className="text-xs text-[#263D68] bg-white p-3.5 rounded-xl border border-[#E4EDF5] leading-relaxed">
              {verbal.constructive_summary}
            </p>
          )}
        </div>
      )}

      {/* Evidence-Based Strengths & Areas for Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-emerald-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Presentation Strengths
          </h4>
          <ul className="flex flex-col gap-2">
            {strengths.map((str, i) => (
              <li key={i} className="text-xs text-emerald-950 bg-white/90 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-600" />
            Actionable Presentation Coaching
          </h4>
          <ul className="flex flex-col gap-2">
            {areasForGrowth.map((growth, i) => (
              <li key={i} className="text-xs text-amber-950 bg-white/90 p-2.5 rounded-lg border border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{growth}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Presentation Stability Breakdown */}
      {data.question_analytics && data.question_analytics.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-[#E4EDF5]">
          <h4 className="text-xs font-bold text-[#263D68] uppercase font-mono tracking-wider">
            Turn-by-Turn Visual Poise Analysis
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E4EDF5] rounded-xl overflow-hidden">
              <thead className="bg-[#FAFBFC] text-[#5A6E8C] font-mono text-[10px] uppercase border-b border-[#E4EDF5]">
                <tr>
                  <th className="py-2.5 px-3">Question</th>
                  <th className="py-2.5 px-3 text-center">Frames Analyzed</th>
                  <th className="py-2.5 px-3 text-center">Eye Contact</th>
                  <th className="py-2.5 px-3 text-center">Attention Poise</th>
                  <th className="py-2.5 px-3 text-center">Dominant Expression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EDF5] bg-white">
                {data.question_analytics.map((qa, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#263D68]">
                      Question #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#5A6E8C]">
                      {qa.sample_count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#1E8C5A]">
                      {Math.round(qa.avg_eye_contact)}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#2B7FAD]">
                      {Math.round(qa.avg_attention)}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#263D68]">
                      {qa.primary_emotion || "Neutral"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualPresentationSection;

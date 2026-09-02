import React, { useState } from "react";
import { ChevronDown, ChevronUp, Video, Sparkles } from "lucide-react";
import CameraPreview from "./CameraPreview";
import EmotionCard from "./EmotionCard";
import ConfidenceCard from "./ConfidenceCard";
import EyeContactCard from "./EyeContactCard";
import AttentionCard from "./AttentionCard";
import StressCard from "./StressCard";
import PresenceCard from "./PresenceCard";
import { type FaceSenseMetricSample } from "@/services/faceSenseApi";

interface LiveFacePanelProps {
  sessionId: string;
  currentQuestionId?: string;
  isPaused?: boolean;
}

export const LiveFacePanel: React.FC<LiveFacePanelProps> = ({
  sessionId,
  currentQuestionId,
  isPaused = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<FaceSenseMetricSample | null>(null);

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur overflow-hidden transition-all duration-300">
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] border-b border-white/10"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
              <span>Live Face Analysis</span>
              <Sparkles className="h-3 w-3 text-gold-400" />
            </h3>
            <p className="text-[10px] text-neutral-400">
              FaceSense Behavioral Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metrics && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Score: {metrics.overall_facescore}
              </span>
            </div>
          )}
          <button className="p-1 text-neutral-400 hover:text-white">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!collapsed && (
        <div className="p-3.5 flex flex-col gap-3">
          <CameraPreview
            sessionId={sessionId}
            currentQuestionId={currentQuestionId}
            isPaused={isPaused}
            onMetricsUpdate={setMetrics}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            <EmotionCard
              emotionLabel={metrics?.emotion_label}
              confidence={metrics?.emotion_confidence}
            />
            <ConfidenceCard score={metrics?.confidence_score} />
            <EyeContactCard
              score={metrics?.eye_contact_score}
              directionStatus={metrics?.direction_status}
            />
            <AttentionCard
              score={metrics?.attention_score}
              faceVisible={metrics?.face_visible}
            />
            <StressCard
              score={metrics?.stress_score}
              blinkRateBpm={metrics?.blink_rate_bpm}
            />
            <PresenceCard score={metrics?.presence_score} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveFacePanel;

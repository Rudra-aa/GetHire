/**
 * ScoreTrend.tsx
 * ───────────────
 * Pure SVG Score Trend line chart matching reference design.
 * Occupies 4 columns in Row 3.
 */
import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { ChevronDown } from "lucide-react";
import type { EvaluationDetail } from "@/services/evaluationApi";

interface ScoreTrendProps {
  evaluations: EvaluationDetail[];
}

const CHART_W = 340;
const CHART_H = 180;
const PAD_X = 25;
const PAD_Y = 25;

export const ScoreTrend: React.FC<ScoreTrendProps> = ({ evaluations }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(7); // Default Q8 highlighted like reference image

  const scores =
    evaluations.length >= 2
      ? evaluations.map((e) => e.overall_score)
      : [68, 72, 65, 78, 70, 74, 82, 85, 72, 76];

  const minScore = 0;
  const maxScore = 100;
  const range = maxScore - minScore;

  const xStep = (CHART_W - PAD_X * 2) / Math.max(1, scores.length - 1);

  const points = scores.map((s, i) => ({
    x: PAD_X + i * xStep,
    y: PAD_Y + ((maxScore - s) / range) * (CHART_H - PAD_Y * 2),
    score: s,
    label: `Q${i + 1}`,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD =
    `M ${points[0]?.x ?? PAD_X} ${CHART_H - PAD_Y} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1]?.x ?? CHART_W - PAD_X} ${CHART_H - PAD_Y} Z`;

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-gold-400" />
          <h3 className="text-sm font-bold text-white">Score Trend</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] cursor-pointer hover:text-white">
          <span>By Question</span>
          <ChevronDown className="h-3 w-3 text-neutral-400" />
        </div>
      </div>

      {/* SVG Chart */}
      <div className="flex justify-center items-center flex-1 my-auto w-full">
        <svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="overflow-visible">
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39FF88" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#39FF88" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = PAD_Y + ((maxScore - val) / range) * (CHART_H - PAD_Y * 2);
            return (
              <g key={val}>
                <line
                  x1={PAD_X} y1={y} x2={CHART_W - PAD_X} y2={y}
                  stroke="rgba(255,255,255,0.06)" strokeWidth="1"
                />
                <text x={PAD_X - 6} y={y} textAnchor="end" dominantBaseline="middle"
                  fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradient area */}
          <path d={areaD} fill="url(#trendGrad)" />

          {/* Trend line */}
          <path d={pathD} fill="none" stroke="#39FF88" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                className="cursor-pointer"
              >
                <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? "#fff" : "#39FF88"}
                  stroke="#09090B"
                  strokeWidth="2"
                />
                {/* X-axis labels */}
                <text
                  x={p.x}
                  y={CHART_H - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isHovered ? "#39FF88" : "rgba(255,255,255,0.4)"}
                  fontFamily="monospace"
                  fontWeight={isHovered ? "bold" : "normal"}
                >
                  {p.label}
                </text>

                {/* Tooltip Card (matches reference screenshot style) */}
                {isHovered && (
                  <g className="transition-all duration-200">
                    <rect
                      x={p.x - 32}
                      y={p.y - 36}
                      width="64"
                      height="26"
                      rx="6"
                      fill="#12161E"
                      stroke="#39FF88"
                      strokeWidth="1"
                      className="shadow-lg"
                    />
                    <text
                      x={p.x}
                      y={p.y - 24}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#ffffff"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {p.label}
                    </text>
                    <text
                      x={p.x}
                      y={p.y - 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#39FF88"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      Score: {p.score}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </GlassCard>
  );
};

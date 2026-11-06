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
          <span className="h-3 w-1 rounded-full bg-[#1E8C5A]" />
          <h3 className="text-sm font-bold text-[#263D68]">Score Trend</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5A6E8C] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#D0DCE8]/80 cursor-pointer hover:text-[#263D68]">
          <span>By Question</span>
          <ChevronDown className="h-3 w-3 text-[#5A6E8C]" />
        </div>
      </div>

      {/* SVG Chart */}
      <div className="flex justify-center items-center flex-1 my-auto w-full">
        <svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="overflow-visible">
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A8D8C3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A8D8C3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = PAD_Y + ((maxScore - val) / range) * (CHART_H - PAD_Y * 2);
            return (
              <g key={val}>
                <line
                  x1={PAD_X} y1={y} x2={CHART_W - PAD_X} y2={y}
                  stroke="#E4EDF5" strokeWidth="1"
                />
                <text x={PAD_X - 6} y={y} textAnchor="end" dominantBaseline="middle"
                  fontSize="8" fill="#5A6E8C" fontFamily="monospace">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradient area */}
          <path d={areaD} fill="url(#trendGrad)" />

          {/* Trend line */}
          <path d={pathD} fill="none" stroke="#1E8C5A" strokeWidth="2.5" strokeLinejoin="round" />

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
                  fill={isHovered ? "#263D68" : "#1E8C5A"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                {/* X-axis labels */}
                <text
                  x={p.x}
                  y={CHART_H - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isHovered ? "#1E8C5A" : "#5A6E8C"}
                  fontFamily="monospace"
                  fontWeight={isHovered ? "bold" : "normal"}
                >
                  {p.label}
                </text>

                {/* Tooltip Card */}
                {isHovered && (
                  <g className="transition-all duration-200">
                    <rect
                      x={p.x - 32}
                      y={p.y - 36}
                      width="64"
                      height="26"
                      rx="6"
                      fill="#FFFFFF"
                      stroke="#A8D8C3"
                      strokeWidth="1"
                      className="shadow-md"
                    />
                    <text
                      x={p.x}
                      y={p.y - 24}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#263D68"
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
                      fill="#1E8C5A"
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

/**
 * PerformanceRadar.tsx
 * ────────────────────
 * Pure SVG Radar chart in GlassCard matching reference design.
 * Occupies 4 columns in Row 3.
 */
import React from "react";
import { GlassCard } from "./GlassCard";

interface PerformanceRadarProps {
  dimensions: {
    technical_accuracy: number;
    concept_coverage: number;
    problem_solving: number;
    communication: number;
    completeness: number;
  };
}

const labels = [
  { key: "technical_accuracy" as const, label: "Technical\nAccuracy", defaultVal: 78 },
  { key: "concept_coverage" as const, label: "Concept\nCoverage", defaultVal: 64 },
  { key: "problem_solving" as const, label: "Problem\nSolving", defaultVal: 70 },
  { key: "communication" as const, label: "Communication", defaultVal: 82 },
  { key: "completeness" as const, label: "Completeness", defaultVal: 68 },
  { key: "star_structure", label: "STAR\nStructure", defaultVal: 75 },
];

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 80;
const STEPS = 4;

function polarToXY(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

function buildPolygon(values: number[], maxR: number) {
  const step = 360 / values.length;
  return values
    .map((v, i) => {
      const r = (v / 100) * maxR;
      const { x, y } = polarToXY(i * step, r);
      return `${x},${y}`;
    })
    .join(" ");
}

export const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ dimensions }) => {
  const values = labels.map((l) =>
    l.key in dimensions ? dimensions[l.key as keyof typeof dimensions] : l.defaultVal
  );
  const step = 360 / labels.length;

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-[340px]">
      <div className="flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-gold-400" />
        <h3 className="text-sm font-bold text-white">Performance Radar</h3>
      </div>

      <div className="flex justify-center items-center flex-1 my-auto">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Concentric grid rings */}
          {Array.from({ length: STEPS }).map((_, si) => {
            const r = ((si + 1) / STEPS) * RADIUS;
            const gridPoints = labels
              .map((_, i) => {
                const { x, y } = polarToXY(i * step, r);
                return `${x},${y}`;
              })
              .join(" ");
            return (
              <polygon
                key={si}
                points={gridPoints}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines */}
          {labels.map((_, i) => {
            const { x, y } = polarToXY(i * step, RADIUS);
            return (
              <line
                key={i}
                x1={CENTER} y1={CENTER}
                x2={x} y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={buildPolygon(values, RADIUS)}
            fill="rgba(57,255,136,0.15)"
            stroke="#39FF88"
            strokeWidth="2"
          />

          {/* Dots and values */}
          {values.map((v, i) => {
            const r = (v / 100) * RADIUS;
            const { x, y } = polarToXY(i * step, r);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#39FF88" stroke="#09090B" strokeWidth="1.5" />
              </g>
            );
          })}

          {/* Labels */}
          {labels.map((l, i) => {
            const { x, y } = polarToXY(i * step, RADIUS + 24);
            const val = values[i];
            const lines = l.label.split("\n");
            return (
              <g key={i}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.6)"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {lines.map((ln, li) => (
                    <tspan key={li} x={x} dy={li === 0 ? 0 : "1.1em"}>
                      {ln}
                    </tspan>
                  ))}
                </text>
                <text
                  x={x}
                  y={y + (lines.length > 1 ? 14 : 10)}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#39FF88"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </GlassCard>
  );
};

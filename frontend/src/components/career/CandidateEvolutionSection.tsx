import React, { useEffect, useState } from "react";
import { TrendingUp, ArrowUpRight, ChevronRight, Calendar } from "lucide-react";
import { careerApi, type EvolutionTimelineResponse, type EvolutionPoint } from "@/services/careerApi";
import { useNavigate } from "react-router-dom";

export const CandidateEvolutionSection: React.FC = () => {
  const navigate = useNavigate();
  const [evolutionData, setEvolutionData] = useState<EvolutionTimelineResponse | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EvolutionPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvolution = async () => {
      setLoading(true);
      try {
        const res = await careerApi.getEvolutionTimeline();
        setEvolutionData(res);
        if (res.evolution_points && res.evolution_points.length > 0) {
          setSelectedPoint(res.evolution_points[res.evolution_points.length - 1] ?? null);
        }
      } catch (err) {
        console.warn("Failed to load evolution timeline", err);
        setEvolutionData(null);
      } finally {
        setLoading(false);
      }
    };
    void loadEvolution();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono text-neutral-400">
        Loading Candidate Evolution Growth Timeline...
      </div>
    );
  }

  const hasSufficientData = evolutionData?.has_sufficient_history && (evolutionData?.evolution_points?.length || 0) >= 2;

  if (!hasSufficientData) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur flex flex-col gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
                <span>Candidate Evolution Timeline</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono uppercase tracking-wider">
                  Calibration Phase
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Track your complete skill progression curve over time instead of static single snapshots.
              </p>
            </div>
          </div>
        </div>

        <div className="py-12 px-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="max-w-md flex flex-col gap-1">
            <h3 className="text-base font-bold text-white">Historical Curve Calibrating</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Complete at least two interview sessions to unlock Candidate Evolution and track your multi-session performance trajectory.
            </p>
          </div>
          <button
            onClick={() => navigate("/interview")}
            className="px-6 py-2.5 rounded-xl bg-gold-400 text-black font-extrabold text-xs font-display hover:bg-gold-300 transition-all flex items-center gap-1.5 shadow-lg shadow-gold-500/20"
          >
            <span>Launch Interview Session</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const points: EvolutionPoint[] = evolutionData?.evolution_points || [];
  const defaultPoint: EvolutionPoint = {
    month: "Current",
    hirescore: evolutionData?.current_score || 0,
    technical: 0,
    integrity: 0,
    readiness_pct: 0,
  };
  const activePoint: EvolutionPoint = selectedPoint || points[points.length - 1] || points[0] || defaultPoint;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
              <span>Candidate Evolution Timeline</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gold-400/10 text-gold-300 border border-gold-400/30 text-[10px] font-mono uppercase tracking-wider">
                Flagship Trajectory
              </span>
            </h2>
            <p className="text-xs text-neutral-400 font-sans">
              Track your complete skill progression curve over time instead of static single snapshots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4" />
            <span>+{evolutionData?.total_growth_points ?? 0} Points Growth</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 flex flex-col gap-4 p-5 rounded-2xl bg-black/40 border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-2">
            <span>Historical Progress Trajectory</span>
            <span className="text-gold-400">{evolutionData?.growth_trajectory || "High Growth Trajectory"}</span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-6 pb-2 px-2 h-48 border-b border-white/10">
            {points.map((pt, idx) => {
              const isSelected = activePoint.month === pt.month;
              const heightPct = Math.max(25, (pt.hirescore / 100) * 100);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPoint(pt)}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <span className={`text-xs font-mono font-bold transition-all ${isSelected ? "text-gold-400 scale-110" : "text-neutral-400 group-hover:text-white"}`}>
                    {pt.hirescore}
                  </span>
                  <div className="w-full max-w-[42px] bg-white/5 rounded-t-xl h-36 flex items-end p-1 relative overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isSelected
                          ? "bg-gradient-to-t from-gold-500 to-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                          : "bg-white/20 group-hover:bg-white/40"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-mono transition-all ${isSelected ? "text-gold-300 font-bold" : "text-neutral-500"}`}>
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4 h-full">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-wider mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{activePoint.month} Snapshot</span>
            </div>
            <div className="text-3xl font-black text-white font-display">
              {activePoint.hirescore} <span className="text-sm font-mono text-neutral-400">/ 100</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Readiness Score: {activePoint.readiness_pct}% • Technical Accuracy: {activePoint.technical}%
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                if (activePoint.session_id) {
                  navigate(`/evaluations/${activePoint.session_id}`);
                } else {
                  navigate("/evaluation");
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gold-400/10 hover:bg-gold-400/20 border border-gold-400/30 text-gold-300 text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5"
            >
              <span>Inspect Full {activePoint.month} Report</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateEvolutionSection;

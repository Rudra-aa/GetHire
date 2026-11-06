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
      <div className="p-6 rounded-2xl bg-white border border-[#D0DCE8] text-xs font-mono text-[#5A6E8C]">
        Loading Candidate Evolution Growth Timeline...
      </div>
    );
  }

  const hasSufficientData = evolutionData?.has_sufficient_history && (evolutionData?.evolution_points?.length || 0) >= 2;

  if (!hasSufficientData) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#B9D9EC]/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#263D68] font-display flex items-center gap-2">
                <span>Candidate Evolution Timeline</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#B9D9EC]/40 text-[#2B7FAD] border border-[#B9D9EC]/60 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Calibration Phase
                </span>
              </h2>
              <p className="text-xs text-[#5A6E8C] font-sans">
                Track your complete skill progression curve over time instead of static single snapshots.
              </p>
            </div>
          </div>
        </div>

        <div className="py-12 px-6 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-glass flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A] flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="max-w-md flex flex-col gap-1">
            <h3 className="text-base font-bold text-[#263D68]">Historical Curve Calibrating</h3>
            <p className="text-xs text-[#5A6E8C] leading-relaxed">
              Complete at least two interview sessions to unlock Candidate Evolution and track your multi-session performance trajectory.
            </p>
          </div>
          <button
            onClick={() => navigate("/interview")}
            className="px-6 py-2.5 rounded-xl bg-[#A8D8C3] hover:bg-[#97ccb6] text-[#1E4D38] border border-[#72C9AD] font-bold text-xs font-sans transition-all flex items-center gap-1.5 shadow-sm"
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
    <div className="p-6 sm:p-8 rounded-3xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 shadow-glass flex flex-col gap-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#B9D9EC]/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/50 text-[#1E8C5A]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#263D68] font-display flex items-center gap-2">
              <span>Candidate Evolution Timeline</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A8D8C3]/20 text-[#1E8C5A] border border-[#A8D8C3]/50 text-[10px] font-mono uppercase tracking-wider font-semibold">
                Flagship Trajectory
              </span>
            </h2>
            <p className="text-xs text-[#5A6E8C] font-sans">
              Track your complete skill progression curve over time instead of static single snapshots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="px-4 py-2 rounded-xl bg-white/85 border border-[#A8D8C3] text-[#1E8C5A] text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <ArrowUpRight className="h-4 w-4" />
            <span>+{evolutionData?.total_growth_points ?? 0} Points Growth</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 flex flex-col gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-glass">
          <div className="flex items-center justify-between text-xs font-mono text-[#5A6E8C] pb-2">
            <span>Historical Progress Trajectory</span>
            <span className="text-[#1E8C5A] font-bold">{evolutionData?.growth_trajectory || "High Growth Trajectory"}</span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-6 pb-2 px-2 h-48 border-b border-[#E4EDF5]">
            {points.map((pt, idx) => {
              const isSelected = activePoint.month === pt.month;
              const heightPct = Math.max(25, (pt.hirescore / 100) * 100);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPoint(pt)}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <span className={`text-xs font-mono font-bold transition-all ${isSelected ? "text-[#1E8C5A] scale-110" : "text-[#5A6E8C] group-hover:text-[#263D68]"}`}>
                    {pt.hirescore}
                  </span>
                  <div className="w-full max-w-[42px] bg-[#E4EDF5] rounded-t-xl h-36 flex items-end p-1 relative overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isSelected
                          ? "bg-[#1E8C5A] shadow-sm"
                          : "bg-[#B9D9EC] group-hover:bg-[#A8D8C3]"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-mono transition-all ${isSelected ? "text-[#1E8C5A] font-bold" : "text-[#8FA3BC]"}`}>
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-glass flex flex-col justify-between gap-4 h-full">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#1E8C5A] font-bold uppercase tracking-wider mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{activePoint.month} Snapshot</span>
            </div>
            <div className="text-3xl font-black text-[#263D68] font-display">
              {activePoint.hirescore} <span className="text-sm font-mono text-[#5A6E8C]">/ 100</span>
            </div>
            <p className="text-xs text-[#5A6E8C] mt-1">
              Readiness Score: {activePoint.readiness_pct}% • Technical Accuracy: {activePoint.technical}%
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#E4EDF5]">
            <button
              onClick={() => {
                if (activePoint.session_id) {
                  navigate(`/evaluations/${activePoint.session_id}`);
                } else {
                  navigate("/evaluation");
                }
              }}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F0FAF5] border border-[#D0DCE8] hover:border-[#A8D8C3] text-[#263D68] hover:text-[#1E8C5A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
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

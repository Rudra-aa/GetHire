import React from "react";
import { Award, CheckSquare, Video, Share2, ArrowUpRight } from "lucide-react";

interface ExecutiveMetricDeckProps {
  hireScore?: number | undefined;
  assessmentScore?: number | undefined;
  interviewCompletedCount?: number | undefined;
  recruiterToken?: string | undefined;
  recruiterAccessCount?: number | undefined;
}

export const ExecutiveMetricDeck: React.FC<ExecutiveMetricDeckProps> = ({
  hireScore,
  assessmentScore,
  interviewCompletedCount = 0,
  recruiterToken,
  recruiterAccessCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Current HireScore (Subtle Powder Blue Section) */}
      <div className="p-5 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#A8D8C3]/70 flex flex-col justify-between gap-3 shadow-glass transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#5A6E8C] uppercase">Current HireScore</span>
          <div className="p-2 rounded-xl bg-[#A8D8C3]/20 border border-[#A8D8C3]/40 text-[#1E8C5A]">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-[#263D68] font-display">
            {hireScore !== undefined ? (
              <span className="text-[#1E8C5A]">{hireScore} <span className="text-xs font-mono text-[#5A6E8C]">/ 100</span></span>
            ) : (
              <span className="text-xs font-mono text-[#8FA3BC]">Pending Evaluation</span>
            )}
          </div>
          <p className="text-[11px] text-[#5A6E8C] font-sans mt-1">
            {hireScore !== undefined ? "Multi-engine composite rating" : "Complete assessment & interview to unlock"}
          </p>
        </div>
      </div>

      {/* Metric 2: Latest Assessment Summary (Subtle Powder Blue Section) */}
      <div className="p-5 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#B9D9EC] flex flex-col justify-between gap-3 shadow-glass transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#5A6E8C] uppercase">Assessment Profile</span>
          <div className="p-2 rounded-xl bg-[#B9D9EC]/40 border border-[#B9D9EC]/60 text-[#2B7FAD]">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-[#263D68] font-display">
            {assessmentScore !== undefined ? (
              <span className="text-[#2B7FAD]">{assessmentScore}%</span>
            ) : (
              <span className="text-xs font-mono text-[#8FA3BC]">Not Completed</span>
            )}
          </div>
          <p className="text-[11px] text-[#5A6E8C] font-sans mt-1">
            {assessmentScore !== undefined ? "Knowledge Profile Generated" : "Adaptive 20-question test"}
          </p>
        </div>
      </div>

      {/* Metric 3: Latest Interview Summary (Subtle Powder Blue Section) */}
      <div className="p-5 rounded-2xl bg-[#EEF6FB]/80 backdrop-blur-md border border-[#B9D9EC]/50 hover:bg-[#EEF6FB]/95 hover:border-[#A8D8C3]/70 flex flex-col justify-between gap-3 shadow-glass transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#5A6E8C] uppercase">Interviews</span>
          <div className="p-2 rounded-xl bg-[#A8D8C3]/25 border border-[#A8D8C3]/50 text-[#1E8C5A]">
            <Video className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-[#263D68] font-display">
            <span className="text-[#1E8C5A]">{interviewCompletedCount}</span> <span className="text-xs font-mono text-[#5A6E8C]">sessions</span>
          </div>
          <p className="text-[11px] text-[#5A6E8C] font-sans mt-1">
            Conversational telemetry evaluated
          </p>
        </div>
      </div>

      {/* Metric 4: Recruiter Share Link Status (Subtle Powder Blue Section) */}
      <div className="p-5 rounded-2xl bg-[#EEF6FB]/85 backdrop-blur-md border border-[#B9D9EC]/60 hover:bg-[#EEF6FB]/95 hover:border-[#DCD5F0]/80 flex flex-col justify-between gap-3 shadow-glass transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#5A6E8C] uppercase">Recruiter Portfolio</span>
          <div className="p-2 rounded-xl bg-[#DCD5F0]/35 border border-[#DCD5F0]/50 text-[#6E5EBB]">
            <Share2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-[#263D68] font-display flex items-center gap-1.5">
            {recruiterToken ? (
              <span className="text-[#6E5EBB] flex items-center gap-1">
                Active <ArrowUpRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="text-xs font-mono text-[#8FA3BC]">Not Generated</span>
            )}
          </div>
          <p className="text-[11px] text-[#5A6E8C] font-sans mt-1">
            {recruiterToken ? `${recruiterAccessCount} recruiter views` : "Share link generator ready"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveMetricDeck;

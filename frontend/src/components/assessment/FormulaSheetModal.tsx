import React from "react";
import { BookOpen, X } from "lucide-react";

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="max-w-xl w-full p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_24px_48px_-12px_rgba(38,61,104,0.15)] flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EDF5]">
          <div className="flex items-center gap-2 text-[#263D68] font-display text-sm font-bold">
            <BookOpen className="h-4 w-4 text-[#2B7FAD]" />
            <span>Assessment Reference & Formula Sheet</span>
          </div>
          <button onClick={onClose} className="p-1 text-[#5A6E8C] hover:text-[#263D68]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 font-mono text-xs text-[#263D68]">
          {/* Section 1: Time Complexities */}
          <div className="p-3.5 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-2">
            <span className="text-[#2B7FAD] font-bold font-display">1. Common Time Complexities</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5A6E8C]">
              <div>• Binary Search: O(log n)</div>
              <div>• QuickSort / MergeSort: O(n log n)</div>
              <div>• Hash Table Lookup: O(1) avg</div>
              <div>• DFS / BFS Graph: O(V + E)</div>
            </div>
          </div>

          {/* Section 2: System Design CAP Theorem & PACELC */}
          <div className="p-3.5 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-2">
            <span className="text-[#2B7FAD] font-bold font-display">2. System Architecture Trade-offs</span>
            <p className="text-[11px] text-[#5A6E8C] leading-relaxed">
              CAP Theorem: Consistency, Availability, Partition Tolerance (Choose 2). PACELC: If Partition, choose Availability or Consistency; Else, choose Latency or Consistency.
            </p>
          </div>

          {/* Section 3: SQL Syntax Quick Ref */}
          <div className="p-3.5 rounded-xl bg-[#FAFBFC]/80 backdrop-blur-sm border border-[#D0DCE8]/80 flex flex-col gap-2">
            <span className="text-[#2B7FAD] font-bold font-display">3. SQL Analytical Functions</span>
            <pre className="text-[10px] text-[#1E8C5A] bg-[#F0FAF5] border border-[#A8D8C3]/50 p-2 rounded-xl">
              {`SELECT name, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as rank
FROM employees WHERE status = 'ACTIVE';`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaSheetModal;

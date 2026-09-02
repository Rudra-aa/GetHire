import React from "react";
import { BookOpen, X } from "lucide-react";

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="max-w-xl w-full p-6 rounded-3xl bg-[#0f121d] border border-white/20 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-cyan-400 font-display text-sm font-bold">
            <BookOpen className="h-4 w-4" />
            <span>Assessment Reference & Formula Sheet</span>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 font-mono text-xs text-neutral-300">
          {/* Section 1: Time Complexities */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2">
            <span className="text-cyan-300 font-bold font-display">1. Common Time Complexities</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>• Binary Search: O(log n)</div>
              <div>• QuickSort / MergeSort: O(n log n)</div>
              <div>• Hash Table Lookup: O(1) avg</div>
              <div>• DFS / BFS Graph: O(V + E)</div>
            </div>
          </div>

          {/* Section 2: System Design CAP Theorem & PACELC */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2">
            <span className="text-cyan-300 font-bold font-display">2. System Architecture Trade-offs</span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              CAP Theorem: Consistency, Availability, Partition Tolerance (Choose 2). PACELC: If Partition, choose Availability or Consistency; Else, choose Latency or Consistency.
            </p>
          </div>

          {/* Section 3: SQL Syntax Quick Ref */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2">
            <span className="text-cyan-300 font-bold font-display">3. SQL Analytical Functions</span>
            <pre className="text-[10px] text-emerald-300 bg-black/60 p-2 rounded-xl">
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

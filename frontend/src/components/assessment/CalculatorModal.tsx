import React, { useState } from "react";
import { Calculator as CalcIcon, X } from "lucide-react";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState("0");

  if (!isOpen) return null;

  const handleChar = (char: string) => {
    if (display === "0" && char !== ".") {
      setDisplay(char);
    } else {
      setDisplay(display + char);
    }
  };

  const handleClear = () => setDisplay("0");

  const handleEvaluate = () => {
    try {
      // Safe math evaluation
      const sanitized = display.replace(/[^0-9+\-*/.]/g, "");
      const res = Function(`"use strict"; return (${sanitized})`)();
      setDisplay(String(res));
    } catch {
      setDisplay("Error");
    }
  };

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-80 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#D0DCE8]/80 shadow-[0_24px_48px_-12px_rgba(38,61,104,0.15)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E4EDF5]">
          <div className="flex items-center gap-2 text-[#263D68] font-display text-sm font-bold">
            <CalcIcon className="h-4 w-4 text-[#1E8C5A]" />
            <span>Assessment Calculator</span>
          </div>
          <button onClick={onClose} className="p-1 text-[#5A6E8C] hover:text-[#263D68]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-3.5 rounded-xl bg-[#FAFBFC] border border-[#D0DCE8] text-right text-xl font-mono text-[#263D68] font-bold overflow-x-auto">
          {display}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleClear}
            className="col-span-4 p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold hover:bg-rose-100 transition-colors"
          >
            Clear (C)
          </button>

          {buttons.map((row, rIdx) =>
            row.map((btn, cIdx) => (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => (btn === "=" ? handleEvaluate() : handleChar(btn))}
                className={`p-3 rounded-xl border text-sm font-mono font-bold transition-all cursor-pointer ${
                  btn === "="
                    ? "bg-[#A8D8C3] text-[#1E4D38] border-[#72C9AD] shadow-sm"
                    : ["+", "-", "*", "/"].includes(btn)
                    ? "bg-[#B9D9EC]/30 border-[#B9D9EC] text-[#2B7FAD]"
                    : "bg-[#FAFBFC] border-[#D0DCE8] text-[#263D68] hover:bg-[#F0F5F9]"
                }`}
              >
                {btn}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-80 p-5 rounded-3xl bg-[#0f121d] border border-white/20 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-cyan-400 font-display text-sm font-bold">
            <CalcIcon className="h-4 w-4" />
            <span>Assessment Calculator</span>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-3.5 rounded-2xl bg-black/80 border border-white/10 text-right text-xl font-mono text-cyan-300 font-bold overflow-x-auto">
          {display}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleClear}
            className="col-span-4 p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold hover:bg-rose-500/30"
          >
            Clear (C)
          </button>

          {buttons.map((row, rIdx) =>
            row.map((btn, cIdx) => (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => (btn === "=" ? handleEvaluate() : handleChar(btn))}
                className={`p-3 rounded-xl border text-sm font-mono font-bold transition-all ${
                  btn === "="
                    ? "bg-cyan-400 text-black border-cyan-400"
                    : ["+", "-", "*", "/"].includes(btn)
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : "bg-white/[0.04] border-white/10 text-white hover:bg-white/10"
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

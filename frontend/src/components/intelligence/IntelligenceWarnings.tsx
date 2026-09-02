import React, { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

interface IntelligenceWarningsProps {
  warningMessage?: string | null | undefined;
  onClearWarning?: (() => void) | undefined;
}

export const IntelligenceWarnings: React.FC<IntelligenceWarningsProps> = ({
  warningMessage,
  onClearWarning,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!warningMessage) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClearWarning) onClearWarning();
    }, 6000);

    return () => clearTimeout(timer);
  }, [warningMessage, onClearWarning]);

  if (!visible || !warningMessage) {
    return null;
  }

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md p-4 rounded-xl bg-neutral-900/95 border border-amber-500/40 text-amber-300 shadow-2xl backdrop-blur flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold font-display uppercase tracking-wider text-amber-200">
          Interview Integrity Event
        </h4>
        <p className="text-xs text-neutral-300 mt-1 font-sans">{warningMessage}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          if (onClearWarning) onClearWarning();
        }}
        className="p-1 text-neutral-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default IntelligenceWarnings;

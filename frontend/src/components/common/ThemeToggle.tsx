import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = "" }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
          isDark
            ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-amber-300 hover:text-amber-200"
            : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className={`relative p-1 rounded-2xl flex items-center justify-between border cursor-pointer select-none transition-all duration-200 ${
        isDark
          ? "bg-[#111217] border-white/10 hover:border-white/20"
          : "bg-slate-100 border-slate-300 hover:border-slate-400 shadow-sm"
      } ${className}`}
      aria-label={`Toggle theme (currently ${theme})`}
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
          isDark
            ? "bg-white/10 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-cyan-400" />
        <span>Dark</span>
      </div>

      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
          !isDark
            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
            : "text-neutral-400 hover:text-white"
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span>Light</span>
      </div>
    </div>
  );
};

export default ThemeToggle;

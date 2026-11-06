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
            ? "bg-[#F0F5F9] hover:bg-[#E4EDF5] border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68]"
            : "bg-[#F0F5F9] hover:bg-[#E4EDF5] border-[#D0DCE8] text-[#5A6E8C] hover:text-[#263D68]"
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
      className={`relative p-1 rounded-2xl flex items-center justify-between border cursor-pointer select-none transition-all duration-200 bg-white/80 backdrop-blur-sm border-[#D0DCE8]/80 hover:border-[#B9D9EC] ${className}`}
      aria-label={`Toggle theme (currently ${theme})`}
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
          isDark
            ? "bg-white border border-[#D0DCE8] text-[#263D68] shadow-sm"
            : "text-[#5A6E8C] hover:text-[#263D68]"
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-[#8FA3BC]" />
        <span>Dark</span>
      </div>

      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
          !isDark
            ? "bg-white border border-[#D0DCE8] text-[#263D68] shadow-sm"
            : "text-[#5A6E8C] hover:text-[#263D68]"
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-[#D4921A]" />
        <span>Light</span>
      </div>
    </div>
  );
};

export default ThemeToggle;

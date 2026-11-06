import { create } from "zustand";

export type ThemeMode = "dark" | "light";

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = "gethire_theme_preference";

export const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
    body.classList.remove("dark");
    body.classList.add("light");
    body.setAttribute("data-theme", "light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    body.classList.remove("light");
    body.classList.add("dark");
    body.setAttribute("data-theme", "dark");
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    applyThemeToDOM(saved);
    return saved;
  }
  applyThemeToDOM("light");
  return "light";
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const nextTheme: ThemeMode = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      }
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    });
  },

  setTheme: (nextTheme: ThemeMode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    }
    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme });
  },
}));

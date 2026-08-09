/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Brand Colours ──────────────────────────────────────────────────
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dce6ff",
          200: "#b9cdff",
          300: "#85a9ff",
          400: "#4a7aff",
          500: "#1a4dff",  // primary
          600: "#0032e6",
          700: "#0027b8",
          800: "#002096",
          900: "#001a7a",
          950: "#000e52",
        },
        surface: {
          50:  "#f8f9fc",
          100: "#f1f3f9",
          200: "#e2e6f0",
          300: "#cdd4e6",
          800: "#1e2235",
          900: "#131728",
          950: "#0a0d1a",  // darkest background
        },
      },

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      // ── Animation ──────────────────────────────────────────────────────
      animation: {
        "fade-in":  "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

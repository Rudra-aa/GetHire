/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ── Color System — Graphite / Ivory / Champagne Gold / Emerald ─────────
      colors: {
        // Background tones (warm deep charcoal, not pure black)
        bg: {
          primary:   "#0A0A0B",  // warm off-black
          secondary: "#111113",  // graphite dark
          tertiary:  "#17171A",  // raised graphite
          elevated:  "#1E1E22",  // surface elevated
        },
        // Graphite surface shades
        graphite: {
          50:  "#F5F5F4",
          100: "#E8E8E6",
          200: "#D0D0CC",
          300: "#B4B4AE",
          400: "#8C8C86",
          500: "#6A6A64",
          600: "#4E4E4A",
          700: "#363632",
          800: "#252522",
          900: "#171714",
          950: "#0A0A0B",
        },
        // Ivory — warm white primary text
        ivory: {
          50:  "#FDFCF9",
          100: "#FAF8F3",
          200: "#F5F1E8",
          300: "#EDE8D8",
          400: "#DDD6C0",
          500: "#C8BFA3",
          600: "#AFA48A",
        },
        // Champagne Gold — primary accent (warm, editorial)
        gold: {
          50:  "#FDFAF0",
          100: "#FAF3D8",
          200: "#F5E4A8",
          300: "#EDD07A",
          400: "#E2B84A",  // primary gold
          500: "#C99B2E",  // rich gold
          600: "#A67D20",
          700: "#7D5C14",
          800: "#5A4010",
          glow: "#E2B84A",
        },
        // Emerald — signature AI/FaceSense accent (vivid, exclusive)
        emerald: {
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          glow: "#34D399",
        },
        // Neutral scale
        neutral: {
          50:  "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#0A0A0B",
        },
        // Glass surfaces
        glass: {
          white:   "rgba(255, 255, 255, 0.04)",
          border:  "rgba(255, 255, 255, 0.09)",
          hover:   "rgba(255, 255, 255, 0.07)",
          gold:    "rgba(226, 184, 74, 0.08)",
          emerald: "rgba(52, 211, 153, 0.08)",
        },
        // Status
        success: "#10B981",
        warning: "#E2B84A",
        danger:  "#EF4444",
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "hero":    ["clamp(3.5rem, 6.5vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display": ["clamp(2.5rem, 4.5vw, 3.75rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "heading": ["clamp(1.75rem, 3vw, 2.25rem)",   { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "title":   ["clamp(1.15rem, 1.8vw, 1.35rem)", { lineHeight: "1.35", letterSpacing: "-0.015em" }],
        "body-lg": ["1.125rem",                       { lineHeight: "1.75" }],
        "body":    ["1rem",                           { lineHeight: "1.7" }],
        "small":   ["0.875rem",                       { lineHeight: "1.6" }],
        "xs":      ["0.75rem",                        { lineHeight: "1.5" }],
        "label":   ["0.6875rem",                      { lineHeight: "1", letterSpacing: "0.12em" }],
      },

      // ── Shadows & Glows ────────────────────────────────────────────────────
      boxShadow: {
        "glass-capsule": "0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.10)",
        "glass-card":    "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
        "glass-deep":    "0 24px 64px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.4) inset",
        "glow-gold":     "0 0 30px rgba(226, 184, 74, 0.20), 0 0 60px rgba(226, 184, 74, 0.08)",
        "glow-emerald":  "0 0 30px rgba(52, 211, 153, 0.25), 0 0 60px rgba(16, 185, 129, 0.10)",
        "glow-warm":     "0 0 40px rgba(226, 184, 74, 0.15), 0 0 80px rgba(201, 155, 46, 0.06)",
        "button-gold":   "0 4px 20px rgba(226, 184, 74, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.20)",
      },

      // ── Background Gradients ───────────────────────────────────────────────
      backgroundImage: {
        "gradient-hero":    "radial-gradient(ellipse 70% 60% at 55% 45%, rgba(226, 184, 74, 0.05) 0%, rgba(52, 211, 153, 0.03) 45%, transparent 70%)",
        "gradient-gold":    "linear-gradient(135deg, #E2B84A 0%, #C99B2E 50%, #A67D20 100%)",
        "gradient-warm":    "linear-gradient(135deg, #EDD07A 0%, #E2B84A 50%, #C99B2E 100%)",
        "gradient-emerald": "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
        "gradient-section-dark": "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(226,184,74,0.04) 0%, transparent 70%)",
      },

      // ── Transition Curves ──────────────────────────────────────────────────
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

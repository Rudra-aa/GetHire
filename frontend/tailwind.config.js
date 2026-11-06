/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Core Brand Palette ──────────────────────────────────────────────
        brand: {
          blue:     "#B9D9EC",   // Powder Blue — secondary bg, accents
          emerald:  "#A8D8C3",   // Soft Emerald — primary interactive
          lavender: "#DCD5F0",   // Light Lavender — secondary accents
          deep:     "#263D68",   // Deep Blue — text, strong contrast
          "soft-white": "#FAFBFC", // Page background
        },

        // ── Background tones ────────────────────────────────────────────────
        bg: {
          primary:   "#FAFBFC",   // page canvas
          secondary: "#FFFFFF",   // card surfaces
          tertiary:  "#F0F5F9",   // slightly sunken panels
          elevated:  "#FFFFFF",   // modals, popovers
        },

        // ── Semantic text ───────────────────────────────────────────────────
        content: {
          primary:  "#263D68",   // headings, body
          secondary: "#5A6E8C",  // muted / secondary text
          tertiary:  "#8FA3BC",  // placeholder, disabled
          inverse:   "#FFFFFF",  // text on colored surfaces
        },

        // ── Surfaces & borders ──────────────────────────────────────────────
        surface: {
          DEFAULT: "#FFFFFF",
          raised:  "#F7F9FB",
          border:  "#D0DCE8",
          "border-soft": "#E4EDF5",
        },

        // ── Accent palette ──────────────────────────────────────────────────
        powder: {
          tint: "#EEF6FB",
          50:  "#F0F8FD",
          100: "#DBF0F9",
          200: "#B9D9EC",   // primary
          300: "#93C5DF",
          400: "#6AAFD2",
          500: "#4598C4",
          600: "#2B7FAD",
          700: "#1A6391",
        },
        emerald: {
          50:  "#F0FAF5",
          100: "#D6F2E6",
          200: "#A8D8C3",   // primary interactive
          300: "#77C4A2",
          400: "#4AAF80",
          500: "#2DA870",   // success
          600: "#1E8C5A",
          700: "#156E45",
        },
        lavender: {
          50:  "#F7F5FD",
          100: "#EEEBF9",
          200: "#DCD5F0",   // primary lavender
          300: "#C4B9E7",
          400: "#A99BDB",
          500: "#8B7CCC",
          600: "#6E5EBB",
          700: "#5245A4",
        },
        slate: {
          50:  "#F8FAFB",
          100: "#EEF2F6",
          200: "#D0DCE8",
          300: "#B4C6D6",
          400: "#8FA3BC",
          500: "#5A6E8C",
          600: "#3D5370",
          700: "#263D68",
          800: "#1A2D52",
          900: "#0F1D38",
        },

        // ── Status colors ───────────────────────────────────────────────────
        success:  "#2DA870",
        warning:  "#D4921A",
        danger:   "#E05C5C",
        info:     "#2B7FAD",
      },

      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "hero":    ["clamp(3rem, 5.5vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display": ["clamp(2rem, 4vw, 3rem)",      { lineHeight: "1.1",  letterSpacing: "-0.025em" }],
        "heading": ["clamp(1.5rem, 2.5vw, 2rem)",  { lineHeight: "1.2",  letterSpacing: "-0.02em" }],
        "title":   ["clamp(1.1rem, 1.5vw, 1.25rem)", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75" }],
        "body":    ["1rem",     { lineHeight: "1.7"  }],
        "small":   ["0.875rem", { lineHeight: "1.6"  }],
        "xs":      ["0.75rem",  { lineHeight: "1.5"  }],
        "label":   ["0.6875rem",{ lineHeight: "1",   letterSpacing: "0.1em" }],
      },

      boxShadow: {
        "card":       "0 1px 3px rgba(38,61,104,0.06), 0 4px 12px rgba(38,61,104,0.04)",
        "card-hover": "0 4px 16px rgba(38,61,104,0.10), 0 1px 4px rgba(38,61,104,0.06)",
        "card-raised":"0 8px 24px rgba(38,61,104,0.10), 0 2px 6px rgba(38,61,104,0.06)",
        "glass":      "0 4px 20px -2px rgba(38,61,104,0.05), 0 2px 6px -1px rgba(38,61,104,0.02), inset 0 1px 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(208,220,232,0.35)",
        "glass-hover":"0 12px 32px -4px rgba(38,61,104,0.08), 0 4px 12px -2px rgba(38,61,104,0.03), inset 0 1px 2px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(168,216,195,0.40)",
        "glass-modal":"0 24px 56px -12px rgba(38,61,104,0.14), 0 8px 24px -4px rgba(38,61,104,0.06), inset 0 1.5px 2px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(208,220,232,0.40)",
        "glass-dropdown":"0 12px 32px -4px rgba(38,61,104,0.09), inset 0 1px 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(208,220,232,0.30)",
        "nav":        "0 1px 0 #D0DCE8, 0 2px 8px rgba(38,61,104,0.04)",
        "sidebar":    "1px 0 0 #D0DCE8",
        "btn-primary":"0 2px 8px rgba(168,216,195,0.40)",
        "btn-primary-hover": "0 4px 16px rgba(168,216,195,0.55)",
        "modal":      "0 20px 60px rgba(38,61,104,0.14), 0 4px 16px rgba(38,61,104,0.08)",
        "input-focus":"0 0 0 3px rgba(168,216,195,0.35)",
        "input-error":"0 0 0 3px rgba(224,92,92,0.20)",
      },

      backgroundImage: {
        "gradient-brand":   "linear-gradient(135deg, #B9D9EC 0%, #A8D8C3 100%)",
        "gradient-soft":    "linear-gradient(135deg, #DCD5F0 0%, #B9D9EC 100%)",
        "gradient-page":    "linear-gradient(180deg, #F5F9FB 0%, #F3F7FA 35%, #F6F4FA 70%, #F2F8F5 100%)",
        "ambient-canvas":   "radial-gradient(ellipse 65% 50% at 5% 10%, rgba(185, 217, 236, 0.40) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 95% 15%, rgba(168, 216, 195, 0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 50% 50%, rgba(220, 213, 240, 0.32) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 10% 90%, rgba(168, 216, 195, 0.30) 0%, transparent 60%), radial-gradient(ellipse 65% 55% at 90% 85%, rgba(185, 217, 236, 0.38) 0%, transparent 60%), linear-gradient(180deg, #F5F9FB 0%, #F3F7FA 35%, #F6F4FA 70%, #F2F8F5 100%)",
        "gradient-hero":    "radial-gradient(ellipse 70% 60% at 60% 40%, rgba(185,217,236,0.30) 0%, rgba(168,216,195,0.18) 50%, transparent 80%)",
        "gradient-section": "linear-gradient(180deg, #F4F8FA 0%, #EFF5F9 100%)",
        "gradient-btn":     "linear-gradient(135deg, #A8D8C3 0%, #77C4A2 100%)",
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

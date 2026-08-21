import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0e0b08",
          900: "#16120e",
          800: "#1f1a14",
          700: "#2a2118",
          600: "#3d3020",
          500: "#5a4535",
        },
        gold: {
          200: "#f7e0a0",
          300: "#f5d080",
          400: "#e8a838",
          500: "#c4872c",
          600: "#9d6820",
        },
        sage: {
          300: "#c4d9c4",
          400: "#a3c4a3",
          500: "#7ea87e",
          600: "#5a8a5a",
        },
        clay: {
          300: "#e8a890",
          400: "#d4886a",
          500: "#c96442",
          600: "#a84e30",
        },
        parchment: {
          50:  "#fdfaf5",
          100: "#fdf6e3",
          200: "#f0e4c8",
          300: "#ddd0b0",
          400: "#c9b080",
          500: "#a89070",
          600: "#7a6548",
          700: "#5a4830",
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        sans:    ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "float":       "float 7s ease-in-out infinite",
        "float-slow":  "float 11s ease-in-out infinite",
        "wave":        "wave 1.5s ease-in-out infinite",
        "fade-up":     "fadeUp 0.7s ease-out forwards",
        "draw-line":   "drawLine 0.9s ease-out forwards",
        "shimmer":     "shimmer 2.4s linear infinite",
        "spin-slow":   "spin 12s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1.5deg)" },
          "50%":       { transform: "translateY(-14px) rotate(0.5deg)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%":       { transform: "scaleY(1.5)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drawLine: {
          "0%":   { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0% 0 0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

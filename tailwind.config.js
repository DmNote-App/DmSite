/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'viewer': '950px', // Custom breakpoint for key viewer visibility
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      colors: {
        primary: "#1A191E",
        button: {
          primary: "#000000",
          hover: "#1F1F23",
          active: "#2A2A30",
        },
        // v-archive-recap-2025 Grey Palette
        grey: {
          50: "rgb(var(--grey-50) / <alpha-value>)",
          100: "rgb(var(--grey-100) / <alpha-value>)",
          200: "rgb(var(--grey-200) / <alpha-value>)",
          300: "rgb(var(--grey-300) / <alpha-value>)",
          400: "rgb(var(--grey-400) / <alpha-value>)",
          500: "rgb(var(--grey-500) / <alpha-value>)",
          600: "rgb(var(--grey-600) / <alpha-value>)",
          700: "rgb(var(--grey-700) / <alpha-value>)",
          800: "rgb(var(--grey-800) / <alpha-value>)",
          900: "rgb(var(--grey-900) / <alpha-value>)",
        },
        // Semantic Colors
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          strong: "rgb(var(--brand-strong) / <alpha-value>)",
          light: "rgb(var(--brand-light) / <alpha-value>)",
          // Legacy palette (for docs compatibility)
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
        accent: {
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgb(var(--surface) / 0.85), rgb(var(--surface) / 0.35))",
        "hero-blob": `
          radial-gradient(50vw 50vw at 10% 10%, rgb(var(--hero-blob-a) / var(--hero-blob-opacity)), transparent 70%),
          radial-gradient(40vw 40vw at 90% 30%, rgb(var(--hero-blob-b) / var(--hero-blob-opacity)), transparent 70%)
        `,
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

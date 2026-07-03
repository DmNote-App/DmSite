/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      colors: {
        // Grey Palette
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
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
        accent: {
          500: "#826AED",
        },
      },
    },
  },
  plugins: [],
};

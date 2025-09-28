import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Expressive Color Palette
        primary: {
          50: "#e8f5e8",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50", // Main academic green
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
          950: "#0d3e14",
        },
        secondary: {
          50: "#e3f2fd",
          100: "#bbdefb",
          200: "#90caf9",
          300: "#64b5f6",
          400: "#42a5f5",
          500: "#2196f3", // Main academic blue
          600: "#1e88e5",
          700: "#1976d2",
          800: "#1565c0",
          900: "#0d47a1",
          950: "#0a2e6b",
        },
        // Material You dynamic colors
        surface: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
          950: "#0a0a0a",
        },
        // Expressive accent colors
        accent: {
          orange: "#ff9800",
          purple: "#9c27b0",
          pink: "#e91e63",
          amber: "#ffc107",
          teal: "#009688",
        },
        // Map CSS variables to Tailwind color utilities
        // Enables usage like `bg-background` and `text-on-background`
        background: "var(--color-background)",
        "on-background": "var(--color-on-background)",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "monospace"],
        display: ["Inter", "Roboto", "sans-serif"], // For expressive typography
      },
      fontSize: {
        // Material 3 Type Scale
        "display-large": [
          "3.5rem",
          { lineHeight: "1.2", letterSpacing: "-0.02em" },
        ],
        "display-medium": [
          "2.8125rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        "display-small": ["2.25rem", { lineHeight: "1.3", letterSpacing: "0" }],
        "headline-large": ["2rem", { lineHeight: "1.4", letterSpacing: "0" }],
        "headline-medium": [
          "1.75rem",
          { lineHeight: "1.4", letterSpacing: "0" },
        ],
        "headline-small": ["1.5rem", { lineHeight: "1.5", letterSpacing: "0" }],
        "title-large": ["1.375rem", { lineHeight: "1.5", letterSpacing: "0" }],
        "title-medium": [
          "1rem",
          { lineHeight: "1.5", letterSpacing: "0.01em" },
        ],
        "title-small": [
          "0.875rem",
          { lineHeight: "1.5", letterSpacing: "0.01em" },
        ],
        "body-large": ["1rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        "body-medium": [
          "0.875rem",
          { lineHeight: "1.5", letterSpacing: "0.01em" },
        ],
        "body-small": [
          "0.75rem",
          { lineHeight: "1.5", letterSpacing: "0.01em" },
        ],
        "label-large": [
          "0.875rem",
          { lineHeight: "1.5", letterSpacing: "0.01em" },
        ],
        "label-medium": [
          "0.75rem",
          { lineHeight: "1.5", letterSpacing: "0.05em" },
        ],
        "label-small": [
          "0.6875rem",
          { lineHeight: "1.5", letterSpacing: "0.05em" },
        ],
      },
      borderRadius: {
        // Material 3 Shape System
        "m3-xs": "0.25rem",
        "m3-sm": "0.375rem",
        "m3-md": "0.5rem",
        "m3-lg": "0.75rem",
        "m3-xl": "1rem",
        "m3-2xl": "1.5rem",
        "m3-3xl": "2rem",
        "m3-4xl": "3rem",
      },
      backdropBlur: {
        glass: "20px",
        "glass-lg": "40px",
      },
      boxShadow: {
        // Material 3 Elevation System
        "m3-1":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "m3-2":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "m3-3":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "m3-4":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "m3-5": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        // Liquid Glass effects
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-lg": "0 15px 35px 0 rgba(31, 38, 135, 0.2)",
      },
      animation: {
        // Material 3 Motion
        "m3-bounce": "m3-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "m3-fade-in": "m3-fade-in 0.3s ease-out",
        "m3-slide-up": "m3-slide-up 0.3s ease-out",
        "m3-scale": "m3-scale 0.2s ease-out",
        "glass-shimmer": "glass-shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        "m3-bounce": {
          "0%": { transform: "scale(0.8) translateY(20px)", opacity: "0" },
          "50%": { transform: "scale(1.05) translateY(-5px)" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "m3-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "m3-slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "m3-scale": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glass-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

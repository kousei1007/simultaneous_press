import type { Config } from "tailwindcss";

/**
 * Material Design 3 のカラーロール(surface / primary / secondary / tertiary / error)を
 * CSS 変数として定義し、Tailwind のカラーとして公開する。
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--m3-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--m3-on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--m3-primary-container) / <alpha-value>)",
        "on-primary-container":
          "rgb(var(--m3-on-primary-container) / <alpha-value>)",
        secondary: "rgb(var(--m3-secondary) / <alpha-value>)",
        "secondary-container":
          "rgb(var(--m3-secondary-container) / <alpha-value>)",
        "on-secondary-container":
          "rgb(var(--m3-on-secondary-container) / <alpha-value>)",
        tertiary: "rgb(var(--m3-tertiary) / <alpha-value>)",
        "tertiary-container":
          "rgb(var(--m3-tertiary-container) / <alpha-value>)",
        "on-tertiary-container":
          "rgb(var(--m3-on-tertiary-container) / <alpha-value>)",
        error: "rgb(var(--m3-error) / <alpha-value>)",
        "error-container": "rgb(var(--m3-error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--m3-on-error-container) / <alpha-value>)",
        surface: "rgb(var(--m3-surface) / <alpha-value>)",
        "surface-container-low":
          "rgb(var(--m3-surface-container-low) / <alpha-value>)",
        "surface-container": "rgb(var(--m3-surface-container) / <alpha-value>)",
        "surface-container-high":
          "rgb(var(--m3-surface-container-high) / <alpha-value>)",
        "surface-container-highest":
          "rgb(var(--m3-surface-container-highest) / <alpha-value>)",
        "on-surface": "rgb(var(--m3-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--m3-on-surface-variant) / <alpha-value>)",
        outline: "rgb(var(--m3-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--m3-outline-variant) / <alpha-value>)",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        full: "9999px",
      },
      boxShadow: {
        "elev-1": "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 3px 1px rgb(0 0 0 / 0.15)",
        "elev-2": "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 2px 6px 2px rgb(0 0 0 / 0.15)",
        "elev-3": "0 4px 8px 3px rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      keyframes: {
        "key-pop": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
        "shake-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "20%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-28px) scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "key-pop": "key-pop 180ms ease-out",
        "shake-x": "shake-x 320ms ease-in-out",
        "float-up": "float-up 900ms ease-out forwards",
        "fade-in-up": "fade-in-up 280ms cubic-bezier(0.2, 0, 0, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;


import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e2e8f0",    // Using a neutral gray for borders
        primary: {
          DEFAULT: "#9b87f5",
          light: "#b8a8f8",
          dark: "#7e69f2",
        },
        success: {
          DEFAULT: "#4fd1c5",
          light: "#9ae6de",
        },
        warning: {
          DEFAULT: "#f56565",
          light: "#f89b9b",
        },
        neutral: {
          50: "#f6f7f8",
          100: "#ebedf0",
          200: "#d9dde3",
          300: "#b9c0cc",
          400: "#8994a6",
          500: "#556987",
          600: "#445571",
          700: "#364459",
          800: "#2c3847",
          900: "#1f2937",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

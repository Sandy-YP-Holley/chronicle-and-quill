import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FBF9F5",
          100: "#F5F0E8",
          200: "#EDE4D3",
          300: "#E5E7EB",
          DEFAULT: "#FBF9F5",
          light: "#FFFFFF",
          muted: "#F5F0E8",
          dark: "#EDE4D3",
          border: "#E5E7EB",
        },
        ink: {
          900: "#1C1917",
          700: "#44403C",
          500: "#78716C",
          400: "#A8A29E",
          DEFAULT: "#1C1917",
          muted: "#44403C",
          subtle: "#78716C",
          faint: "#A8A29E",
        },
        burgundy: {
          700: "#7C2D12",
          800: "#9A3412",
          900: "#451A03",
          DEFAULT: "#7C2D12",
          hover: "#9A3412",
          dark: "#451A03",
          light: "#991B1B",
        },
        gold: {
          300: "#FCD34D",
          400: "#F59E0B",
          500: "#D97706",
          600: "#B45309",
          DEFAULT: "#D97706",
          light: "#F59E0B",
          dark: "#B45309",
          border: "#D97706",
        },
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "var(--font-playfair)", "Georgia", "serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        scaleIn: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;

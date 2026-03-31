import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bb: {
          bg: "#0f172a",
          ink: "#f8fafc",
          accent: "#10b981",
          accentDark: "#047857",
          panel: "#111c36",
          panelSoft: "#16213d",
          line: "rgba(148, 163, 184, 0.22)",
          red: "#f87171",
          amber: "#fbbf24",
          green: "#34d399",
        },
      },
      boxShadow: {
        panel: "0 24px 60px rgba(2, 6, 23, 0.48)",
        glow: "0 0 0 1px rgba(16, 185, 129, 0.18), 0 18px 45px rgba(16, 185, 129, 0.12)",
      },
      fontFamily: {
        display: ["Trebuchet MS", "Segoe UI", "sans-serif"],
        body: ["Trebuchet MS", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

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
        brand: {
          navy: "#1A237E",
          lime: "#00C853",
          cream: "#F5F7FF",
          ink: "#0F164A",
          mist: "#DCE3FF",
          red: "#D32F2F",
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "soft-bounce": "softBounce 2.2s ease-in-out infinite",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(15, 22, 74, 0.16)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        softBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};

export default config;

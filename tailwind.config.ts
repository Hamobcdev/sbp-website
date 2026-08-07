import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0a1628",
        "navy-mid": "#0d1f3c",
        "navy-light": "#1a2f4a",
        teal: "#00d4c8",
        "teal-dim": "rgba(0, 212, 200, 0.15)",
        "teal-glow": "rgba(0, 212, 200, 0.08)",
        gold: "#f5a623",
        "gold-dim": "rgba(245, 166, 35, 0.15)",
        silver: "#8899aa",
        "silver-dim": "#4a5a6a",
        "green-live": "#00A651",
        ink: "#334155",
      },
      fontFamily: {
        mono: ["var(--font-plex-mono)", "monospace"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
      },
      maxWidth: {
        content: "1100px",
        prose: "680px",
      },
      animation: {
        "pulse-live": "pulseLive 2s infinite",
        "marquee-left": "marqueeLeft 50s linear infinite",
        "marquee-right": "marqueeRight 50s linear infinite",
      },
      keyframes: {
        pulseLive: {
          "0%": { boxShadow: "0 0 0 0 rgba(0,166,81,0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(0,166,81,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(0,166,81,0)" },
        },
        marqueeLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

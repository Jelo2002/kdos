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
        background: "var(--background)",
        foreground: "var(--foreground)",
        mc: {
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          emerald: "#10b981",
          emeraldHover: "#059669",
          gold: "#f59e0b",
          red: "#ef4444",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        minecraft: ["Minecraftia", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#53020C",
          deep: "#3B0108",
          soft: "#6E1420",
        },
        gold: {
          DEFAULT: "#D4A648",
          light: "#EFD9A7",
          dark: "#A87F2C",
        },
        ivory: {
          DEFAULT: "#FAF6EF",
          warm: "#F3ECDD",
        },
        ink: "#2A1518",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-google-sans-flex)", "system-ui", "sans-serif"],
      },
      maxWidth: { site: "80rem" },
      letterSpacing: { caps: "0.22em" },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#EBFBF1",
          100: "#D2F5DF",
          200: "#A6EBC0",
          300: "#6FDB99",
          400: "#3FCB78",
          500: "#16A34A",
          600: "#0E8A3D",
          700: "#0B6E31",
          800: "#085526",
          900: "#063D1B",
        },
        ink: "#0F172A",
        muted: "#64748B",
        surface: "#FAFAF7",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

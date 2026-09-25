import type { Config } from "tailwindcss";
import { borderRadius, boxShadow, colors, fontFamily, fontSize, gridTemplateColumns, height, letterSpacing, maxWidth } from "./src/styles/tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors, borderRadius, boxShadow, fontFamily, gridTemplateColumns, height, letterSpacing, maxWidth, fontSize: fontSize as unknown as Record<string, [string, { lineHeight: string }]> } },
  plugins: [],
};

export default config;

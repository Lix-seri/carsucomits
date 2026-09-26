import type { Config } from "tailwindcss";
import {
  borderRadius, boxShadow, colors, fontFamily, fontSize, gridTemplateColumns, height, letterSpacing, maxHeight, maxWidth, minHeight, rotate,
  transitionTimingFunction,
} from "./src/styles/tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors,
      borderRadius,
      boxShadow,
      fontFamily,
      gridTemplateColumns,
      height,
      letterSpacing,
      maxHeight,
      maxWidth,
      minHeight,
      rotate,
      transitionTimingFunction,
      fontSize: fontSize as unknown as Record<string, [string, { lineHeight: string }]>,
    },
  },
  plugins: [],
};

export default config;

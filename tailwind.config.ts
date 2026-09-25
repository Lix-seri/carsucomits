import type { Config } from "tailwindcss";
import { borderRadius, boxShadow, colors, fontFamily } from "./src/styles/tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors, borderRadius, boxShadow, fontFamily } },
  plugins: [],
};

export default config;

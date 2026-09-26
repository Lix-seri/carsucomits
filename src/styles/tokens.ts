// The single source of design values. tailwind.config.ts reads these, so components
// use them as Tailwind classes (bg-brand-500, text-muted, border-line, bg-academic-50…).
// Raw palette classes and arbitrary values in components are blocked by ESLint.
//
// World: Pisara, the classroom greenboard (see .impeccable/surfaces/ and DESIGN.md).
// Every colour is a CSS variable (RGB channels) defined in globals.css, once for the
// manila-paper light theme and once for the dark theme, which is the board itself.
// So one class (bg-brand-50 text-brand-700) reads correctly in both themes.
//
// Roles, not hues:
//   brand     board green: primary actions, selection, "open" and success
//   gold      yellow chalk: highlights, stars, "needs attention"
//   coral     pink chalk: celebration and playful accents only
//   board     the greenboard surface and the chalk written on it
//   academic · technical · errand · admin   one colour per commission category
//   ink / muted / faint   text, secondary text (≥4.5:1), icons and placeholders
//   line · sunken · canvas · surface      borders, insets, page ground, cards
//   info · warning · danger               in progress · needs attention · errors

const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;
const scale = (name: string, steps: number[]) => Object.fromEntries(steps.map((s) => [s, v(`${name}-${s}`)]));
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export const colors = {
  brand: scale("brand", STEPS),
  gold: scale("gold", STEPS),
  coral: scale("coral", STEPS),
  academic: scale("academic", [50, 100, 200, 500, 600, 700]),
  technical: scale("technical", [50, 100, 200, 500, 600, 700]),
  errand: scale("errand", [50, 100, 200, 500, 600, 700]),
  admin: scale("admin", [50, 100, 200, 500, 600, 700]),
  board: { DEFAULT: v("board"), deep: v("board-deep"), chalk: v("chalk"), dust: v("chalk-dust") },
  // Text on gold surfaces (dark in both themes) and illustration outlines (chalk on the dark board).
  "on-gold": v("on-gold"),
  "art-line": v("art-line"),
  ink: v("ink"),
  muted: v("muted"),
  faint: v("faint"),
  line: { DEFAULT: v("line"), strong: v("line-strong") },
  sunken: v("sunken"),
  canvas: v("canvas"),
  surface: v("surface"),
  info: scale("info", [50, 100, 200, 500, 600, 700, 800]),
  warning: scale("warning", [50, 100, 200, 400, 500, 600, 700, 800]),
  danger: scale("danger", [50, 100, 200, 500, 600, 700]),
};

export const borderRadius = {
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
};

// Warm, offset shadows from one light source (top), tinted by --shadow (paper brown / board black).
export const boxShadow = {
  soft: "0 1px 2px rgb(var(--shadow) / 0.08), 0 4px 10px -2px rgb(var(--shadow) / 0.10)",
  card: "0 1px 1px rgb(var(--shadow) / 0.06), 0 6px 16px -6px rgb(var(--shadow) / 0.16)",
  lift: "0 2px 4px rgb(var(--shadow) / 0.08), 0 16px 28px -10px rgb(var(--shadow) / 0.28)",
  slip: "0 1px 0 rgb(var(--shadow) / 0.10), 0 10px 18px -8px rgb(var(--shadow) / 0.35)",
};

// Geist for reading and UI, Bricolage Grotesque for display, Kalam only for short chalk notes.
export const fontFamily = {
  sans: ["var(--font-sans)", "system-ui", "sans-serif"],
  display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
  chalk: ["var(--font-chalk)", "var(--font-sans)", "cursive"],
};

// Fixed rem steps (~1.2 ratio). 12px is the floor.
export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }],
  sm: ["0.875rem", { lineHeight: "1.25rem" }],
  base: ["1rem", { lineHeight: "1.5rem" }],
  lg: ["1.125rem", { lineHeight: "1.625rem" }],
  xl: ["1.25rem", { lineHeight: "1.75rem" }],
  "2xl": ["1.5rem", { lineHeight: "1.9rem" }],
  "3xl": ["1.875rem", { lineHeight: "2.2rem" }],
  "4xl": ["2.5rem", { lineHeight: "2.6rem" }],
  "5xl": ["3.25rem", { lineHeight: "1.02" }],
  "6xl": ["4.25rem", { lineHeight: "0.98" }],
} as const;

export const letterSpacing = { code: "0.5em", display: "-0.035em" };

// Named layout values, so components never need arbitrary [..] classes.
export const gridTemplateColumns = {
  "content-aside": "minmax(0, 1fr) 320px",
  "aside-content": "320px minmax(0, 1fr)",
  "label-bar": "180px minmax(0, 1fr)",
  "field-select-action": "minmax(0, 1fr) 180px auto",
  hero: "minmax(0, 1.05fr) minmax(0, 1fr)",
  auth: "minmax(0, 1fr) minmax(0, 1.1fr)",
};
export const height = { conversation: "calc(100dvh - 8rem)" };
export const minHeight = { hero: "min(100dvh, 56rem)" };
export const maxWidth = { bubble: "70%", popover: "calc(100vw - 2rem)", prose: "65ch" };
export const maxHeight = { popover: "min(28rem, calc(100dvh - 6rem))", palette: "min(32rem, calc(100dvh - 8rem))" };
export const rotate = { "1.5": "1.5deg", "-1.5": "-1.5deg", "2.5": "2.5deg", "-2.5": "-2.5deg" };
export const transitionTimingFunction = { out: "cubic-bezier(0.16, 1, 0.3, 1)", spring: "cubic-bezier(0.34, 1.56, 0.64, 1)" };

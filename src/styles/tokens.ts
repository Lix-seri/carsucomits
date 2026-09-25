// The single source of design values. tailwind.config.ts reads these, so components
// use them as Tailwind classes (bg-brand-500, text-muted, border-line, bg-warning-50…).
// Raw palette classes and arbitrary values in components are blocked by ESLint.
//
// Roles, not hues:
//   brand    the one green: primary actions, selection, "open"/success states
//   ink      primary text          muted   secondary text (≥4.5:1 on white)
//   faint    icons and placeholders only, never body text
//   line     borders and dividers  sunken  inset/secondary surfaces  canvas  page background
//   info     "in progress"         warning "needs attention" (awaiting review, warnings)
//   danger   errors and destructive actions only

export const colors = {
  brand: {
    50: "#EBFBF1",
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
  muted: "#5B6474",
  faint: "#94A3B8",
  line: { DEFAULT: "#E2E8F0", strong: "#CBD5E1" },
  sunken: "#F3F5F7",
  canvas: "#F6F8F6",
  surface: "#FAFAF7",
  info: { 50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE", 500: "#3B82F6", 600: "#2563EB", 700: "#1D4ED8", 800: "#1E40AF" },
  warning: { 50: "#FFFBEB", 100: "#FEF3C7", 200: "#FDE68A", 400: "#FBBF24", 500: "#F59E0B", 600: "#D97706", 700: "#B45309", 800: "#92400E" },
  danger: { 50: "#FEF2F2", 100: "#FEE2E2", 200: "#FECACA", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C" },
};

export const borderRadius = {
  lg: "12px",
  md: "8px",
};

export const boxShadow = {
  soft: "0 2px 8px rgba(15,23,42,0.06)",
  card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)",
};

// Product UI: one family, fixed rem steps (~1.2 ratio). 12px is the floor.
export const fontFamily = {
  sans: ["var(--font-sans)", "system-ui", "sans-serif"],
};

export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }],
  sm: ["0.875rem", { lineHeight: "1.25rem" }],
  base: ["1rem", { lineHeight: "1.5rem" }],
  lg: ["1.125rem", { lineHeight: "1.625rem" }],
  xl: ["1.25rem", { lineHeight: "1.75rem" }],
  "2xl": ["1.5rem", { lineHeight: "2rem" }],
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
  "5xl": ["3rem", { lineHeight: "1.1" }],
  "6xl": ["3.75rem", { lineHeight: "1.05" }],
} as const;

// Named layout values, so components never need arbitrary [..] classes.
export const gridTemplateColumns = {
  "content-aside": "minmax(0, 1fr) 320px",
  "aside-content": "320px minmax(0, 1fr)",
  "label-bar": "180px minmax(0, 1fr)",
  "field-select-action": "minmax(0, 1fr) 180px auto",
};
export const height = { conversation: "calc(100dvh - 8rem)" };
export const letterSpacing = { code: "0.5em" };
export const maxWidth = { bubble: "70%" };

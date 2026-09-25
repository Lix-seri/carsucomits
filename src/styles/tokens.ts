// The single source of design values. tailwind.config.ts reads these, so components
// use them as Tailwind classes (bg-brand-500, rounded-lg, shadow-card, text-ink…).
// Raw palette classes and arbitrary values in components are blocked by ESLint.

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
  muted: "#64748B",
  surface: "#FAFAF7",
};

export const borderRadius = {
  lg: "12px",
  md: "8px",
};

export const boxShadow = {
  soft: "0 2px 8px rgba(0,0,0,0.06)",
  card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

export const fontFamily = {
  sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
};

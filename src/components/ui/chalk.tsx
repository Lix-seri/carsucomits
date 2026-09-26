import { cn } from "@/lib/utils";

// Hand-drawn chalk marks (world: Pisara). Each path uses pathLength="1" so the .chalk-draw
// utility can draw it on once; with reduced motion they simply appear. Colour is currentColor.

type Mark = { className?: string; delay?: number; draw?: boolean };
const style = (delay?: number) => (delay ? ({ "--chalk-delay": `${delay}ms` } as React.CSSProperties) : undefined);

/** A quick scribbled underline, drawn under a highlighted word. */
export function ChalkUnderline({ className, delay, draw = true }: Mark) {
  return (
    <svg viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden className={cn(draw && "chalk-draw", className)} style={style(delay)}>
      <path pathLength={1} d="M3 11c38-6 83-8 124-6 24 1 46 3 70 6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path pathLength={1} d="M22 15c46-4 98-4 150-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

/** A loose hand-drawn ring around a number or word. Place it absolutely over the target. */
export function ChalkCircle({ className, delay, draw = true }: Mark) {
  return (
    <svg viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden className={cn(draw && "chalk-draw", className)} style={style(delay)}>
      <path pathLength={1} d="M78 6C48 2 12 10 7 28c-5 19 28 28 58 27 30-1 53-9 52-26C116 13 92 5 60 6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/** A chalk check mark. */
export function ChalkCheck({ className, delay, draw = true }: Mark) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn(draw && "chalk-draw", className)} style={style(delay)}>
      <path pathLength={1} d="M4 13.5 9.5 19 20 5.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A five-point chalk star, drawn in one stroke like a teacher's mark. */
export function ChalkStar({ className, delay, draw = true }: Mark) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn(draw && "chalk-draw", className)} style={style(delay)}>
      <path pathLength={1} d="M24 4 29.5 18.5 45 19 33 28.5 37.5 43.5 24 35 10.5 43.5 15 28.5 3 19 18.5 18.5Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** A small round magnet that pins a slip to the board. */
export function Magnet({ tone = "gold", className }: { tone?: "gold" | "coral" | "brand" | "academic" | "technical" | "errand" | "admin"; className?: string }) {
  const fill = {
    gold: "bg-gold-400",
    coral: "bg-coral-400",
    brand: "bg-brand-400",
    academic: "bg-academic-500",
    technical: "bg-technical-500",
    errand: "bg-errand-500",
    admin: "bg-admin-500",
  }[tone];
  return <span aria-hidden className={cn("block h-4 w-4 rounded-full shadow-soft ring-2 ring-surface", fill, className)} />;
}

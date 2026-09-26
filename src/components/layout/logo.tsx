import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The CarSUComits mark: a paper slip shaped like a speech bubble, pinned to the board by a
 * gold magnet, with a chalk check ("commission accepted"). Geometric, legible at 16px.
 * The same geometry ships as public/brand/*.svg and the favicons.
 */
export function LogoMark({ variant = "color", className }: { variant?: "color" | "on-dark" | "mono"; className?: string }) {
  const bubble = variant === "on-dark" ? "rgb(var(--c-chalk))" : variant === "mono" ? "currentColor" : "rgb(var(--c-board))";
  const check = variant === "on-dark" ? "rgb(var(--c-board))" : variant === "mono" ? "rgb(var(--c-canvas))" : "rgb(var(--c-chalk))";
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("shrink-0", className)}>
      <path d="M18 8h30c7.7 0 14 6.3 14 14v12c0 7.7-6.3 14-14 14H30l-14 11 2-11c-7.2-.6-12-6.6-12-14V22C6 14.3 10.3 8 18 8Z" fill={bubble} />
      <path d="M20 28.5 28.5 37 45 20.5" fill="none" stroke={check} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      {variant !== "mono" && <circle cx="51" cy="9.5" r="7" fill="rgb(var(--c-gold-400))" stroke={variant === "on-dark" ? "rgb(var(--c-board))" : "rgb(var(--c-canvas))"} strokeWidth="3" />}
    </svg>
  );
}

/** Mark plus wordmark: the first half in ink, "Comits" in board green (chalk and gold on dark grounds). */
export function Wordmark({ onDark = false, size = "md", className }: { onDark?: boolean; size?: "sm" | "md" | "lg"; className?: string }) {
  const mark = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const text = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark variant={onDark ? "on-dark" : "color"} className={mark} />
      <span className={cn("font-display font-extrabold tracking-display", text, onDark ? "text-board-chalk" : "text-ink")}>
        CarSU<span className={onDark ? "text-gold-400" : "text-brand-700"}>Comits</span>
      </span>
    </span>
  );
}

/** The home link used in headers and on the sign-in pages. */
export function Logo({ size = "md", onDark = false }: { size?: "sm" | "md" | "lg"; onDark?: boolean }) {
  return (
    <Link href="/" aria-label="CarSUComits home" className="rounded-lg">
      <Wordmark size={size} onDark={onDark} />
    </Link>
  );
}

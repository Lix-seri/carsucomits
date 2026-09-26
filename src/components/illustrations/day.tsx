import { cn } from "@/lib/utils";

const LINE = "rgb(var(--c-art-line))";
const o = { stroke: LINE, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** A small campus scene for the greeting: a sun rising, a sun overhead, or the moon and stars. */
export function DayArt({ part, className }: { part: "morning" | "afternoon" | "evening"; className?: string }) {
  const night = part === "evening";
  return (
    <svg viewBox="0 0 160 100" aria-hidden className={cn("shrink-0", className)}>
      <rect x="2" y="2" width="156" height="96" rx="18" fill={night ? "rgb(var(--c-board))" : "rgb(var(--c-gold-50))"} {...o} />
      {part === "morning" && <circle cx="42" cy="58" r="16" fill="rgb(var(--c-gold-400))" {...o} />}
      {part === "afternoon" && (
        <g>
          <circle cx="116" cy="28" r="13" fill="rgb(var(--c-gold-400))" {...o} />
          <path d="M116 6v-2M136 28h3M131 13l2-2M101 13l-2-2" {...o} />
        </g>
      )}
      {night && (
        <g>
          <path d="M122 16a14 14 0 1 0 12 20 11 11 0 1 1-12-20Z" fill="rgb(var(--c-gold-300))" stroke="none" />
          <circle cx="40" cy="22" r="2" fill="rgb(var(--c-chalk))" />
          <circle cx="64" cy="14" r="1.5" fill="rgb(var(--c-chalk))" />
          <circle cx="94" cy="26" r="1.5" fill="rgb(var(--c-chalk))" />
        </g>
      )}
      {/* The campus building with its flag, and the path in front */}
      <path d="M58 86V50l22-14 22 14v36Z" fill="rgb(var(--c-surface))" {...o} />
      <path d="M68 86V70h24v16" fill={night ? "rgb(var(--c-gold-200))" : "rgb(var(--c-brand-200))"} {...o} />
      <path d="M72 56h6M86 56h6" {...o} />
      <path d="M80 36V22l10 4-10 4" fill="rgb(var(--c-coral-400))" {...o} strokeWidth={2.5} />
      <path d="M8 86h144" {...o} />
      <path d="M24 86c0-10 6-16 12-16s10 6 10 16M116 86c0-12 8-18 14-18s12 6 12 18" fill={night ? "rgb(var(--c-board-deep))" : "rgb(var(--c-brand-300))"} {...o} />
    </svg>
  );
}

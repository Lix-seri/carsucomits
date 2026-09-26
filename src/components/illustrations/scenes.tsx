import { cn } from "@/lib/utils";

// Flat, outlined illustrations in the Pisara world: one per category and one per lifecycle
// step. Outlines use the board-deep green; fills use theme variables, so dark mode works.

const INK = "rgb(var(--c-board-deep))";
const PAPER = "rgb(var(--c-surface))";
const o = { stroke: INK, strokeWidth: 3.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const svg = (className?: string) => ({ viewBox: "0 0 160 120", "aria-hidden": true, className: cn("shrink-0", className) });

/** Academic: an open book with a lightbulb (tutoring, never graded work). */
export function AcademicArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <path d="M22 92c20-8 38-8 58 2 20-10 38-10 58-2V44c-20-8-38-8-58 2-20-10-38-10-58-2Z" fill={PAPER} {...o} />
      <path d="M80 46v48" {...o} />
      <path d="M34 56c10-3 22-3 34 1M34 68c10-3 22-3 34 1M92 57c12-4 24-4 34-1M92 69c12-4 24-4 34-1" stroke="rgb(var(--c-academic-200))" strokeWidth={3} strokeLinecap="round" />
      <circle cx="80" cy="24" r="12" fill="rgb(var(--c-gold-400))" {...o} />
      <path d="M75 35h10v6H75Z" fill="rgb(var(--c-academic-500))" {...o} strokeWidth={3} />
      <path d="M60 18l-6-4M100 18l6-4M80 8V4" {...o} strokeWidth={3} />
    </svg>
  );
}

/** Technical: a laptop showing code brackets. */
export function TechnicalArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <rect x="34" y="20" width="92" height="62" rx="8" fill="rgb(var(--c-technical-500))" {...o} />
      <rect x="42" y="28" width="76" height="46" rx="4" fill={PAPER} {...o} strokeWidth={3} />
      <path d="M68 42l-9 9 9 9M92 42l9 9-9 9M84 40l-8 22" stroke="rgb(var(--c-technical-600))" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M22 86h116l-8 14H30Z" fill="rgb(var(--c-technical-200))" {...o} />
      <path d="M70 92h20" {...o} strokeWidth={3} />
    </svg>
  );
}

/** General errands: a Butuan tricycle, sidecar and all. */
export function ErrandArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <path d="M62 30h66a8 8 0 0 1 8 8v44H62Z" fill="rgb(var(--c-errand-500))" {...o} />
      <path d="M56 26h82" {...o} strokeWidth={5} />
      <rect x="72" y="42" width="24" height="18" rx="3" fill={PAPER} {...o} strokeWidth={3} />
      <rect x="104" y="42" width="22" height="18" rx="3" fill={PAPER} {...o} strokeWidth={3} />
      <path d="M72 70h54" stroke="rgb(var(--c-gold-400))" strokeWidth={5} strokeLinecap="round" />
      <path d="M62 82H30l10-26h22" fill="rgb(var(--c-errand-200))" {...o} />
      <path d="M40 56 34 44h12" {...o} />
      <circle cx="42" cy="92" r="12" fill={PAPER} {...o} />
      <circle cx="112" cy="92" r="12" fill={PAPER} {...o} />
      <circle cx="42" cy="92" r="3" fill={INK} />
      <circle cx="112" cy="92" r="3" fill={INK} />
    </svg>
  );
}

/** Administrative: a clipboard with a checklist beside a little spreadsheet. */
export function AdminArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <rect x="30" y="16" width="62" height="90" rx="8" fill="rgb(var(--c-admin-500))" {...o} />
      <rect x="38" y="26" width="46" height="72" rx="4" fill={PAPER} {...o} strokeWidth={3} />
      <rect x="48" y="10" width="26" height="12" rx="4" fill="rgb(var(--c-gold-400))" {...o} strokeWidth={3} />
      <path d="M45 42l4 4 7-8M45 58l4 4 7-8M45 74l4 4 7-8" stroke="rgb(var(--c-brand-500))" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M62 43h14M62 59h14M62 75h10" {...o} strokeWidth={3} />
      <rect x="100" y="44" width="42" height="46" rx="4" fill={PAPER} {...o} />
      <path d="M100 58h42M100 72h42M114 44v46M128 44v46" stroke="rgb(var(--c-admin-200))" strokeWidth={2.5} />
      <path d="M100 58h42M114 44v46" {...o} strokeWidth={2} />
    </svg>
  );
}

export const CATEGORY_ART: Record<string, (p: { className?: string }) => React.ReactElement> = {
  ACADEMIC: AcademicArt,
  TECHNICAL: TechnicalArt,
  GENERAL_ERRANDS: ErrandArt,
  ADMINISTRATIVE: AdminArt,
};

// ---- The four lifecycle steps ------------------------------------------------------------

/** 1. Post: a slip pinned to the board with a magnet, fare circled. */
export function PostArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <rect x="18" y="10" width="124" height="100" rx="10" fill="rgb(var(--c-board))" {...o} />
      <g transform="rotate(-4 80 60)">
        <rect x="44" y="28" width="72" height="62" rx="5" fill={PAPER} {...o} strokeWidth={3} />
        <path d="M54 44h40M54 54h30" {...o} strokeWidth={3} />
        <ellipse cx="84" cy="74" rx="20" ry="9" fill="none" stroke="rgb(var(--c-gold-400))" strokeWidth={3} />
        <path d="M74 75h20" {...o} strokeWidth={3.5} />
        <circle cx="80" cy="27" r="7" fill="rgb(var(--c-coral-400))" {...o} strokeWidth={3} />
      </g>
    </svg>
  );
}

/** 2. Hire: two slips joined by the agreement check. */
export function HireArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <circle cx="46" cy="54" r="22" fill="rgb(var(--c-academic-200))" {...o} />
      <circle cx="114" cy="54" r="22" fill="rgb(var(--c-errand-200))" {...o} />
      <circle cx="46" cy="48" r="7" fill={PAPER} {...o} strokeWidth={3} />
      <path d="M34 66q12-12 24 0" {...o} strokeWidth={3} fill="none" />
      <circle cx="114" cy="48" r="7" fill={PAPER} {...o} strokeWidth={3} />
      <path d="M102 66q12-12 24 0" {...o} strokeWidth={3} fill="none" />
      <path d="M62 92h36a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H74l-8 6v-6h-4a8 8 0 0 1-8-8v0a8 8 0 0 1 8-8Z" fill="rgb(var(--c-board))" {...o} strokeWidth={3} />
      <path d="M72 100l5 5 10-10" stroke="rgb(var(--c-chalk))" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** 3. Deliver: a file dropped onto the commission. */
export function DeliverArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <path d="M54 14h36l18 18v58a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" fill={PAPER} {...o} />
      <path d="M90 14v18h18" {...o} fill="rgb(var(--c-technical-200))" />
      <path d="M60 48h34M60 58h34M60 68h22" {...o} strokeWidth={3} />
      <path d="M78 100v14M70 108l8 8 8-8" stroke="rgb(var(--c-brand-500))" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="118" cy="30" r="12" fill="rgb(var(--c-brand-500))" {...o} strokeWidth={3} />
      <path d="M113 30l4 4 7-8" stroke={PAPER} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** 4. Complete and rate: a teacher's gold star sticker. */
export function RateArt({ className }: { className?: string }) {
  return (
    <svg {...svg(className)}>
      <circle cx="80" cy="58" r="42" fill="rgb(var(--c-coral-200))" {...o} />
      <path d="M80 26l9 20 22 2-17 14 5 21-19-11-19 11 5-21-17-14 22-2Z" fill="rgb(var(--c-gold-400))" {...o} />
      <path d="M52 100l-6 16 12-6 6 10 4-18M108 100l6 16-12-6-6 10-4-18" fill="rgb(var(--c-brand-400))" {...o} strokeWidth={3} />
    </svg>
  );
}

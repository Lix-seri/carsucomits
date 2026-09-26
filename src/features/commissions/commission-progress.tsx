import { cn } from "@/lib/utils";
import { ChalkCheck, ChalkCircle } from "@/components/ui/chalk";

const STEPS = ["Posted", "Hired", "Delivered", "Completed"];

// Which step a status is on. Waiting on the agreement is still the "Hired" step.
const CURRENT: Record<string, number> = { OPEN: 0, AGREEMENT_PENDING: 1, IN_PROGRESS: 1, AWAITING_REVIEW: 2, COMPLETED: 4 };

/**
 * Where a commission is in its lifecycle. Every stage keeps its full label at any width:
 * done stages are solid with a chalk check, the current one is circled in chalk, and future
 * ones are dashed (state written as line weight).
 */
export function CommissionProgress({ status, onBoard = false }: { status: string; onBoard?: boolean }) {
  if (status === "CANCELLED" || status === "DISPUTED") return null;
  const current = CURRENT[status] ?? 0;
  return (
    <ol aria-label="Commission progress" className="grid grid-cols-4">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="relative flex flex-col items-center gap-1.5 text-center" aria-current={active ? "step" : undefined}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-3.5 h-0 w-full -translate-y-1/2 border-t-4",
                  i <= current ? (onBoard ? "border-board-chalk" : "border-brand-500") : onBoard ? "border-dashed border-board-chalk/40" : "border-dashed border-line-strong",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                done && (onBoard ? "bg-board-chalk text-board" : "bg-brand-500 text-white"),
                active && (onBoard ? "bg-board text-gold-400" : "bg-surface text-brand-700 ring-2 ring-brand-500"),
                !done && !active && (onBoard ? "border-2 border-dashed border-board-chalk/50 bg-board text-board-dust" : "border-2 border-dashed border-line-strong bg-surface text-faint"),
              )}
            >
              {done ? <ChalkCheck className="h-4 w-4" draw={false} /> : i + 1}
              {active && <ChalkCircle className={cn("pointer-events-none absolute -inset-2 h-11 w-11", onBoard ? "text-gold-400" : "text-gold-500")} />}
            </span>
            <span
              className={cn(
                "text-xs leading-tight",
                done || active ? "font-semibold" : "",
                onBoard ? (done || active ? "text-board-chalk" : "text-board-dust") : done || active ? "text-ink" : "text-muted",
              )}
            >
              {label}
              {active && <span className="sr-only"> (current step)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

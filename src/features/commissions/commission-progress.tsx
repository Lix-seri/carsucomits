import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "OPEN", label: "Posted" },
  { key: "IN_PROGRESS", label: "Hired" },
  { key: "AWAITING_REVIEW", label: "Delivered" },
  { key: "COMPLETED", label: "Completed & rated" },
];

/** Where a commission is in its lifecycle, and what comes next. */
export function CommissionProgress({ status }: { status: string }) {
  if (status === "CANCELLED" || status === "DISPUTED") return null;
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <ol aria-label="Commission progress" className="flex items-center gap-1.5 sm:gap-2">
      {STEPS.map((s, i) => {
        const done = i < current || status === "COMPLETED";
        const active = i === current && status !== "COMPLETED";
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                done ? "bg-brand-500 text-white" : active ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500" : "bg-sunken text-muted",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("truncate text-xs font-medium", done || active ? "text-ink" : "text-muted")}>{s.label}</span>
            {i < STEPS.length - 1 && <span className={cn("h-px min-w-3 flex-1", done ? "bg-brand-500" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}

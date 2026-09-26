import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tisa, type TisaPose } from "@/components/illustrations/tisa";

/**
 * An empty list that invites the next step: Tisa, one warm line, one action.
 * `icon` is kept only as a small hint beside the title in compact (in-card) empty states.
 */
export function EmptyState({
  pose = "sleep", title, children, action, compact = false, icon: Icon,
}: { pose?: TisaPose; title: string; children?: React.ReactNode; action?: React.ReactNode; compact?: boolean; icon?: LucideIcon }) {
  return (
    <div
      className={cn(
        "flex items-center rounded-2xl border-2 border-dashed border-line-strong bg-surface/70 text-center",
        compact ? "flex-col px-4 py-6" : "flex-col px-6 py-10 sm:flex-row sm:gap-8 sm:px-10 sm:text-left",
      )}
    >
      <Tisa pose={pose} className={compact ? "h-24 w-24" : "h-32 w-32 sm:h-36 sm:w-36"} />
      <div className={cn("mt-2", !compact && "sm:mt-0")}>
        <p className="flex items-center justify-center gap-2 font-display text-lg font-bold sm:justify-start">
          {Icon && <Icon aria-hidden className="h-4 w-4 text-muted" />}
          {title}
        </p>
        {children && <p className={cn("mt-1 max-w-sm text-sm text-muted", compact ? "mx-auto" : "mx-auto sm:mx-0")}>{children}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

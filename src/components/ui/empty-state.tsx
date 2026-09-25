import type { LucideIcon } from "lucide-react";

/** An empty list that says what goes here and how to get there. */
export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-white px-6 py-10 text-center">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-sunken text-muted">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

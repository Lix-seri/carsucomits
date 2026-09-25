import { cn } from "@/lib/utils";

/** Placeholder block shaped like the content that's loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-sunken", className)} />;
}

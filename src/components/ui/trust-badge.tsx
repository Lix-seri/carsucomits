import { trustTier } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function TrustBadge({
  avg, reviewCount, size = "md", showDescription = false,
}: {
  avg: number | null;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}) {
  const tier = trustTier(avg, reviewCount);
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" :
    size === "lg" ? "px-3.5 py-1.5 text-sm" :
    "px-3 py-1 text-xs";

  return (
    <div className={showDescription ? "flex flex-col gap-1" : "inline-flex"}>
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        tier.color,
        sizeClass,
      )}>
        <span>{tier.emoji}</span> {tier.label}
      </span>
      {showDescription && (
        <p className="text-xs text-muted">{tier.description}</p>
      )}
    </div>
  );
}

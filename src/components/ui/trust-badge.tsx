import { Award, ShieldAlert, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { trustTier, type TrustTier } from "@/lib/trust";
import { Badge } from "./badge";

const ICON: Record<TrustTier["level"], typeof Award> = {
  HIGHLY_TRUSTED: Award,
  TRUSTED: ShieldCheck,
  RISING: TrendingUp,
  NEW: Sparkles,
  CAUTION: ShieldAlert,
};

/** Reputation from rating and review count; the description says how it was earned. */
export function TrustBadge({ avg, reviewCount, showDescription = false }: { avg: number | null; reviewCount: number; showDescription?: boolean }) {
  const tier = trustTier(avg, reviewCount);
  const Icon = ICON[tier.level];
  return (
    <div className={showDescription ? "flex flex-col items-start gap-1" : "inline-flex"}>
      <Badge tone={tier.tone} icon={<Icon className="h-3.5 w-3.5" />}>{tier.label}</Badge>
      {showDescription && <p className="text-xs text-muted">{tier.description}</p>}
    </div>
  );
}

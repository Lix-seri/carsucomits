import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_STATUS, APPLICATION_STATUS, COMMISSION_STATUS, DELIVERABLE_STATUS, REPORT_STATUS, type Tone,
} from "@/lib/labels";

export { CategoryBadge, LevelBadge } from "./category";

// Soft chips for dense lists; the sticker variant (outlined, bold, slightly tilted) is for
// moments that deserve a teacher's-star-sticker feel: profile headers, hero slips, success.
const TONE: Record<Tone, { chip: string; sticker: string }> = {
  brand: { chip: "bg-brand-50 text-brand-700 ring-brand-200", sticker: "border-brand-300 bg-brand-50 text-brand-700" },
  info: { chip: "bg-info-50 text-info-700 ring-info-200", sticker: "border-info-200 bg-info-50 text-info-700" },
  warning: { chip: "bg-warning-50 text-warning-800 ring-warning-200", sticker: "border-gold-300 bg-gold-50 text-gold-800" },
  danger: { chip: "bg-danger-50 text-danger-700 ring-danger-200", sticker: "border-danger-200 bg-danger-50 text-danger-700" },
  neutral: { chip: "bg-sunken text-muted ring-line-strong", sticker: "border-line-strong bg-surface text-ink" },
};

export function Badge({
  tone = "neutral", icon, sticker = false, tilt, className, children,
}: { tone?: Tone; icon?: React.ReactNode; sticker?: boolean; tilt?: "left" | "right"; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        sticker ? cn("sticker", TONE[tone].sticker) : cn("inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", TONE[tone].chip),
        tilt === "left" && "-rotate-1.5",
        tilt === "right" && "rotate-1.5",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

type StatusMap = Record<string, { label: string; tone: Tone }>;
const statusBadge = (map: StatusMap) =>
  function StatusBadge({ status, sticker }: { status: string; sticker?: boolean }) {
    const s = map[status] ?? { label: status, tone: "neutral" as Tone };
    return <Badge tone={s.tone} sticker={sticker}>{s.label}</Badge>;
  };

export const CommissionStatusBadge = statusBadge(COMMISSION_STATUS);
export const ApplicationStatusBadge = statusBadge(APPLICATION_STATUS);
export const ReportStatusBadge = statusBadge(REPORT_STATUS);
export const AccountStatusBadge = statusBadge(ACCOUNT_STATUS);
export const DeliverableStatusBadge = statusBadge(DELIVERABLE_STATUS);

/** A student whose CCIS verification was approved (decision 0012). */
export function VerifiedBadge({ sticker = false }: { sticker?: boolean }) {
  return (
    <Badge tone="brand" sticker={sticker} tilt={sticker ? "left" : undefined} icon={<BadgeCheck className="h-3.5 w-3.5" />}>
      CCIS verified
    </Badge>
  );
}

/** Available / Busy, from the person's unfinished jobs (item 4). */
export function AvailabilityBadge({ activeJobs }: { activeJobs: number }) {
  return activeJobs > 0 ? (
    <Badge tone="warning" icon={<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning-500" />}>
      Busy · {activeJobs} job{activeJobs === 1 ? "" : "s"}
    </Badge>
  ) : (
    <Badge tone="brand" icon={<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-500" />}>Available</Badge>
  );
}

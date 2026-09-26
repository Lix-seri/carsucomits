import { BadgeCheck, BookOpen, ClipboardList, Code2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_STATUS, APPLICATION_STATUS, CATEGORY_LABEL, COMMISSION_STATUS, DELIVERABLE_STATUS, LEVEL_LABEL, REPORT_STATUS, type Tone,
} from "@/lib/labels";

const TONE: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  info: "bg-info-50 text-info-700 ring-info-200",
  warning: "bg-warning-50 text-warning-800 ring-warning-200",
  danger: "bg-danger-50 text-danger-700 ring-danger-200",
  neutral: "bg-sunken text-muted ring-line",
};

export function Badge({ tone = "neutral", icon, className, children }: { tone?: Tone; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", TONE[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

type StatusMap = Record<string, { label: string; tone: Tone }>;
const statusBadge = (map: StatusMap) =>
  function StatusBadge({ status }: { status: string }) {
    const s = map[status] ?? { label: status, tone: "neutral" as Tone };
    return <Badge tone={s.tone}>{s.label}</Badge>;
  };

export const CommissionStatusBadge = statusBadge(COMMISSION_STATUS);
export const ApplicationStatusBadge = statusBadge(APPLICATION_STATUS);
export const ReportStatusBadge = statusBadge(REPORT_STATUS);
export const AccountStatusBadge = statusBadge(ACCOUNT_STATUS);
export const DeliverableStatusBadge = statusBadge(DELIVERABLE_STATUS);

const CATEGORY_ICON: Record<string, typeof BookOpen> = {
  ACADEMIC: BookOpen,
  TECHNICAL: Code2,
  GENERAL_ERRANDS: ShoppingCart,
  ADMINISTRATIVE: ClipboardList,
};

/** Category is information, not a state, so it stays neutral and carries its icon instead of a colour. */
export function CategoryBadge({ category }: { category: string }) {
  const Icon = CATEGORY_ICON[category];
  return <Badge icon={Icon && <Icon className="h-3.5 w-3.5" />}>{CATEGORY_LABEL[category] ?? category}</Badge>;
}

export function LevelBadge({ level }: { level: string }) {
  return <Badge className="bg-white">{LEVEL_LABEL[level] ?? level}</Badge>;
}

/** A student whose CCIS verification was approved (decision 0012). */
export function VerifiedBadge() {
  return <Badge tone="brand" icon={<BadgeCheck className="h-3.5 w-3.5" />}>CCIS verified</Badge>;
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

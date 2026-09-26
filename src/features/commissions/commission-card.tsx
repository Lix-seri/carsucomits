import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { dueLabel, formatFare } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { CategoryBadge, CategoryIcon, LevelPips, categoryStyle } from "@/components/ui/category";

export type CommissionCardData = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  requiredLevel: string;
  fareMin: number;
  fareMax: number | null;
  fareUnit: string | null;
  deadline?: Date | string | null;
  coverImageUrl: string | null;
  commissioner: { fullName: string; avatarUrl?: string | null };
  _count: { applications: number };
};

/** A slip on the board: used on Browse and Saved. The whole card is the link. */
export function CommissionCard({ c }: { c: CommissionCardData }) {
  const s = categoryStyle(c.category);
  const due = dueLabel(c.deadline);
  const soon = due === "Due today" || due === "Due tomorrow" || due.endsWith("overdue");
  const applicants = c._count.applications;
  return (
    <Link
      href={`/commission/${c.id}`}
      className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span aria-hidden className={cn("h-1.5 w-full", s.strip)} />
      {c.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.coverImageUrl} alt="" loading="lazy" className="aspect-video w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <CategoryIcon category={c.category} size="sm" />
          <div className="min-w-0 flex-1">
            <CategoryBadge category={c.category} icon={false} />
            {c.subcategory && <p className="truncate text-xs text-muted">{c.subcategory}</p>}
          </div>
          <LevelPips level={c.requiredLevel} />
        </div>
        <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug group-hover:text-brand-700">{c.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className={cn("inline-flex items-center gap-1", soon && "font-semibold text-coral-600")}>
            <Clock aria-hidden className="h-3.5 w-3.5" /> {due}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden className="h-3.5 w-3.5" /> {applicants === 0 ? "No applicants yet" : `${applicants} applicant${applicants === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <Avatar name={c.commissioner.fullName} src={c.commissioner.avatarUrl ?? null} size="xs" />
            <span className="truncate font-medium">{c.commissioner.fullName}</span>
          </span>
          <span className="shrink-0 rounded-xl bg-brand-50 px-3 py-1 font-display text-lg font-extrabold tabular text-brand-700">{formatFare(c)}</span>
        </div>
      </div>
    </Link>
  );
}

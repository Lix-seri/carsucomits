import Link from "next/link";
import { formatFare } from "@/lib/format";
import { CategoryBadge, LevelBadge } from "@/components/ui/badge";

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
  coverImageUrl: string | null;
  commissioner: { fullName: string };
  _count: { applications: number };
};

/** A listing card, used on the home page and on Browse. The whole card is the link. */
export function CommissionCard({ c }: { c: CommissionCardData }) {
  return (
    <Link
      href={`/commission/${c.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:border-brand-300 hover:shadow-card focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {c.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={c.category} />
          <LevelBadge level={c.requiredLevel} />
        </div>
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-brand-700">{c.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <p className="text-xs text-muted">
            {c.commissioner.fullName}
            <br />
            {c._count.applications} applicant{c._count.applications === 1 ? "" : "s"}
          </p>
          <p className="tabular text-lg font-semibold text-brand-700">{formatFare(c)}</p>
        </div>
      </div>
    </Link>
  );
}

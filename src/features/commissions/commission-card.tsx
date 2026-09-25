import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatFare } from "@/lib/format";
import { LEVEL_PILL } from "@/lib/labels";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-brand-500 text-white",
  TECHNICAL: "bg-info-500 text-white",
  GENERAL_ERRANDS: "bg-warning-500 text-white",
  ADMINISTRATIVE: "bg-info-500 text-white",
};

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

/** A listing card, used on the home page and on Browse. */
export function CommissionCard({ c }: { c: CommissionCardData }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      {c.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.coverImageUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className={`pill ${CAT_PILL[c.category] ?? "bg-ink text-white"}`}>{c.category.replace("_", " ")}</span>
          <span className={`pill ${LEVEL_PILL[c.requiredLevel]}`}>{c.requiredLevel}</span>
        </div>
        {c.subcategory && <span className="pill mb-3 w-fit bg-sunken text-ink">{c.subcategory}</span>}
        <h3 className="mb-1.5 line-clamp-2 text-base font-bold text-ink">{c.title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted">{c.description}</p>
        <p className="mb-4 text-base font-bold text-brand-600">{formatFare(c)}</p>
        <p className="mb-3 text-xs text-muted">
          Posted by {c.commissioner.fullName} · {c._count.applications} applicant{c._count.applications === 1 ? "" : "s"}
        </p>
        <Link href={`/commission/${c.id}`} className="btn-primary mt-auto w-full">
          View &amp; Apply <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

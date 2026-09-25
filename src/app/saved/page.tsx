import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { pageSession } from "@/lib/session";
import { getSavedCommissions } from "@/features/commissions/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BookmarkButton } from "@/features/commissions/bookmark-button";
import { formatFare } from "@/lib/format";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-brand-500 text-white",
  TECHNICAL: "bg-info-500 text-white",
  GENERAL_ERRANDS: "bg-warning-500 text-white",
  ADMINISTRATIVE: "bg-info-500 text-white",
};

export default async function SavedPage() {
  const session = await pageSession();
  const saved = await getSavedCommissions(session.userId);

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-sunken">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Bookmark className="h-6 w-6 fill-brand-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Saved Commissions</h1>
              <p className="text-sm text-muted">Bookmarked for later.</p>
            </div>
          </div>

          {saved.length === 0 ? (
            <div className="rounded-xl border border-line bg-white py-16 text-center">
              <Bookmark className="mx-auto mb-3 h-10 w-10 text-faint" />
              <p className="text-muted">You haven&apos;t saved any commissions yet.</p>
              <Link href="/browse" className="btn-primary mt-4 inline-flex">Browse openings</Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saved.map((s) => (
                <article key={s.id} className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card">
                  {s.commission.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.commission.coverImageUrl} alt="" className="h-32 w-full object-cover" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className={`pill ${CAT_PILL[s.commission.category] ?? "bg-ink text-white"}`}>
                        {s.commission.category.replace("_", " ")}
                      </span>
                      <BookmarkButton commissionId={s.commission.id} initialSaved={true} size="sm" />
                    </div>
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold">{s.commission.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted">{s.commission.description}</p>
                    <p className="mb-3 text-base font-bold text-brand-600">{formatFare(s.commission)}</p>
                    <Link href={`/commission/${s.commission.id}`} className="btn-primary mt-auto w-full">
                      View &amp; Apply <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

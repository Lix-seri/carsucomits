import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookmarkButton } from "@/components/bookmark-button";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-emerald-500 text-white",
  TECHNICAL: "bg-blue-500 text-white",
  GENERAL_ERRANDS: "bg-amber-500 text-white",
  ADMINISTRATIVE: "bg-purple-500 text-white",
};

function fareDisplay(c: { fareMin: number; fareMax: number | null; fareUnit: string | null }) {
  return c.fareMax ? `₱${c.fareMin}–${c.fareMax}${c.fareUnit ?? ""}` : `₱${c.fareMin}${c.fareUnit ?? ""}`;
}

export default async function SavedPage() {
  const session = await getSession();
  if (!session) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            Please <Link href="/login" className="text-brand-600 hover:underline">log in</Link> to view your saved commissions.
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const saved = await prisma.savedCommission.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      commission: {
        include: {
          commissioner: { select: { fullName: true } },
          _count: { select: { applications: true } },
        },
      },
    },
  });

  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Bookmark className="h-6 w-6 fill-brand-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Saved Commissions</h1>
              <p className="text-sm text-slate-500">Bookmarked for later.</p>
            </div>
          </div>

          {saved.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
              <Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">You haven&apos;t saved any commissions yet.</p>
              <Link href="/browse" className="btn-primary mt-4 inline-flex">Browse openings</Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saved.map((s) => (
                <article key={s.id} className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
                  {s.commission.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.commission.coverImageUrl} alt="" className="h-32 w-full object-cover" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className={`pill ${CAT_PILL[s.commission.category] ?? "bg-slate-500 text-white"}`}>
                        {s.commission.category.replace("_", " ")}
                      </span>
                      <BookmarkButton commissionId={s.commission.id} initialSaved={true} size="sm" />
                    </div>
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold">{s.commission.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">{s.commission.description}</p>
                    <p className="mb-3 text-base font-bold text-brand-600">{fareDisplay(s.commission)}</p>
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

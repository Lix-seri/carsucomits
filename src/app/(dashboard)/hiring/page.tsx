import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getCommissionerHome } from "@/features/hub/server";
import { ApplicantRow } from "@/features/applications/applicant-row";
import { ListingsTable } from "@/features/commissions/listings-table";

export const metadata = { title: "Hiring" };

export default async function HiringHome() {
  const session = await pageSession();
  const { activeListings, totalApplicants, completedTasks, listings, recentApplicants, ratingMap, jobsMap } = await getCommissionerHome(session);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        title="Hiring"
        description="Commissions you posted, and the students who applied."
        actions={<Link href="/hiring/post" className="btn-primary"><Plus className="h-4 w-4" /> Post a commission</Link>}
      />

      <p className="board rounded-3xl border-4 border-board-deep px-5 py-4 font-display text-lg font-bold sm:text-xl">
        <span className="text-gold-400">{activeListings}</span> on the board ·{" "}
        <span className="text-gold-400">{totalApplicants}</span> applicant{totalApplicants === 1 ? "" : "s"} so far ·{" "}
        <span className="text-gold-400">{completedTasks}</span> done
      </p>

      <section aria-labelledby="waiting">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="waiting" className="font-display text-xl font-bold">Waiting for your decision</h2>
          <Link href="/hiring/applicants" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            All applicants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentApplicants.length === 0 ? (
          <EmptyState pose="sleep" title="No one is waiting on you">
            New applicants show up here with their rating, skills and cover letter.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {recentApplicants.map((a) => (
              <ApplicantRow key={a.id} a={a} avg={ratingMap.get(a.applicantId)} activeJobs={jobsMap.get(a.applicantId)} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="active">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="active" className="font-display text-xl font-bold">Active commissions</h2>
          <Link href="/hiring/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            All your commissions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {listings.length === 0 ? (
          <EmptyState pose="hold" title="Nothing on the board from you" action={<Link href="/hiring/post" className="btn-primary">Post a commission</Link>}>
            Post what you need done; classmates apply and you pick one.
          </EmptyState>
        ) : (
          <div className="rounded-3xl border-2 border-line bg-surface px-4 sm:px-5">
            <ListingsTable listings={listings} />
          </div>
        )}
      </section>
    </div>
  );
}

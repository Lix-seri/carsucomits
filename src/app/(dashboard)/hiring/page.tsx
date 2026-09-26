import Link from "next/link";
import { ArrowRight, Megaphone, Plus, Users } from "lucide-react";
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
  const numbers: [string, number][] = [["Active", activeListings], ["Applicants", totalApplicants], ["Completed", completedTasks]];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        title="Hiring"
        description="Commissions you posted, and the students who applied."
        actions={<Link href="/commissioner/post" className="btn-primary"><Plus className="h-4 w-4" /> Post a commission</Link>}
      />

      <dl className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-white">
        {numbers.map(([label, value]) => (
          <div key={label} className="px-4 py-4">
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className="tabular mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="waiting">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="waiting" className="text-lg font-semibold">Waiting for your decision</h2>
          <Link href="/commissioner/applicants" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            All applicants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentApplicants.length === 0 ? (
          <EmptyState icon={Users} title="No one is waiting">
            New applicants show up here, with their rating and cover letter.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
            {recentApplicants.map((a) => (
              <ApplicantRow key={a.id} a={a} avg={ratingMap.get(a.applicantId)} activeJobs={jobsMap.get(a.applicantId)} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="active">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="active" className="text-lg font-semibold">Active commissions</h2>
          <Link href="/commissioner/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            All your commissions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {listings.length === 0 ? (
          <EmptyState icon={Megaphone} title="Nothing active" action={<Link href="/commissioner/post" className="btn-secondary">Post a commission</Link>}>
            Post what you need done; students apply and you pick one.
          </EmptyState>
        ) : (
          <div className="rounded-xl border border-line bg-white px-4 sm:px-5">
            <ListingsTable listings={listings} />
          </div>
        )}
      </section>
    </div>
  );
}

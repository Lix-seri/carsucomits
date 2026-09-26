import Link from "next/link";
import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listApplicantsForMe } from "@/features/applications/server";
import { ApplicantRow } from "@/features/applications/applicant-row";

export const metadata = { title: "Applicants" };

export default async function ApplicantsPage({ searchParams }: { searchParams: Promise<{ commissionId?: string }> }) {
  const session = await pageSession();
  const { commissionId } = await searchParams;
  const { applications, avgRating, activeJobs } = await listApplicantsForMe(session, { commissionId });
  const only = commissionId ? applications[0]?.commission.title : null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Applicants"
        description={
          only ? (
            <>
              For <span className="font-medium text-ink">{only}</span>.{" "}
              <Link href="/hiring/applicants" className="font-semibold text-brand-700 hover:underline">Show all</Link>
            </>
          ) : (
            "Everyone who applied to your commissions."
          )
        }
      />
      {applications.length === 0 ? (
        <EmptyState pose="sleep" title="No applicants yet" action={<Link href="/browse" className="btn-secondary">See what others posted</Link>}>
          When classmates apply, you&apos;ll see their rating, skills and cover letter here. Hire one to start the agreement.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {applications.map((a) => (
            <ApplicantRow key={a.id} a={a} avg={avgRating.get(a.applicantId)} activeJobs={activeJobs.get(a.applicantId)} showCommission={!commissionId} />
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { Users } from "lucide-react";
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
              <Link href="/commissioner/applicants" className="font-semibold text-brand-700 hover:underline">Show all</Link>
            </>
          ) : (
            "Everyone who applied to your commissions."
          )
        }
      />
      {applications.length === 0 ? (
        <EmptyState icon={Users} title="No applications yet">
          When students apply, you&apos;ll see their rating and cover letter here, and accept one to start the work.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {applications.map((a) => (
            <ApplicantRow key={a.id} a={a} avg={avgRating.get(a.applicantId)} activeJobs={activeJobs.get(a.applicantId)} showCommission={!commissionId} />
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { Star } from "lucide-react";
import { pageSession } from "@/lib/session";
import { listApplicantsForMe } from "@/features/applications/server";
import { Avatar } from "@/components/ui/avatar";
import { ApplicantDecisionButtons } from "@/features/applications/applicant-decision-buttons";

export default async function ApplicantsPage({
  searchParams,
}: { searchParams: Promise<{ commissionId?: string }> }) {
  const session = await pageSession();
  const { commissionId } = await searchParams;

  const { applications, avgRating: ratingMap } = await listApplicantsForMe(session, { commissionId });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">All Applicants</h1>
        <p className="text-sm text-muted">Review applications across your commissions.</p>
      </div>

      {applications.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-4 py-12 text-center text-muted shadow-card">
          No applications yet. Once students apply to your commissions, they&apos;ll show up here.
        </p>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <ul className="space-y-2">
            {applications.map((a) => {
              const avg = ratingMap.get(a.applicantId);
              return (
                <li key={a.id} className="flex items-center justify-between rounded-lg bg-sunken p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/u/${a.applicant.id}`} className="shrink-0">
                      <Avatar name={a.applicant.fullName} src={a.applicant.avatarUrl} size="sm" />
                    </Link>
                    <div>
                      <Link href={`/u/${a.applicant.id}`} className="text-sm font-semibold hover:text-brand-600 hover:underline">
                        {a.applicant.fullName}
                      </Link>
                      <p className="text-xs text-muted">
                        {avg != null ? <><Star className="mr-1 inline h-3 w-3 fill-warning-400 text-warning-400" /> {avg.toFixed(1)}</> : "No reviews yet"}
                        <span className="mx-1">·</span>
                        for <Link href={`/commission/${a.commission.id}`} className="text-brand-600 hover:underline">{a.commission.title}</Link>
                        <span className="mx-1">·</span>
                        <span className={`pill ml-1 ${
                          a.status === "PENDING" ? "bg-warning-100 text-warning-700" :
                          a.status === "ACCEPTED" ? "bg-brand-100 text-brand-700" :
                          a.status === "REJECTED" ? "bg-danger-100 text-danger-700" : "bg-sunken text-ink"
                        }`}>{a.status}</span>
                      </p>
                      {a.coverLetter && <p className="mt-1 text-xs italic text-muted">&ldquo;{a.coverLetter}&rdquo;</p>}
                    </div>
                  </div>
                  {a.status === "PENDING" && a.commission.status === "OPEN" && (
                    <ApplicantDecisionButtons applicationId={a.id} applicantName={a.applicant.fullName} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

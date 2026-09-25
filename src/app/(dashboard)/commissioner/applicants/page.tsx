/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
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
        <p className="text-sm text-slate-500">Review applications across your commissions.</p>
      </div>

      {applications.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-500 shadow-card">
          No applications yet. Once students apply to your commissions, they&apos;ll show up here.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <ul className="space-y-2">
            {applications.map((a) => {
              const avg = ratingMap.get(a.applicantId);
              return (
                <li key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/u/${a.applicant.id}`} className="shrink-0">
                      <Avatar name={a.applicant.fullName} src={a.applicant.avatarUrl} size="sm" />
                    </Link>
                    <div>
                      <Link href={`/u/${a.applicant.id}`} className="text-sm font-semibold hover:text-brand-600 hover:underline">
                        {a.applicant.fullName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {avg != null ? <><Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400" /> {avg.toFixed(1)}</> : "No reviews yet"}
                        <span className="mx-1">·</span>
                        for <Link href={`/commission/${a.commission.id}`} className="text-brand-600 hover:underline">{a.commission.title}</Link>
                        <span className="mx-1">·</span>
                        <span className={`pill ml-1 ${
                          a.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          a.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                          a.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                        }`}>{a.status}</span>
                      </p>
                      {a.coverLetter && <p className="mt-1 text-xs italic text-slate-600">&ldquo;{a.coverLetter}&rdquo;</p>}
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

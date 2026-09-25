import Link from "next/link";
import { ClipboardList, Users, CheckCircle2, Plus, Eye, Star } from "lucide-react";
import { pageSession } from "@/lib/session";
import { getCommissionerHome } from "@/features/hub/server";
import { Avatar } from "@/components/ui/avatar";
import { ApplicantDecisionButtons } from "@/features/applications/applicant-decision-buttons";
import { greeting } from "@/lib/format";
import { Kpi } from "@/components/ui/kpi";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-brand-50 text-brand-700",
  TECHNICAL: "bg-info-50 text-info-700",
  GENERAL_ERRANDS: "bg-warning-50 text-warning-700",
  ADMINISTRATIVE: "bg-info-50 text-info-700",
};
const STATUS_PILL: Record<string, string> = {
  OPEN: "bg-brand-50 text-brand-700",
  IN_PROGRESS: "bg-warning-50 text-warning-700",
  COMPLETED: "bg-sunken text-ink",
  CANCELLED: "bg-danger-50 text-danger-700",
};

export default async function CommissionerHome() {
  const session = await pageSession();
  const firstName = session.fullName.split(" ")[0];

  const { activeListings, totalApplicants, completedTasks, listings, recentApplicants, ratingMap } = await getCommissionerHome(session);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{greeting()}, {firstName}!</h1>
        <p className="text-sm text-muted">Here&apos;s what&apos;s happening with your commissions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Active Listings" value={activeListings} icon={ClipboardList} color="text-brand-600 bg-brand-50" />
        <Kpi label="Total Applicants" value={totalApplicants} icon={Users} color="text-brand-600 bg-brand-50" />
        <Kpi label="Completed Tasks" value={completedTasks} icon={CheckCircle2} color="text-brand-600 bg-brand-50" />
      </div>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">My Active Listings</h2>
          <Link href="/commissioner/post" className="btn-primary !py-2"><Plus className="h-4 w-4" /> Post New</Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">
            No active listings. Click <strong>Post New</strong> to create one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-2 font-semibold">Task Title</th>
                  <th className="py-2 font-semibold">Category</th>
                  <th className="py-2 font-semibold">Applicants</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 font-medium">{l.title}</td>
                    <td className="py-3"><span className={`pill ${CAT_PILL[l.category] ?? "bg-sunken text-ink"}`}>{l.category.replace("_", " ")}</span></td>
                    <td className="py-3">{l._count.applications}</td>
                    <td className="py-3"><span className={`pill ${STATUS_PILL[l.status]}`}>{l.status.replace("_", " ")}</span></td>
                    <td className="py-3">
                      <Link href={`/commission/${l.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"><Eye className="h-3.5 w-3.5" /> View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Pending Applicants</h2>
        {recentApplicants.length === 0 ? (
          <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">
            No pending applicants right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentApplicants.map((a) => {
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
                        {avg != null ? <><Star className="mr-1 inline h-3 w-3 fill-warning-400 text-warning-400" /> {avg.toFixed(1)}</> : <span>No reviews yet</span>}
                        <span className="mx-1">·</span>
                        Applied to <Link href={`/commission/${a.commission.id}`} className="text-brand-600 hover:underline">{a.commission.title}</Link>
                      </p>
                      {a.coverLetter && <p className="mt-1 text-xs italic text-muted">&ldquo;{a.coverLetter}&rdquo;</p>}
                    </div>
                  </div>
                  <ApplicantDecisionButtons applicationId={a.id} applicantName={a.applicant.fullName} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}


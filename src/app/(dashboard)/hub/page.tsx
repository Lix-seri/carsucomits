import Link from "next/link";
import { Star } from "lucide-react";
import { pageSession } from "@/lib/session";
import { getHub } from "@/features/hub/server";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { RateNowButton } from "@/features/ratings/rate-now-button";
import { RateCommissionerButton } from "@/features/ratings/rate-commissioner-button";
import { WithdrawButton } from "@/features/applications/withdraw-button";
import { formatFare } from "@/lib/format";

const STATUS_PILL: Record<string, string> = {
  OPEN: "bg-brand-50 text-brand-700",
  IN_PROGRESS: "bg-warning-100 text-warning-700",
  AWAITING_REVIEW: "bg-info-100 text-info-700",
  COMPLETED: "bg-sunken text-ink",
  CANCELLED: "bg-danger-100 text-danger-700",
};
const APP_STATUS_PILL: Record<string, string> = {
  PENDING: "bg-warning-100 text-warning-700",
  ACCEPTED: "bg-brand-100 text-brand-700",
  REJECTED: "bg-danger-100 text-danger-700",
  WITHDRAWN: "bg-sunken text-ink",
};

export default async function HubPage() {
  const session = await pageSession();
  const { doing, posted, applications, unratedCompleted, completedAsStudent, awardedMap } = await getHub(session);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">My Hub</h1>
        <p className="text-sm text-muted">Welcome back, {session.fullName}. Track your hiring and doing activities.</p>
      </header>

      {unratedCompleted.length > 0 && (
        <section className="rounded-xl border border-warning-200 bg-warning-50 p-5">
          <div className="mb-3 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning-200 text-warning-700">
              <Star className="h-5 w-5 fill-warning-500" />
            </div>
            <div>
              <h2 className="font-bold text-warning-800">
                {unratedCompleted.length} pending rating{unratedCompleted.length === 1 ? "" : "s"}
              </h2>
              <p className="text-sm text-warning-800">
                You completed {unratedCompleted.length === 1 ? "a commission" : "these commissions"} without rating the student. Please rate them now to keep the marketplace trustworthy.
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {unratedCompleted.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
                <div>
                  <Link href={`/commission/${c.id}`} className="text-sm font-semibold hover:text-brand-600">{c.title}</Link>
                  <p className="text-xs text-muted">
                    Completed by {c.awardedToId ? (awardedMap.get(c.awardedToId) ?? "the student") : "the student"}
                  </p>
                </div>
                {c.awardedToId && (
                  <RateNowButton
                    commissionId={c.id}
                    commissionTitle={c.title}
                    rateeName={awardedMap.get(c.awardedToId) ?? "the student"}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">⚡ Tasks I&apos;m Doing</h2>
        {doing.length === 0 ? (
          <p className="rounded-xl border border-line bg-white px-4 py-6 text-center text-sm text-muted">
            You&apos;re not assigned to any active commissions. Browse openings to apply.
          </p>
        ) : (
          <ul className="space-y-3">
            {doing.map((t) => (
              <li key={t.id} className="rounded-xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted">For {t.commissioner.fullName}</p>
                    <Link href={`/commission/${t.id}`} className="text-base font-bold hover:text-brand-600">{t.title}</Link>
                  </div>
                  <span className={`pill ${STATUS_PILL[t.status]}`}>{t.status.replace("_", " ")}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div><p className="text-muted">Fare</p><p className="font-bold text-brand-600">{formatFare(t)}</p></div>
                  <div><p className="text-muted">Deadline</p><p className="font-semibold">{t.deadline ? new Date(t.deadline).toLocaleDateString() : "—"}</p></div>
                  <div><p className="text-muted">Skill</p><p className="font-semibold">{t.requiredLevel}</p></div>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Coordinate with the commissioner via <Link href="/messages" className="text-brand-600 hover:underline">Messages</Link>.
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">🪧 Tasks I Posted</h2>
        {posted.length === 0 ? (
          <p className="rounded-xl border border-line bg-white px-4 py-6 text-center text-sm text-muted">
            You haven&apos;t posted any commissions yet. <Link href="/commissioner/post" className="text-brand-600 hover:underline">Post your first one</Link>.
          </p>
        ) : (
          <ul className="space-y-3">
            {posted.map((t) => (
              <li key={t.id} className="rounded-xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/commission/${t.id}`} className="text-base font-bold hover:text-brand-600">{t.title}</Link>
                    <p className="text-xs text-muted">
                      {t._count.applications} applicant{t._count.applications === 1 ? "" : "s"}
                      {t.awardedToId && <> · Awarded to <strong>{awardedMap.get(t.awardedToId) ?? "applicant"}</strong></>}
                    </p>
                  </div>
                  <span className={`pill ${STATUS_PILL[t.status]}`}>{t.status.replace("_", " ")}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div><p className="text-muted">Fare</p><p className="font-bold text-brand-600">{formatFare(t)}</p></div>
                  <div><p className="text-muted">Deadline</p><p className="font-semibold">{t.deadline ? new Date(t.deadline).toLocaleDateString() : "—"}</p></div>
                  <div><p className="text-muted">Posted</p><p className="font-semibold">{new Date(t.createdAt).toLocaleDateString()}</p></div>
                </div>

                <div className="mt-3 flex gap-2">
                  {t.status === "OPEN" && (
                    <Link href={`/commissioner/applicants?commissionId=${t.id}`} className="btn-primary flex-1">
                      Review Applicants ({t._count.applications})
                    </Link>
                  )}
                  {(t.status === "IN_PROGRESS" || t.status === "AWAITING_REVIEW") && t.awardedToId && (
                    <MarkCompleteButton
                      commissionId={t.id}
                      commissionTitle={t.title}
                      awardedToName={awardedMap.get(t.awardedToId) ?? "the student"}
                    />
                  )}
                  {t.status === "COMPLETED" && (
                    <Link href={`/commission/${t.id}`} className="flex-1 rounded-lg border border-line py-2 text-center text-sm font-semibold hover:bg-sunken">
                      View completed
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">📨 My Applications</h2>
        {applications.length === 0 ? (
          <p className="rounded-xl border border-line bg-white px-4 py-6 text-center text-sm text-muted">
            You haven&apos;t applied to any commissions yet.
          </p>
        ) : (
          <ul className="space-y-2 rounded-xl border border-line bg-white p-3 shadow-card">
            {applications.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg p-3 hover:bg-sunken">
                <Link href={`/commission/${a.commission.id}`} className="flex-1 truncate text-sm font-semibold hover:text-brand-600">
                  {a.commission.title}
                </Link>
                <div className="flex items-center gap-2">
                  <span className={`pill ${APP_STATUS_PILL[a.status] ?? "bg-sunken"}`}>{a.status}</span>
                  {a.status === "PENDING" && a.commission.status === "OPEN" && (
                    <WithdrawButton applicationId={a.id} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {completedAsStudent.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">⭐ Rate your commissioners</h2>
          <p className="mb-3 text-xs text-muted">You worked on these commissions but haven&apos;t rated the commissioner yet. Your rating helps other students.</p>
          <ul className="space-y-2 rounded-xl border border-warning-200 bg-warning-50/40 p-3">
            {completedAsStudent.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
                <div>
                  <Link href={`/commission/${c.id}`} className="text-sm font-semibold hover:text-brand-600">{c.title}</Link>
                  <p className="text-xs text-muted">Completed with {c.commissioner.fullName}</p>
                </div>
                <RateCommissionerButton
                  commissionId={c.id}
                  commissionTitle={c.title}
                  commissionerName={c.commissioner.fullName}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

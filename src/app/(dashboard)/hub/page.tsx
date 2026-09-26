import Link from "next/link";
import { Briefcase, Megaphone, Send, Star } from "lucide-react";
import { pageSession } from "@/lib/session";
import { dueLabel, formatFare } from "@/lib/format";
import { ApplicationStatusBadge, CommissionStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getHub } from "@/features/hub/server";
import { CommissionProgress } from "@/features/commissions/commission-progress";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { RateNowButton } from "@/features/ratings/rate-now-button";
import { RateCommissionerButton } from "@/features/ratings/rate-commissioner-button";
import { WithdrawButton } from "@/features/applications/withdraw-button";

export const metadata = { title: "My hub" };

const due = (d: Date | null) => dueLabel(d);

function Section({ id, icon: Icon, title, count, children }: { id: string; icon: typeof Briefcase; title: string; count?: number; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-36">
      <h2 id={id} className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
        <Icon aria-hidden className="h-5 w-5 text-muted" /> {title}
        {count !== undefined && <span className="tabular rounded-full bg-sunken px-2 text-sm font-semibold text-muted">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

export default async function HubPage() {
  const session = await pageSession();
  const { doing, posted, applications, unratedCompleted, completedAsStudent, awardedMap } = await getHub(session);
  const toRate = unratedCompleted.length + completedAsStudent.length;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader title="My hub" description="Everything you're doing, hiring for, and waiting on." />

      <nav aria-label="Hub sections" className="sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-canvas px-4 py-3 sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        {[
          ["#doing", "Doing", doing.length],
          ["#hiring", "Hiring", posted.length],
          ["#applications", "Applications", applications.length],
        ].map(([href, label, n]) => (
          <a key={href} href={String(href)} className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-line-strong bg-surface px-4 py-1.5 text-sm font-semibold hover:border-brand-300">
            {label} <span className="tabular rounded-full bg-brand-50 px-1.5 text-xs text-brand-700">{n}</span>
          </a>
        ))}
      </nav>

      {toRate > 0 && (
        <section aria-labelledby="to-rate" className="rounded-3xl border-2 border-gold-300 bg-gold-50 p-5">
          <h2 id="to-rate" className="flex items-center gap-2 font-display text-lg font-bold text-warning-800">
            <Star className="h-5 w-5 fill-warning-400 text-warning-500" /> {toRate} rating{toRate === 1 ? "" : "s"} to give
          </h2>
          <p className="mt-1 text-sm text-warning-800">Ratings are how students here decide who to trust.</p>
          <ul className="mt-4 space-y-2">
            {unratedCompleted.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 rounded-lg bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/commission/${c.id}`} className="font-semibold hover:text-brand-700">{c.title}</Link>
                  <p className="text-sm text-muted">Done by {c.awardedToId ? (awardedMap.get(c.awardedToId) ?? "the student") : "the student"}</p>
                </div>
                {c.awardedToId && <RateNowButton commissionId={c.id} commissionTitle={c.title} rateeName={awardedMap.get(c.awardedToId) ?? "the student"} />}
              </li>
            ))}
            {completedAsStudent.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 rounded-lg bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/commission/${c.id}`} className="font-semibold hover:text-brand-700">{c.title}</Link>
                  <p className="text-sm text-muted">Posted by {c.commissioner.fullName}</p>
                </div>
                <RateCommissionerButton commissionId={c.id} commissionTitle={c.title} commissionerName={c.commissioner.fullName} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Section id="doing" icon={Briefcase} title="Doing" count={doing.length}>
        {doing.length === 0 ? (
          <EmptyState pose="search" title="No jobs in progress" action={<Link href="/browse" className="btn-primary">Browse the board</Link>}>
            When a poster hires you, the job, the agreement and your deliveries live here.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {doing.map((t) => (
              <li key={t.id} className="rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/commission/${t.id}`} className="font-semibold hover:text-brand-700">{t.title}</Link>
                    <p className="text-sm text-muted">For {t.commissioner.fullName} · {due(t.deadline)}</p>
                  </div>
                  <p className="font-display text-xl font-extrabold tabular text-brand-700">{formatFare(t)}</p>
                </div>
                <div className="mt-4"><CommissionProgress status={t.status} /></div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/commission/${t.id}`} className="btn-secondary btn-sm">Open workspace</Link>
                  <Link href={`/messages?with=${t.commissioner.id}`} className="btn-ghost btn-sm">Message {t.commissioner.fullName.split(" ")[0]}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="hiring" icon={Megaphone} title="Hiring" count={posted.length}>
        {posted.length === 0 ? (
          <EmptyState pose="hold" title="Nothing posted yet" action={<Link href="/hiring/post" className="btn-primary">Post a commission</Link>}>
            Post what you need done and classmates will apply. You choose who does it.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {posted.map((t) => (
              <li key={t.id} className="rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1"><CommissionStatusBadge status={t.status} /></div>
                    <Link href={`/commission/${t.id}`} className="font-semibold hover:text-brand-700">{t.title}</Link>
                    <p className="text-sm text-muted">
                      {t._count.applications} applicant{t._count.applications === 1 ? "" : "s"}
                      {t.awardedToId && <> · Doing it: <span className="font-medium text-ink">{awardedMap.get(t.awardedToId) ?? "a student"}</span></>}
                      {" · "}{due(t.deadline)}
                    </p>
                  </div>
                  <p className="font-display text-xl font-extrabold tabular text-brand-700">{formatFare(t)}</p>
                </div>
                <div className="mt-4"><CommissionProgress status={t.status} /></div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {t.status === "OPEN" && (
                    <Link href={`/hiring/applicants?commissionId=${t.id}`} className={t._count.applications > 0 ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
                      Review applicants ({t._count.applications})
                    </Link>
                  )}
                  {(t.status === "IN_PROGRESS" || t.status === "AWAITING_REVIEW") && t.awardedToId && (
                    <div className="w-full sm:w-auto">
                      <MarkCompleteButton commissionId={t.id} commissionTitle={t.title} awardedToName={awardedMap.get(t.awardedToId) ?? "the student"} />
                    </div>
                  )}
                  {t.status !== "OPEN" && <Link href={`/commission/${t.id}`} className="btn-ghost btn-sm">View</Link>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="applications" icon={Send} title="Applications" count={applications.length}>
        {applications.length === 0 ? (
          <EmptyState pose="wave" title="No applications yet" action={<Link href="/browse" className="btn-primary">Find work</Link>}>
            Sige, try one. Apply from Browse; you can withdraw while it&apos;s pending.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-3xl border-2 border-line bg-surface">
            {applications.map((a) => (
              <li key={a.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/commission/${a.commission.id}`} className="min-w-0 font-medium hover:text-brand-700">{a.commission.title}</Link>
                <div className="flex shrink-0 items-center gap-2">
                  <ApplicationStatusBadge status={a.status} />
                  {a.status === "PENDING" && a.commission.status === "OPEN" && <WithdrawButton applicationId={a.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

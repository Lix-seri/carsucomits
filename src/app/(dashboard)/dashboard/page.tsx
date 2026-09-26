import Link from "next/link";
import { ArrowRight, Briefcase, Megaphone, Search } from "lucide-react";
import { pageSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/labels";
import { CAMPUS_TZ, formatFare, greeting } from "@/lib/format";
import { CategoryBadge, CommissionStatusBadge, LevelBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboard } from "@/features/hub/server";
import { ProfileCard } from "@/features/profile/profile-card";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { CommissionProgress } from "@/features/commissions/commission-progress";

export const metadata = { title: "Home" };

const due = (d: Date | null) => (d ? new Date(d).toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: CAMPUS_TZ }) : "No deadline");

export default async function DashboardHome() {
  const session = await pageSession();
  const firstName = session.fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: CAMPUS_TZ });
  const { skills, stats, featured, doingTask, postedTask, applicantsWaiting, awardedToName } = await getDashboard(session);

  // One next step, instead of a row of counters.
  const nextStep =
    applicantsWaiting > 0 ? (
      <>
        <Link href="/hiring/applicants" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          {applicantsWaiting} applicant{applicantsWaiting === 1 ? " is" : "s are"} waiting
        </Link>{" "}
        for a decision on your commissions.
      </>
    ) : doingTask ? (
      <>You&apos;re working on <span className="font-semibold text-ink">{doingTask.title}</span>.</>
    ) : (
      <>Find work on Browse, or post something you need done.</>
    );

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-content-aside">
      <div className="min-w-0 space-y-8">
        <header>
          <p className="text-sm text-muted">{today}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-2 text-muted">{nextStep}</p>
        </header>

        <section aria-labelledby="your-work">
          <h2 id="your-work" className="mb-3 text-lg font-semibold">Your work</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-line bg-surface p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted"><Briefcase className="h-4 w-4" /> Doing</p>
              {doingTask ? (
                <>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <Link href={`/commission/${doingTask.id}`} className="font-semibold leading-snug hover:text-brand-700">{doingTask.title}</Link>
                    <CommissionStatusBadge status={doingTask.status} />
                  </div>
                  <p className="text-sm text-muted">For {doingTask.commissioner.fullName} · Due {due(doingTask.deadline)}</p>
                  <p className="tabular mt-1 font-semibold text-brand-700">{formatFare(doingTask)}</p>
                  <div className="mt-4"><CommissionProgress status={doingTask.status} /></div>
                  <Link href={`/commission/${doingTask.id}`} className="btn-secondary mt-4 w-full">Open workspace</Link>
                </>
              ) : (
                <EmptyState icon={Search} title="Nothing in progress" action={<Link href="/browse" className="btn-secondary">Browse commissions</Link>}>
                  When a poster accepts your application, the job shows up here.
                </EmptyState>
              )}
            </div>

            <div className="flex flex-col rounded-xl border border-line bg-surface p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted"><Megaphone className="h-4 w-4" /> Hiring</p>
              {postedTask ? (
                <>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <Link href={`/commission/${postedTask.id}`} className="font-semibold leading-snug hover:text-brand-700">{postedTask.title}</Link>
                    <CommissionStatusBadge status={postedTask.status} />
                  </div>
                  <p className="text-sm text-muted">
                    {postedTask._count.applications} applicant{postedTask._count.applications === 1 ? "" : "s"} · Due {due(postedTask.deadline)}
                  </p>
                  <p className="tabular mt-1 font-semibold text-brand-700">{formatFare(postedTask)}</p>
                  <div className="mt-4"><CommissionProgress status={postedTask.status} /></div>
                  <div className="mt-4">
                    {postedTask.status === "OPEN" ? (
                      <Link
                        href={`/hiring/applicants?commissionId=${postedTask.id}`}
                        className={postedTask._count.applications > 0 ? "btn-primary w-full" : "btn-secondary w-full"}
                      >
                        Review applicants ({postedTask._count.applications})
                      </Link>
                    ) : postedTask.awardedToId ? (
                      <MarkCompleteButton commissionId={postedTask.id} commissionTitle={postedTask.title} awardedToName={awardedToName} />
                    ) : null}
                  </div>
                </>
              ) : (
                <EmptyState icon={Megaphone} title="You haven't posted anything" action={<Link href="/hiring/post" className="btn-secondary">Post a commission</Link>}>
                  Need a poster, a website fix, or an errand run? Post it and students will apply.
                </EmptyState>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="new-work">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 id="new-work" className="text-lg font-semibold">New on the marketplace</h2>
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featured.length === 0 ? (
            <EmptyState icon={Search} title="No open commissions right now" action={<Link href="/hiring/post" className="btn-secondary">Post the first one</Link>} />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {featured.map((f) => (
                <li key={f.id}>
                  <Link href={`/commission/${f.id}`} className="flex flex-col gap-3 p-4 transition-colors hover:bg-sunken sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        <CategoryBadge category={f.category} />
                        <LevelBadge level={f.requiredLevel} />
                      </div>
                      <p className="line-clamp-2 font-semibold leading-snug">{f.title}</p>
                      <p className="mt-0.5 text-sm text-muted">Posted by {f.commissioner.fullName}</p>
                    </div>
                    <p className="tabular shrink-0 text-lg font-semibold text-brand-700">{formatFare(f)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="hidden xl:block">
        <ProfileCard
          user={{
            fullName: session.fullName,
            role: ROLE_LABEL[session.role],
            rating: stats.rating,
            reviews: stats.reviewCount,
            done: stats.done,
            posted: stats.posted,
            rate: stats.successRate,
            avatarUrl: session.avatarUrl,
          }}
          skills={skills}
        />
      </aside>
    </div>
  );
}

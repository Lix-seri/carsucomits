import Link from "next/link";
import { ArrowRight, Briefcase, Clock, Megaphone } from "lucide-react";
import { pageSession } from "@/lib/session";
import { CAMPUS_TZ, dueLabel, formatFare, greeting, partOfDay } from "@/lib/format";
import { CommissionStatusBadge } from "@/components/ui/badge";
import { CategoryIcon, LevelPips } from "@/components/ui/category";
import { EmptyState } from "@/components/ui/empty-state";
import { DayArt } from "@/components/illustrations/day";
import { Tisa } from "@/components/illustrations/tisa";
import { getDashboard } from "@/features/hub/server";
import { ProfileProgress } from "@/features/profile/profile-progress";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { CommissionProgress } from "@/features/commissions/commission-progress";

export const metadata = { title: "Home" };

function WorkCard({ icon: Icon, label, children }: { icon: typeof Briefcase; label: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="flex flex-col rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-muted"><Icon aria-hidden className="h-4 w-4" /> {label}</p>
      {children}
    </section>
  );
}

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const welcome = (await searchParams).welcome === "1";
  const session = await pageSession();
  const firstName = session.fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: CAMPUS_TZ });
  const { skills, stats, featured, suggestedBySkills, doingTask, postedTask, applicantsWaiting, awardedToName } = await getDashboard(session);

  // One next step, instead of a row of counters.
  const nextStep =
    applicantsWaiting > 0 ? (
      <>
        <Link href="/hiring/applicants" className="font-semibold text-brand-700 underline">
          {applicantsWaiting} applicant{applicantsWaiting === 1 ? " is" : "s are"} waiting
        </Link>{" "}
        for your decision.
      </>
    ) : doingTask ? (
      <>You&apos;re working on <span className="font-semibold text-ink">{doingTask.title}</span>.</>
    ) : (
      <>Find something on the board you&apos;re good at, or post what you need done.</>
    );

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 xl:grid-cols-content-aside">
      <div className="min-w-0 space-y-8">
        {welcome && (
          <section aria-label="Welcome" className="board flex flex-col items-start gap-4 rounded-3xl border-4 border-board-deep p-5 sm:flex-row sm:items-center">
            <Tisa pose="cheer" className="h-24 w-24 shrink-0" />
            <div>
              <p className="display text-2xl text-board-chalk">Welcome to the board, {firstName}!</p>
              <p className="mt-1 text-board-dust">Start by getting CCIS-verified so you can take on work, or post what you need done.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/verify" className="btn bg-gold-400 text-on-gold hover:bg-gold-300">Get verified</Link>
                <Link href="/hiring/post" className="btn-chalk">Post a commission</Link>
              </div>
            </div>
          </section>
        )}
        <header className="flex items-center gap-5">
          <DayArt part={partOfDay()} className="hidden h-20 w-32 sm:block" />
          <div>
            <p className="text-sm text-muted">{today}</p>
            <h1 className="display mt-0.5 text-3xl sm:text-4xl">{greeting()}, {firstName}</h1>
            <p className="mt-1 text-muted">{nextStep}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <WorkCard icon={Briefcase} label="Doing">
            {doingTask ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/commission/${doingTask.id}`} className="font-display text-lg font-bold leading-snug hover:text-brand-700">{doingTask.title}</Link>
                  <CommissionStatusBadge status={doingTask.status} />
                </div>
                <p className="mt-1 text-sm text-muted">For {doingTask.commissioner.fullName} · {dueLabel(doingTask.deadline)}</p>
                <p className="mt-2 font-display text-xl font-extrabold tabular text-brand-700">{formatFare(doingTask)}</p>
                <div className="mt-5"><CommissionProgress status={doingTask.status} /></div>
                <Link href={`/commission/${doingTask.id}`} className="btn-secondary mt-5 w-full">Open the workspace</Link>
              </>
            ) : (
              <EmptyState compact pose="search" title="Nothing in progress" action={<Link href="/browse" className="btn-secondary">Browse the board</Link>}>
                Wala pa. When a poster hires you, the job shows up here.
              </EmptyState>
            )}
          </WorkCard>

          <WorkCard icon={Megaphone} label="Hiring">
            {postedTask ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/commission/${postedTask.id}`} className="font-display text-lg font-bold leading-snug hover:text-brand-700">{postedTask.title}</Link>
                  <CommissionStatusBadge status={postedTask.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {postedTask._count.applications === 0 ? "No applicants yet" : `${postedTask._count.applications} applicant${postedTask._count.applications === 1 ? "" : "s"}`}
                  {" · "}{dueLabel(postedTask.deadline)}
                </p>
                <p className="mt-2 font-display text-xl font-extrabold tabular text-brand-700">{formatFare(postedTask)}</p>
                <div className="mt-5"><CommissionProgress status={postedTask.status} /></div>
                <div className="mt-5">
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
              <EmptyState compact pose="hold" title="Nothing posted yet" action={<Link href="/hiring/post" className="btn-primary">Post a commission</Link>}>
                Need a poster, a website fix or an errand run? Post it and classmates will apply.
              </EmptyState>
            )}
          </WorkCard>
        </div>

        <section aria-labelledby="suggested">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 id="suggested" className="font-display text-xl font-bold">{suggestedBySkills ? "Picked for your skills" : "New on the board"}</h2>
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              See all <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          {featured.length === 0 ? (
            <EmptyState pose="sleep" title="The board is quiet right now" action={<Link href="/hiring/post" className="btn-primary">Post the first one</Link>}>
              Check back later, or be the one who posts.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {featured.map((f) => (
                <li key={f.id}>
                  <Link href={`/commission/${f.id}`} className="lift flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                    <CategoryIcon category={f.category} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold leading-snug">{f.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span>by {f.commissioner.fullName}</span>
                        <span className="inline-flex items-center gap-1"><Clock aria-hidden className="h-3.5 w-3.5" /> {dueLabel(f.deadline)}</span>
                        <LevelPips level={f.requiredLevel} showLabel={false} />
                      </p>
                      <p className="mt-2 font-display text-lg font-extrabold tabular text-brand-700 sm:hidden">{formatFare(f)}</p>
                    </div>
                    <span className="hidden shrink-0 rounded-xl bg-brand-50 px-3 py-1 font-display text-lg font-extrabold tabular text-brand-700 sm:inline">{formatFare(f)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-5">
        <ProfileProgress hasPhoto={!!session.avatarUrl} skillCount={skills.length} verified={session.verified} hasWork={stats.done + stats.posted > 0} />
        <section aria-label="Your numbers" className="grid grid-cols-3 gap-3">
          {[
            ["Done", stats.done],
            ["Posted", stats.posted],
            ["Rating", stats.rating != null ? stats.rating.toFixed(1) : "New"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-surface p-3 text-center">
              <p className="font-display text-2xl font-extrabold tabular">{value}</p>
              <p className="text-xs font-semibold text-muted">{label}</p>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

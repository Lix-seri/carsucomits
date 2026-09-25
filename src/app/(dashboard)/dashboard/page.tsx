import Link from "next/link";
import { Hand, TrendingUp, Users, Star, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import { ProfileCard } from "@/features/profile/profile-card";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { pageSession } from "@/lib/session";
import { getDashboard } from "@/features/hub/server";
import { ROLE_LABEL } from "@/lib/labels";
import { formatFare } from "@/lib/format";
import { CAMPUS_TZ, greeting } from "@/lib/format";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-brand-100 text-brand-700",
  TECHNICAL: "bg-info-100 text-info-700",
  GENERAL_ERRANDS: "bg-warning-100 text-warning-700",
  ADMINISTRATIVE: "bg-info-100 text-info-700",
};

export default async function DashboardHome() {
  const session = await pageSession();
  const fullName = session.fullName;
  const firstName = fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: CAMPUS_TZ });
  const hello = greeting();

  const { skills, stats, reviews, featured, doingTask, postedTask, inProgressCount, applicantsWaiting, awardedToName } = await getDashboard(session);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-content-aside">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-500 p-7 text-white shadow-soft">
          <p className="mb-1 text-xs font-medium opacity-90">{today}</p>
          <h1 className="text-3xl font-bold">{hello}, {firstName}! <Hand className="ml-1 inline h-7 w-7" /></h1>
          <p className="mt-1 opacity-90">
            {inProgressCount > 0 || applicantsWaiting > 0
              ? `You have ${inProgressCount} active task${inProgressCount === 1 ? "" : "s"} and ${applicantsWaiting} new applicant${applicantsWaiting === 1 ? "" : "s"} waiting.`
              : "Welcome back! Browse open commissions or post one of your own."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <TrendingUp className="h-3.5 w-3.5" /> {inProgressCount} In Progress
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <Users className="h-3.5 w-3.5" /> {applicantsWaiting} Applicants
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-warning-200 text-warning-200" /> {stats.rating != null ? `${stats.rating.toFixed(1)} Rating` : "No reviews yet"}
            </span>
          </div>
          <div className="absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-white/10" />
        </div>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">Featured Marketplace</h2>
              <p className="text-sm text-muted">Latest open commissions across CarsuComits</p>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">
              No open commissions right now. Be the first to <Link href="/commissioner/post" className="text-brand-600 hover:underline">post one</Link>.
            </p>
          ) : (
            <div className="space-y-3">
              {featured.map((f) => (
                <article key={f.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
                  <div className="flex items-start gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap gap-2">
                        <span className={`pill ${CAT_PILL[f.category] ?? "bg-sunken text-ink"}`}>{f.category.replace("_", " ")}</span>
                        <span className="pill bg-brand-50 text-brand-700">Open</span>
                      </div>
                      <h3 className="truncate text-base font-bold">{f.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted">{f.description}</p>
                      <p className="mt-1.5 text-xs text-muted">
                        Posted by {f.commissioner.fullName} · {f.requiredLevel}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between gap-3">
                      <p className="whitespace-nowrap text-lg font-bold text-brand-600">{formatFare(f)}</p>
                      <Link href={`/commission/${f.id}`} className="btn-primary !py-2">
                        View &amp; Apply <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3">
            <h2 className="flex items-center gap-2 text-xl font-bold">📋 My Hub</h2>
            <p className="text-sm text-muted">Track your hiring and doing activities</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="pill bg-info-100 text-info-700">⚡ Task I&apos;m Doing</span>
                <span className="pill bg-warning-100 text-warning-700">{doingTask ? doingTask.status.replace("_", " ") : "—"}</span>
              </div>
              {doingTask ? (
                <>
                  <Link href={`/commission/${doingTask.id}`} className="text-base font-bold hover:text-brand-600">{doingTask.title}</Link>
                  <p className="text-xs text-muted">For {doingTask.commissioner.fullName}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-muted">Fare</p><p className="font-bold text-brand-600">{formatFare(doingTask)}</p></div>
                    <div><p className="text-muted">Deadline</p><p className="font-semibold">{doingTask.deadline ? new Date(doingTask.deadline).toLocaleDateString() : "—"}</p></div>
                  </div>
                  <Link href="/hub" className="mt-3 block w-full rounded-lg border border-line py-2 text-center text-sm font-semibold hover:bg-sunken">
                    View in My Hub
                  </Link>
                </>
              ) : (
                <p className="rounded-lg bg-sunken px-3 py-6 text-center text-sm text-muted">
                  No active task. <Link href="/browse" className="text-brand-600 hover:underline">Browse openings</Link>.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="pill bg-info-100 text-info-700">🪧 Task I Posted</span>
                <span className={`pill ${postedTask?.status === "OPEN" ? "bg-brand-50 text-brand-700" : postedTask?.status === "IN_PROGRESS" ? "bg-warning-100 text-warning-700" : "bg-sunken text-ink"}`}>
                  {postedTask?.status.replace("_", " ") ?? "—"}
                </span>
              </div>
              {postedTask ? (
                <>
                  <Link href={`/commission/${postedTask.id}`} className="text-base font-bold hover:text-brand-600">{postedTask.title}</Link>
                  <p className="text-xs text-muted">{postedTask._count.applications} applicant{postedTask._count.applications === 1 ? "" : "s"}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-muted">Fare</p><p className="font-bold text-brand-600">{formatFare(postedTask)}</p></div>
                    <div><p className="text-muted">Deadline</p><p className="font-semibold">{postedTask.deadline ? new Date(postedTask.deadline).toLocaleDateString() : "—"}</p></div>
                  </div>
                  {postedTask.status === "OPEN" ? (
                    <Link href={`/commissioner/applicants?commissionId=${postedTask.id}`} className="btn-primary mt-3 w-full">
                      <Users className="h-4 w-4" /> Review Applicants
                    </Link>
                  ) : (postedTask.status === "IN_PROGRESS" || postedTask.status === "AWAITING_REVIEW") && postedTask.awardedToId ? (
                    <div className="mt-3">
                      <MarkCompleteButton
                        commissionId={postedTask.id}
                        commissionTitle={postedTask.title}
                        awardedToName={awardedToName}
                      />
                    </div>
                  ) : (
                    <Link href="/hub" className="mt-3 block w-full rounded-lg border border-line py-2 text-center text-sm font-semibold hover:bg-sunken">
                      <CheckCircle2 className="mr-1 inline h-4 w-4" /> View in My Hub
                    </Link>
                  )}
                </>
              ) : (
                <p className="rounded-lg bg-sunken px-3 py-6 text-center text-sm text-muted">
                  No posted commissions. <Link href="/commissioner/post" className="text-brand-600 hover:underline">Post one</Link>.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="hidden xl:block">
        <ProfileCard
          user={{
            fullName,
            role: ROLE_LABEL[session.role],
            rating: stats.rating,
            reviews: stats.reviewCount,
            done: stats.done,
            posted: stats.posted,
            rate: stats.successRate,
            avatarUrl: session.avatarUrl,
          }}
          skills={skills}
          reviews={reviews}
        />
      </div>
    </div>
  );
}

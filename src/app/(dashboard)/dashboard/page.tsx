import Link from "next/link";
import { Hand, TrendingUp, Users, Star, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import { ProfileCard } from "@/features/profile/profile-card";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { getSession } from "@/lib/session";
import { getDashboard } from "@/features/hub/server";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-emerald-100 text-emerald-700",
  TECHNICAL: "bg-blue-100 text-blue-700",
  GENERAL_ERRANDS: "bg-amber-100 text-amber-700",
  ADMINISTRATIVE: "bg-purple-100 text-purple-700",
};

function timeBasedGreeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function fareDisplay(c: { fareMin: number; fareMax: number | null; fareUnit: string | null }) {
  return c.fareMax ? `₱${c.fareMin}–${c.fareMax}${c.fareUnit ?? ""}` : `₱${c.fareMin}${c.fareUnit ?? ""}`;
}

export default async function DashboardHome() {
  const session = await getSession();
  const fullName = session?.fullName ?? "Guest";
  const firstName = fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const greeting = timeBasedGreeting();

  const { skills, stats, reviews, featured, doingTask, postedTask, inProgressCount, applicantsWaiting, awardedToName } = session
    ? await getDashboard(session)
    : {
        skills: [],
        stats: { done: 0, posted: 0, rating: null, reviewCount: 0, successRate: null },
        reviews: [],
        featured: [],
        doingTask: null,
        postedTask: null,
        inProgressCount: 0,
        applicantsWaiting: 0,
        awardedToName: "the student",
      };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 p-7 text-white shadow-soft">
          <p className="mb-1 text-xs font-medium opacity-90">{today}</p>
          <h1 className="text-3xl font-bold">{greeting}, {firstName}! <Hand className="ml-1 inline h-7 w-7" /></h1>
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
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> {stats.rating != null ? `${stats.rating.toFixed(1)} Rating` : "No reviews yet"}
            </span>
          </div>
          <div className="absolute -right-6 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-white/10" />
        </div>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">Featured Marketplace</h2>
              <p className="text-sm text-slate-500">Latest open commissions across CarsuComits</p>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No open commissions right now. Be the first to <Link href="/commissioner/post" className="text-brand-600 hover:underline">post one</Link>.
            </p>
          ) : (
            <div className="space-y-3">
              {featured.map((f) => (
                <article key={f.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
                  <div className="flex items-start gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap gap-2">
                        <span className={`pill ${CAT_PILL[f.category] ?? "bg-slate-100 text-slate-700"}`}>{f.category.replace("_", " ")}</span>
                        <span className="pill bg-emerald-50 text-emerald-700">Open</span>
                      </div>
                      <h3 className="truncate text-base font-bold">{f.title}</h3>
                      <p className="line-clamp-2 text-sm text-slate-600">{f.description}</p>
                      <p className="mt-1.5 text-xs text-slate-500">
                        Posted by {f.commissioner.fullName} · {f.requiredLevel}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between gap-3">
                      <p className="whitespace-nowrap text-lg font-bold text-brand-600">{fareDisplay(f)}</p>
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
            <p className="text-sm text-slate-500">Track your hiring and doing activities</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="pill bg-purple-100 text-purple-700">⚡ Task I&apos;m Doing</span>
                <span className="pill bg-amber-100 text-amber-700">{doingTask ? "In Progress" : "—"}</span>
              </div>
              {doingTask ? (
                <>
                  <Link href={`/commission/${doingTask.id}`} className="text-base font-bold hover:text-brand-600">{doingTask.title}</Link>
                  <p className="text-xs text-slate-500">For {doingTask.commissioner.fullName}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-slate-500">Fare</p><p className="font-bold text-brand-600">{fareDisplay(doingTask)}</p></div>
                    <div><p className="text-slate-500">Deadline</p><p className="font-semibold">{doingTask.deadline ? new Date(doingTask.deadline).toLocaleDateString() : "—"}</p></div>
                  </div>
                  <Link href="/hub" className="mt-3 block w-full rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold hover:bg-slate-50">
                    View in My Hub
                  </Link>
                </>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                  No active task. <Link href="/browse" className="text-brand-600 hover:underline">Browse openings</Link>.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="pill bg-purple-100 text-purple-700">🪧 Task I Posted</span>
                <span className={`pill ${postedTask?.status === "OPEN" ? "bg-emerald-50 text-emerald-700" : postedTask?.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                  {postedTask?.status.replace("_", " ") ?? "—"}
                </span>
              </div>
              {postedTask ? (
                <>
                  <Link href={`/commission/${postedTask.id}`} className="text-base font-bold hover:text-brand-600">{postedTask.title}</Link>
                  <p className="text-xs text-slate-500">{postedTask._count.applications} applicant{postedTask._count.applications === 1 ? "" : "s"}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-slate-500">Fare</p><p className="font-bold text-brand-600">{fareDisplay(postedTask)}</p></div>
                    <div><p className="text-slate-500">Deadline</p><p className="font-semibold">{postedTask.deadline ? new Date(postedTask.deadline).toLocaleDateString() : "—"}</p></div>
                  </div>
                  {postedTask.status === "OPEN" ? (
                    <Link href={`/commissioner/applicants?commissionId=${postedTask.id}`} className="btn-primary mt-3 w-full">
                      <Users className="h-4 w-4" /> Review Applicants
                    </Link>
                  ) : postedTask.status === "IN_PROGRESS" && postedTask.awardedToId ? (
                    <div className="mt-3">
                      <MarkCompleteButton
                        commissionId={postedTask.id}
                        commissionTitle={postedTask.title}
                        awardedToName={awardedToName}
                      />
                    </div>
                  ) : (
                    <Link href="/hub" className="mt-3 block w-full rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold hover:bg-slate-50">
                      <CheckCircle2 className="mr-1 inline h-4 w-4" /> View in My Hub
                    </Link>
                  )}
                </>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
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
            role: "Student Employee · CSU Caraga",
            rating: stats.rating,
            reviews: stats.reviewCount,
            done: stats.done,
            posted: stats.posted,
            rate: stats.successRate,
            avatarUrl: session?.avatarUrl ?? null,
          }}
          skills={skills}
          reviews={reviews}
        />
      </div>
    </div>
  );
}

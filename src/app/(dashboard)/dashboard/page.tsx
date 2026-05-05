import Link from "next/link";
import { Hand, TrendingUp, Users, Star, ArrowRight, Bookmark, ChevronRight } from "lucide-react";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getUserSkills, getUserStats, getRecentReviews } from "@/lib/queries";

const FEATURED = [
  {
    id: "f1",
    category: "Technical",
    catColor: "bg-blue-100 text-blue-700",
    status: "Open",
    title: "CSU Website Redesign",
    desc: "Full redesign of the official CSU website. Looking for a skilled web developer with UI/UX experience.",
    poster: "CSU Admin", rating: 5.0, location: "CSU Campus",
    fare: "₱50,000",
    featured: true,
  },
  {
    id: "f2",
    category: "Administrative",
    catColor: "bg-purple-100 text-purple-700",
    status: "Open",
    title: "Clerical Assistance",
    desc: "Assist the departmental secretary with daily filing, encoding, and administrative tasks.",
    poster: "Dept. Secretary", rating: 4.7, location: "CSU Campus",
    fare: "₱1,500/day",
  },
  {
    id: "f3",
    category: "General",
    catColor: "bg-amber-100 text-amber-700",
    status: "Open",
    title: "General Errands",
    desc: "Run errands on campus or nearby areas. Tasks include document delivery, purchasing supplies, etc.",
    poster: "Various", rating: 4.5, location: "CSU Campus",
    fare: "₱500/errand",
  },
];

function timeBasedGreeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardHome() {
  const session = await getSession();
  const fullName = session?.fullName ?? "Guest";
  const firstName = fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const greeting = timeBasedGreeting();

  const [user, skills, stats, reviews] = session
    ? await Promise.all([
        prisma.user.findUnique({ where: { id: session.userId }, select: { avatarUrl: true } }),
        getUserSkills(session.userId),
        getUserStats(session.userId),
        getRecentReviews(session.userId, 3),
      ])
    : [null, [], { done: 0, posted: 0, rating: null, reviewCount: 0, successRate: null }, []];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 p-7 text-white shadow-soft">
          <p className="mb-1 text-xs font-medium opacity-90">{today}</p>
          <h1 className="text-3xl font-bold">{greeting}, {firstName}! <Hand className="ml-1 inline h-7 w-7" /></h1>
          <p className="mt-1 opacity-90">You have 2 active tasks and 3 new applicants waiting.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <TrendingUp className="h-3.5 w-3.5" /> 2 In Progress
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <Users className="h-3.5 w-3.5" /> 3 Applicants
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
              <p className="text-sm text-slate-500">Hand-picked commissions for your skills</p>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {FEATURED.map((f) => (
              <article key={f.id} className={`overflow-hidden rounded-xl border bg-white shadow-card ${f.featured ? "border-brand-300" : "border-slate-200"}`}>
                {f.featured && (
                  <div className="flex items-center gap-1 border-b border-brand-200 bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    <Star className="h-3 w-3 fill-white" /> Featured Commission
                  </div>
                )}
                <div className="flex gap-4 p-4">
                  <div className="hidden h-24 w-32 shrink-0 rounded-lg bg-slate-100 sm:block" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap gap-2">
                      <span className={`pill ${f.catColor}`}>{f.category}</span>
                      <span className="pill bg-emerald-50 text-emerald-700">{f.status}</span>
                    </div>
                    <h3 className="truncate text-base font-bold">{f.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-600">{f.desc}</p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      <span className="mr-3">👤 {f.poster}</span>
                      <span className="mr-3 text-amber-500">★ {f.rating}</span>
                      <span>📍 {f.location}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <p className="whitespace-nowrap text-lg font-bold text-brand-600">{f.fare}</p>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Save">
                        <Bookmark className="h-4 w-4" />
                      </button>
                      <button className="btn-primary !py-2">
                        Apply Now <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
                <span className="pill bg-amber-100 text-amber-700">In Progress</span>
              </div>
              <h3 className="text-base font-bold">Mathematics Tutoring</h3>
              <p className="text-xs text-slate-500">👤 Maria Santos</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-slate-500">Fare</p><p className="font-bold text-brand-600">₱800/hr</p></div>
                <div><p className="text-slate-500">Deadline</p><p className="font-semibold">Apr 15, 2026</p></div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-700">In Progress</span>
                  <span className="font-bold">65%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: "65%" }} />
                </div>
              </div>
              <button className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold hover:bg-slate-50">
                👍 Mark Complete &amp; Review
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="pill bg-purple-100 text-purple-700">🪧 Task I Posted</span>
                <span className="pill bg-emerald-50 text-emerald-700">Open</span>
              </div>
              <h3 className="text-base font-bold">Need 50 Flyers Distributed</h3>
              <p className="text-xs text-slate-500">👤 {fullName} (You)</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-slate-500">Fare</p><p className="font-bold text-brand-600">₱300</p></div>
                <div><p className="text-slate-500">Deadline</p><p className="font-semibold">Apr 10, 2026</p></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <div className="flex -space-x-2">
                  {["DC", "JS", "KO"].map((i) => (
                    <span key={i} className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-brand-500 text-[10px] font-bold text-white">{i}</span>
                  ))}
                </div>
                <span><strong>3 Applicants</strong> waiting</span>
              </div>
              <Link href="/commissioner/applicants" className="btn-primary mt-3 w-full">
                👥 Accept Applicant
              </Link>
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
            avatarUrl: user?.avatarUrl ?? null,
          }}
          skills={skills}
          reviews={reviews}
        />
      </div>
    </div>
  );
}

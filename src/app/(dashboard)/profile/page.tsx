import { ShieldCheck, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getUserSkills, getUserStats, getRecentReviews } from "@/lib/queries";
import { SkillsManager } from "@/components/dashboard/skills-manager";
import { AvatarUploader } from "@/components/dashboard/avatar-uploader";

export default async function ProfilePage() {
  const session = await getSession();
  const fullName = session?.fullName ?? "Guest";
  const email = session?.email ?? "—";

  const [user, skills, stats, reviews] = session
    ? await Promise.all([
        prisma.user.findUnique({ where: { id: session.userId }, select: { avatarUrl: true } }),
        getUserSkills(session.userId),
        getUserStats(session.userId),
        getRecentReviews(session.userId, 5),
      ])
    : [null, [], { done: 0, posted: 0, rating: null, reviewCount: 0, successRate: null }, []];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="h-28 bg-gradient-to-r from-brand-500 to-emerald-500" />
        <div className="-mt-12 p-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
            <AvatarUploader fullName={fullName} initialUrl={user?.avatarUrl ?? null} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Student
                </span>
              </div>
              <p className="text-sm text-slate-500">Student Employee · CSU Caraga</p>
              <p className="text-xs text-slate-400">{email}</p>
              <p className="mt-1 text-sm">
                <Star className="mr-1 inline h-4 w-4 fill-amber-400 text-amber-400" />
                <strong>{stats.rating != null ? stats.rating.toFixed(1) : "—"}</strong>{" "}
                <span className="text-slate-500">({stats.reviewCount} reviews)</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Done" value={stats.done} />
            <Stat label="Posted" value={stats.posted} />
            <Stat label="Rate" value={stats.successRate != null ? `${stats.successRate}%` : "—"} />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Skills &amp; Expertise</h2>
        <SkillsManager initialSkills={skills} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No reviews yet. Reviews will show here automatically when commissioners rate your completed work.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r, i) => (
              <li key={i} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold">{r.initials}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.who}</p>
                    <p className="text-xs text-amber-500">
                      {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      <span className="ml-2 text-slate-400">{r.when}</span>
                    </p>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm italic text-slate-600">&quot;{r.comment}&quot;</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

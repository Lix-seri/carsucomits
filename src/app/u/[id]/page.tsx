import { notFound, redirect } from "next/navigation";
import { Star, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/session";
import { getProfileDetails, getPublicUser } from "@/features/profile/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/layout/back-button";
import { MessageButton } from "@/features/messages/message-button";
import { TrustBadge } from "@/components/ui/trust-badge";
import { RatingBreakdown } from "@/features/ratings/rating-breakdown";
import { Stat } from "@/components/ui/stat";
import { ROLE_LABEL } from "@/lib/labels";
import { LEVEL_PILL } from "@/lib/labels";

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  // If a logged-in user tries to view their own profile, send them to the editable one.
  if (session?.userId === id) redirect("/profile");

  const user = await getPublicUser(id);
  // Admin accounts have no public profile.
  if (!user || user.role === "ADMIN") notFound();

  const { skills, stats, reviews, distribution } = await getProfileDetails(user.id, 8);

  const isFlagged = user.status !== "ACTIVE";

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-sunken">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <BackButton />

          {isFlagged && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">This account is currently {user.status.toLowerCase()}.</p>
                <p className="text-xs">Proceed with caution. Reports against this user may be under review.</p>
              </div>
            </div>
          )}

          <article className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="h-28 bg-gradient-to-r from-brand-500 to-brand-500" />
            <div className="-mt-12 p-6">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
                <Avatar name={user.fullName} src={user.avatarUrl} size="xl" ringed />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.fullName}</h1>
                  </div>
                  <p className="text-sm text-muted">
                    {ROLE_LABEL[user.role] ?? user.role} · CSU Caraga
                  </p>
                  <p className="text-xs text-muted">
                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  <p className="mt-1 text-sm">
                    <Star className="mr-1 inline h-4 w-4 fill-warning-400 text-warning-400" />
                    <strong>{stats.rating != null ? stats.rating.toFixed(1) : "—"}</strong>{" "}
                    <span className="text-muted">({stats.reviewCount} review{stats.reviewCount === 1 ? "" : "s"})</span>
                  </p>
                  <div className="mt-2">
                    <TrustBadge avg={stats.rating} reviewCount={stats.reviewCount} size="md" showDescription />
                  </div>
                </div>
                {session && session.userId !== user.id && user.status !== "BANNED" && (
                  <MessageButton userId={user.id} />
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Stat label="Done" value={stats.done} />
                <Stat label="Posted" value={stats.posted} />
                <Stat label="Success Rate" value={stats.successRate != null ? `${stats.successRate}%` : "—"} />
              </div>
            </div>
          </article>

          {user.bio && (
            <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
              <h2 className="mb-2 text-lg font-bold">About</h2>
              <p className="whitespace-pre-line text-sm text-ink">{user.bio}</p>
            </section>
          )}

          <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold">Skills &amp; Expertise</h2>
            {skills.length === 0 ? (
              <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">
                No skills listed yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-line p-3">
                    <span className="font-medium">{s.name}</span>
                    <span className={`pill ${LEVEL_PILL[s.level] ?? "bg-sunken text-ink"}`}>{s.level}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">
                No reviews yet.
              </p>
            ) : (
              <div className="mb-6">
                <RatingBreakdown byStar={distribution} avg={stats.rating} total={stats.reviewCount} />
              </div>
            )}
            {reviews.length > 0 && (
              <ul className="space-y-4">
                {reviews.map((r, i) => (
                  <li key={i} className="border-b border-line pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-line text-xs font-bold">{r.initials}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{r.who}</p>
                        <p className="text-xs text-warning-500">
                          {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                          <span className="ml-2 text-muted">{r.when}</span>
                        </p>
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm italic text-muted">&quot;{r.comment}&quot;</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}


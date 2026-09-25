import { Star } from "lucide-react";
import { ROLE_LABEL } from "@/lib/labels";
import { Avatar } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TrustBadge } from "@/components/ui/trust-badge";
import { RatingBreakdown } from "./rating-breakdown";

type Review = { who: string; initials: string; stars: number; comment: string | null; when: string };
type Stats = { done: number; posted: number; rating: number | null; reviewCount: number; successRate: number | null };

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={i <= n ? "h-3.5 w-3.5 fill-warning-400 text-warning-400" : "h-3.5 w-3.5 text-line-strong"} />
      ))}
    </span>
  );
}

/** Profile layout shared by /profile (self, editable) and /u/[id] (public). */
export function ProfileView({
  user, stats, skills, reviews, distribution, avatar, actions, skillsEditor, notice, isSelf = false,
}: {
  user: { fullName: string; avatarUrl: string | null; role: string; createdAt?: Date; bio?: string | null; email?: string };
  stats: Stats;
  skills: { id: string; name: string; level: string }[];
  reviews: Review[];
  distribution: Record<number, number>;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  skillsEditor?: React.ReactNode;
  notice?: React.ReactNode;
  isSelf?: boolean;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {notice}
      <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="h-20 bg-brand-600" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            {avatar ?? <Avatar name={user.fullName} src={user.avatarUrl} size="xl" ringed />}
            {actions}
          </div>
          <div className="mt-3 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{user.fullName}</h1>
            <p className="text-sm text-muted">
              {ROLE_LABEL[user.role] ?? user.role}
              {user.createdAt && <> · Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</>}
              {user.email && <> · {user.email}</>}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
              <strong>{stats.rating != null ? stats.rating.toFixed(1) : "—"}</strong>
              <span className="text-muted">({stats.reviewCount} review{stats.reviewCount === 1 ? "" : "s"})</span>
            </span>
            <TrustBadge avg={stats.rating} reviewCount={stats.reviewCount} showDescription={!isSelf} />
          </div>
          <dl className="mt-6 grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
            {[
              ["Completed", stats.done],
              ["Posted", stats.posted],
              ["Success rate", stats.successRate != null ? `${stats.successRate}%` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="px-2 py-3">
                <dd className="tabular text-xl font-semibold">{value}</dd>
                <dt className="text-xs text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </article>

      {user.bio && (
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="mb-2 font-semibold">About</h2>
          <p className="max-w-prose whitespace-pre-line text-sm text-ink">{user.bio}</p>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">Skills</h2>
        {skillsEditor ??
          (skills.length === 0 ? (
            <p className="text-sm text-muted">No skills listed yet.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {skills.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
                  <span className="font-medium">{s.name}</span>
                  <LevelBadge level={s.level} />
                </li>
              ))}
            </ul>
          ))}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews yet">
            {isSelf ? "Reviews appear here after you complete a commission and the other person rates you." : "Reviews appear after completed commissions."}
          </EmptyState>
        ) : (
          <>
            <div className="mb-6">
              <RatingBreakdown byStar={distribution} avg={stats.rating} total={stats.reviewCount} />
            </div>
            <ul className="divide-y divide-line">
              {reviews.map((r, i) => (
                <li key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-sunken text-xs font-bold text-muted">{r.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.who}</p>
                      <p className="flex items-center gap-2 text-xs text-muted">
                        <Stars n={r.stars} /> {r.when}
                      </p>
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 max-w-prose text-sm text-ink">&ldquo;{r.comment}&rdquo;</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

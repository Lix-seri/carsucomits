import { Star } from "lucide-react";
import { ROLE_LABEL } from "@/lib/labels";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { TrustBadge } from "@/components/ui/trust-badge";
import { AvailabilityBadge, VerifiedBadge } from "@/components/ui/badge";
import { RatingBreakdown } from "./rating-breakdown";
import { Achievements, ProfileBanner, SkillTag, achievementsFor } from "./profile-parts";

type Review = { who: string; initials: string; stars: number; comment: string | null; when: string };
type Stats = { done: number; posted: number; rating: number | null; reviewCount: number; successRate: number | null };

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={i <= n ? "h-3.5 w-3.5 fill-gold-400 text-gold-500" : "h-3.5 w-3.5 text-line-strong"} />
      ))}
    </span>
  );
}

/** Profile layout shared by /profile (self, editable) and /u/[id] (public). */
export function ProfileView({
  user, stats, skills, reviews, distribution, activeJobs, avatar, actions, skillsEditor, notice, isSelf = false,
}: {
  user: { id: string; fullName: string; avatarUrl: string | null; role: string; createdAt?: Date; bio?: string | null; email?: string; verified?: boolean };
  stats: Stats;
  skills: { id: string; name: string; level: string }[];
  reviews: Review[];
  distribution: Record<number, number>;
  /** Unfinished jobs right now: 0 shows Available, more shows Busy (item 4). */
  activeJobs?: number;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  skillsEditor?: React.ReactNode;
  notice?: React.ReactNode;
  isSelf?: boolean;
}) {
  const achievements = achievementsFor({ stats, fiveStars: distribution[5] ?? 0, verified: !!user.verified });
  const numbers = [
    ["Jobs done", stats.done],
    ["Posted", stats.posted],
    ["Rating", stats.rating != null ? stats.rating.toFixed(1) : "New"],
    ["Success rate", stats.successRate != null ? `${stats.successRate}%` : "–"],
  ];
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {notice}
      <article className="overflow-hidden rounded-3xl border-2 border-line bg-surface shadow-card">
        <ProfileBanner seed={user.id} />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            {avatar ?? <Avatar name={user.fullName} src={user.avatarUrl} size="xl" ringed />}
            {actions}
          </div>
          <h1 className="display mt-3 text-3xl sm:text-4xl">{user.fullName}</h1>
          <p className="mt-1 text-sm text-muted">
            {ROLE_LABEL[user.role] ?? user.role}
            {user.createdAt && <> · Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</>}
            {user.email && <> · {user.email}</>}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {user.verified && <VerifiedBadge sticker />}
            {activeJobs !== undefined && <AvailabilityBadge activeJobs={activeJobs} />}
            <TrustBadge avg={stats.rating} reviewCount={stats.reviewCount} showDescription={!isSelf} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {numbers.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-sunken px-3 py-3 text-center">
                <dd className="font-display text-2xl font-extrabold tabular">{value}</dd>
                <dt className="text-xs font-semibold text-muted">{label}</dt>
              </div>
            ))}
          </dl>
          {achievements.length > 0 && (
            <div className="mt-5">
              <Achievements items={achievements} />
            </div>
          )}
        </div>
      </article>

      {user.bio && (
        <section className="rounded-3xl border-2 border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-2 font-display text-xl font-bold">About</h2>
          <p className="max-w-prose whitespace-pre-line text-ink">{user.bio}</p>
        </section>
      )}

      <section aria-labelledby="skills" className="rounded-3xl border-2 border-line bg-surface p-5 sm:p-6">
        <h2 id="skills" className="mb-4 font-display text-xl font-bold">Skills</h2>
        {skillsEditor ??
          (skills.length === 0 ? (
            <p className="text-sm text-muted">No skills listed yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {skills.map((s, i) => <li key={s.id}><SkillTag name={s.name} level={s.level} index={i} /></li>)}
            </ul>
          ))}
      </section>

      <section aria-labelledby="reviews" className="rounded-3xl border-2 border-line bg-surface p-5 sm:p-6">
        <h2 id="reviews" className="mb-4 font-display text-xl font-bold">Reviews</h2>
        {reviews.length === 0 ? (
          <EmptyState compact pose="wave" title="No reviews yet">
            {isSelf ? "Finish a commission and the other person's rating shows up here." : "Reviews appear here after completed commissions."}
          </EmptyState>
        ) : (
          <>
            <div className="mb-6">
              <RatingBreakdown byStar={distribution} avg={stats.rating} total={stats.reviewCount} />
            </div>
            <ul className="space-y-3">
              {reviews.map((r, i) => (
                <li key={i} className="rounded-2xl bg-sunken p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-xs font-bold text-muted">{r.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.who}</p>
                      <p className="flex items-center gap-2 text-xs text-muted"><Stars n={r.stars} /> {r.when}</p>
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 max-w-prose text-ink">&ldquo;{r.comment}&rdquo;</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

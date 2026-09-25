import Link from "next/link";
import { Star, Lightbulb, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { TrustBadge } from "@/components/ui/trust-badge";
import { LEVEL_LABEL } from "@/lib/labels";

const LEVEL_BAR: Record<string, { color: string; pct: number }> = {
  BEGINNER:     { color: "from-ink to-ink",     pct: 30 },
  INTERMEDIATE: { color: "from-info-500 to-info-500",     pct: 60 },
  ADVANCED:     { color: "from-brand-400 to-brand-600", pct: 80 },
  EXPERT:       { color: "from-warning-400 to-warning-500",    pct: 95 },
};

type Skill = { id: string; name: string; level: string };
type Review = { who: string; initials: string; stars: number; comment: string | null; when: string };

export function ProfileCard({
  user, skills, reviews,
}: {
  user: { fullName: string; role: string; rating: number | null; reviews: number; done: number; posted: number; rate: number | null; avatarUrl?: string | null };
  skills: Skill[];
  reviews: Review[];
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="h-12 bg-gradient-to-r from-brand-500 to-brand-600" />
        <div className="-mt-8 px-5 pb-5 text-center">
          <div className="mx-auto w-fit">
            <Avatar name={user.fullName} src={user.avatarUrl} size="lg" ringed />
          </div>
          <h3 className="mt-2 text-lg font-bold">{user.fullName}</h3>
          <p className="text-xs text-muted">{user.role}</p>
          <p className="mt-1 text-sm">
            <Star className="mr-1 inline h-4 w-4 fill-warning-400 text-warning-400" />
            <strong>{user.rating != null ? user.rating.toFixed(1) : "—"}</strong>{" "}
            <span className="text-muted">({user.reviews} reviews)</span>
          </p>
          <div className="mt-2 flex justify-center">
            <TrustBadge avg={user.rating} reviewCount={user.reviews} size="sm" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <div><p className="text-lg font-bold">{user.done}</p><p className="text-xs text-muted">Done</p></div>
            <div><p className="text-lg font-bold">{user.posted}</p><p className="text-xs text-muted">Posted</p></div>
            <div><p className="text-lg font-bold">{user.rate != null ? `${user.rate}%` : "—"}</p><p className="text-xs text-muted">Rate</p></div>
          </div>
          <Link href="/profile" className="mt-4 block w-full rounded-lg border border-line py-2 text-sm font-semibold text-ink hover:bg-sunken">
            View Full Profile
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <Lightbulb className="h-4 w-4 text-warning-500" /> Skills &amp; Expertise
        </h4>
        {skills.length === 0 ? (
          <p className="text-center text-xs text-muted">No skills added yet. Add your first one on your profile.</p>
        ) : (
          <ul className="space-y-3">
            {skills.map((s) => {
              const bar = LEVEL_BAR[s.level] ?? LEVEL_BAR.BEGINNER;
              return (
                <li key={s.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-semibold text-muted">{LEVEL_LABEL[s.level] ?? s.level}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                    <div className={`h-full bg-gradient-to-r ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/profile"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-2 text-sm font-medium text-muted hover:border-brand-300 hover:text-brand-600"
        >
          <Plus className="h-4 w-4" /> Add New Skill
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Star className="h-4 w-4 fill-warning-400 text-warning-400" /> Recent Reviews
        </h4>
        {reviews.length === 0 ? (
          <p className="text-center text-xs text-muted">No reviews yet. Complete your first commission to earn one.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r, i) => (
              <li key={i}>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-line text-xs font-bold">{r.initials}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.who}</p>
                    <p className="text-xs text-warning-500">
                      {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      <span className="ml-1 text-muted">{r.when}</span>
                    </p>
                  </div>
                </div>
                {r.comment && <p className="mt-1.5 line-clamp-2 text-xs italic text-muted">&quot;{r.comment}&quot;</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

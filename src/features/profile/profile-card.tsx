/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
import Link from "next/link";
import { ShieldCheck, Star, Lightbulb, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { TrustBadge } from "@/components/ui/trust-badge";
import { LEVEL_LABEL } from "@/lib/labels";

const LEVEL_BAR: Record<string, { color: string; pct: number }> = {
  BEGINNER:     { color: "from-slate-400 to-slate-500",     pct: 30 },
  INTERMEDIATE: { color: "from-purple-400 to-pink-500",     pct: 60 },
  ADVANCED:     { color: "from-emerald-400 to-emerald-600", pct: 80 },
  EXPERT:       { color: "from-amber-400 to-orange-500",    pct: 95 },
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="h-12 bg-gradient-to-r from-brand-500 to-brand-600" />
        <div className="-mt-8 px-5 pb-5 text-center">
          <div className="mx-auto w-fit">
            <Avatar name={user.fullName} src={user.avatarUrl} size="lg" ringed />
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" /> Verified
          </div>
          <h3 className="mt-2 text-lg font-bold">{user.fullName}</h3>
          <p className="text-xs text-slate-500">{user.role}</p>
          <p className="mt-1 text-sm">
            <Star className="mr-1 inline h-4 w-4 fill-amber-400 text-amber-400" />
            <strong>{user.rating != null ? user.rating.toFixed(1) : "—"}</strong>{" "}
            <span className="text-slate-500">({user.reviews} reviews)</span>
          </p>
          <div className="mt-2 flex justify-center">
            <TrustBadge avg={user.rating} reviewCount={user.reviews} size="sm" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
            <div><p className="text-lg font-bold">{user.done}</p><p className="text-[11px] text-slate-500">Done</p></div>
            <div><p className="text-lg font-bold">{user.posted}</p><p className="text-[11px] text-slate-500">Posted</p></div>
            <div><p className="text-lg font-bold">{user.rate != null ? `${user.rate}%` : "—"}</p><p className="text-[11px] text-slate-500">Rate</p></div>
          </div>
          <Link href="/profile" className="mt-4 block w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            View Full Profile
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <Lightbulb className="h-4 w-4 text-amber-500" /> Skills &amp; Expertise
        </h4>
        {skills.length === 0 ? (
          <p className="text-center text-xs text-slate-500">No skills added yet. Add your first one on your profile.</p>
        ) : (
          <ul className="space-y-3">
            {skills.map((s) => {
              const bar = LEVEL_BAR[s.level] ?? LEVEL_BAR.BEGINNER;
              return (
                <li key={s.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{LEVEL_LABEL[s.level] ?? s.level}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full bg-gradient-to-r ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/profile"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600"
        >
          <Plus className="h-4 w-4" /> Add New Skill
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Recent Reviews
        </h4>
        {reviews.length === 0 ? (
          <p className="text-center text-xs text-slate-500">No reviews yet. Complete your first commission to earn one.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r, i) => (
              <li key={i}>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[10px] font-bold">{r.initials}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.who}</p>
                    <p className="text-[10px] text-amber-500">
                      {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      <span className="ml-1 text-slate-400">{r.when}</span>
                    </p>
                  </div>
                </div>
                {r.comment && <p className="mt-1.5 line-clamp-2 text-xs italic text-slate-600">&quot;{r.comment}&quot;</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

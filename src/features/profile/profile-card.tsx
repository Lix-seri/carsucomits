import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/ui/trust-badge";

type Skill = { id: string; name: string; level: string };

/** Compact "you" summary for the home page aside. */
export function ProfileCard({
  user, skills,
}: {
  user: { fullName: string; role: string; rating: number | null; reviews: number; done: number; posted: number; rate: number | null; avatarUrl?: string | null };
  skills: Skill[];
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-white p-5 text-center">
        <div className="mx-auto w-fit"><Avatar name={user.fullName} src={user.avatarUrl} size="lg" /></div>
        <p className="mt-3 font-semibold">{user.fullName}</p>
        <p className="text-xs text-muted">{user.role}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
          <strong>{user.rating != null ? user.rating.toFixed(1) : "—"}</strong>
          <span className="text-muted">({user.reviews})</span>
        </p>
        <div className="mt-2 flex justify-center"><TrustBadge avg={user.rating} reviewCount={user.reviews} size="sm" /></div>
        <dl className="mt-4 grid grid-cols-3 border-t border-line pt-4">
          {[["Completed", user.done], ["Posted", user.posted], ["Success", user.rate != null ? `${user.rate}%` : "—"]].map(([label, value]) => (
            <div key={label}>
              <dd className="tabular text-lg font-semibold">{value}</dd>
              <dt className="text-xs text-muted">{label}</dt>
            </div>
          ))}
        </dl>
        <Link href="/profile" className="btn-secondary mt-4 w-full">View profile</Link>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold">Your skills</h2>
        {skills.length === 0 ? (
          <p className="text-sm text-muted">
            Add skills so posters know what you&apos;re good at. <Link href="/profile" className="font-semibold text-brand-700 hover:underline">Add a skill</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{s.name}</span>
                <LevelBadge level={s.level} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

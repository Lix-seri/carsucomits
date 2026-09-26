import Link from "next/link";
import { cn } from "@/lib/utils";
import { dueLabel, formatFare } from "@/lib/format";
import { CategoryBadge } from "@/components/ui/category";
import { ChalkCircle, ChalkUnderline, Magnet } from "@/components/ui/chalk";
import { Tisa } from "@/components/illustrations/tisa";
import { CountUp } from "./count-up";

export type BoardSlip = {
  id: string;
  title: string;
  category: string;
  fareMin: number;
  fareMax: number | null;
  fareUnit: string | null;
  deadline: Date | null;
  commissioner: { fullName: string };
};
export type BoardStats = { open: number; completed: number; members: number };

const MAGNET = { ACADEMIC: "academic", TECHNICAL: "technical", GENERAL_ERRANDS: "errand", ADMINISTRATIVE: "admin" } as const;
const TILT = ["-rotate-2.5", "rotate-1.5", "-rotate-1.5"];
const OFFSET = ["", "sm:ml-10", "sm:ml-3"];

/** The hero's greenboard: real open commissions pinned as paper slips, and real counts in chalk. */
export function HeroBoard({ slips, stats }: { slips: BoardSlip[]; stats: BoardStats }) {
  const tally = [
    { n: stats.open, label: stats.open === 1 ? "open commission" : "open commissions" },
    { n: stats.members, label: stats.members === 1 ? "student joined" : "students joined" },
    { n: stats.completed, label: stats.completed === 1 ? "commission done" : "commissions done" },
  ].filter((t) => t.n > 0);

  return (
    <div className="board relative overflow-hidden rounded-3xl border-4 border-board-deep p-5 shadow-lift sm:p-7">
      <p className="relative inline-block font-chalk text-2xl text-board-chalk sm:text-3xl">
        On the board today
        <ChalkUnderline className="absolute -bottom-2 left-0 h-3 w-full text-gold-400" delay={500} />
      </p>

      {slips.length === 0 ? (
        <div className="mt-6 flex items-center gap-4">
          <Tisa pose="hold" className="h-28 w-28" />
          <p className="text-board-chalk">
            The board is empty right now.
            <Link href="/hiring/post" className="mt-1 block font-semibold text-gold-400 underline">Post the first commission</Link>
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {slips.map((s, i) => (
            <li key={s.id} className={cn("slip lift max-w-sm", TILT[i % 3], OFFSET[i % 3])}>
              <Magnet tone={MAGNET[s.category as keyof typeof MAGNET] ?? "gold"} className="absolute -top-2 left-1/2 -translate-x-1/2" />
              <Link href={`/commission/${s.id}`} className="block rounded-xl p-4 pt-5">
                <CategoryBadge category={s.category} />
                <p className="mt-1 line-clamp-2 font-semibold leading-snug">{s.title}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="relative px-1 font-display text-2xl font-extrabold tabular text-brand-700">
                    {formatFare(s)}
                    {i === 0 && (
                      <span aria-hidden className="pointer-events-none absolute -inset-x-3 -inset-y-2">
                        <ChalkCircle className="h-full w-full text-gold-500" delay={900} />
                      </span>
                    )}
                  </span>
                  <span className="text-right text-xs text-muted">
                    <span className="block font-semibold text-ink">{dueLabel(s.deadline)}</span>
                    by {s.commissioner.fullName.split(" ")[0]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {tally.length > 0 && (
        <dl className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t-2 border-dashed border-board-chalk/30 pt-4">
          {tally.map((t) => (
            <div key={t.label} className="flex items-baseline gap-1.5">
              <dt className="sr-only">{t.label}</dt>
              <dd className="font-display text-2xl font-extrabold text-gold-400"><CountUp value={t.n} /></dd>
              <span aria-hidden className="text-sm text-board-dust">{t.label}</span>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

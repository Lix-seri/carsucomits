import { Star } from "lucide-react";
import { ratingDistributionFromCounts } from "@/lib/trust";

/** The average in big type beside a gold bar per star count. */
export function RatingBreakdown({ byStar, avg, total }: { byStar: Record<number, number>; avg: number | null; total: number }) {
  const distribution = ratingDistributionFromCounts(byStar);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-label-bar">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gold-50 p-4 text-center">
        <p className="font-display text-5xl font-extrabold tabular">{avg != null ? avg.toFixed(1) : "–"}</p>
        <div className="mt-1 flex" aria-label={avg != null ? `${avg.toFixed(1)} out of 5` : "No rating yet"}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} aria-hidden className={`h-4 w-4 ${avg != null && n <= Math.round(avg) ? "fill-gold-400 text-gold-500" : "text-line-strong"}`} />
          ))}
        </div>
        <p className="mt-1 text-xs font-semibold text-muted">{total} review{total === 1 ? "" : "s"}</p>
      </div>
      <div className="space-y-2">
        {distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-3 text-sm">
            <span className="flex w-10 items-center gap-1 font-semibold text-muted">
              {d.stars} <Star aria-hidden className="h-3.5 w-3.5 fill-gold-400 text-gold-500" />
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-sunken">
              <div className="h-full rounded-full bg-gold-400" style={{ width: `${d.percent}%` }} />
            </div>
            <span className="w-8 text-right text-xs tabular text-muted">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

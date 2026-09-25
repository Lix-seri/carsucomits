import { Star } from "lucide-react";
import { ratingDistributionFromCounts } from "@/features/ratings/trust";

export function RatingBreakdown({
  byStar, avg, total,
}: { byStar: Record<number, number>; avg: number | null; total: number }) {
  const distribution = ratingDistributionFromCounts(byStar);

  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-4xl font-bold">{avg != null ? avg.toFixed(1) : "—"}</p>
        <div className="mt-1 flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-4 w-4 ${avg != null && n <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">{total} review{total === 1 ? "" : "s"}</p>
      </div>

      <div className="space-y-1.5">
        {distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-3 text-sm">
            <span className="flex w-12 items-center gap-1 text-slate-600">
              {d.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-amber-500"
                style={{ width: `${d.percent}%` }}
              />
            </div>
            <span className="w-12 text-right text-xs text-slate-500">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

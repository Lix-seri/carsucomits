import Link from "next/link";
import type { Commission } from "@/lib/mock-data";

const skillColors: Record<string, string> = {
  Beginner: "bg-slate-100 text-slate-700",
  Intermediate: "bg-amber-100 text-amber-800",
  Advanced: "bg-blue-100 text-blue-800",
  Expert: "bg-purple-100 text-purple-800",
};

export function CommissionCard({ c }: { c: Commission }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="pill bg-brand-500 text-white">{c.category}</span>
        <span className={`pill ${skillColors[c.skillLevel]}`}>{c.skillLevel}</span>
      </div>
      {c.subcategory && (
        <span className="pill mb-3 w-fit bg-slate-100 text-slate-700">{c.subcategory}</span>
      )}
      <h3 className="mb-1.5 line-clamp-2 text-base font-bold text-ink">{c.title}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-600">{c.description}</p>
      <p className="mb-4 text-base font-bold text-brand-600">₱{c.fare}</p>
      <Link href={`/commission/${c.id}`} className="btn-primary mt-auto w-full">Apply Now</Link>
    </article>
  );
}

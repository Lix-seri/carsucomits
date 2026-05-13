"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";

const CATS = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "GENERAL_ERRANDS", label: "General Errands" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
];
const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
];

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-emerald-500 text-white",
  TECHNICAL: "bg-blue-500 text-white",
  GENERAL_ERRANDS: "bg-amber-500 text-white",
  ADMINISTRATIVE: "bg-purple-500 text-white",
};
const LEVEL_PILL: Record<string, string> = {
  BEGINNER: "bg-slate-100 text-slate-700",
  INTERMEDIATE: "bg-amber-100 text-amber-800",
  ADVANCED: "bg-blue-100 text-blue-800",
  EXPERT: "bg-purple-100 text-purple-800",
};

type Commission = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  requiredLevel: string;
  fareMin: number;
  fareMax: number | null;
  fareUnit: string | null;
  coverImageUrl: string | null;
  status: string;
  createdAt: string;
  commissioner: { fullName: string; avatarUrl: string | null };
  _count: { applications: number };
};

export function BrowseContent() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState<string | null>(null);
  const [lvl, setLvl] = useState<string | null>(null);
  const [items, setItems] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (cat) sp.set("category", cat);
    if (lvl) sp.set("level", lvl);
    if (q) sp.set("q", q);
    fetch(`/api/commissions?${sp.toString()}`)
      .then((r) => r.json())
      .then((data) => setItems(data.ok ? data.commissions : []))
      .finally(() => setLoading(false));
  }, [q, cat, lvl]);

  useEffect(() => {
    const next = params.get("q") ?? "";
    setQ(next);
  }, [params]);

  const hasFilter = cat || lvl || q;
  const visible = items;

  const fareDisplay = (c: Commission) =>
    c.fareMax
      ? `₱${c.fareMin}–${c.fareMax}${c.fareUnit ?? ""}`
      : `₱${c.fareMin}${c.fareUnit ?? ""}`;

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Commissions</h1>
          <p className="mt-2 text-slate-600">Find tasks that match your skills.</p>
        </div>

        <div className="card mb-8 space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search commissions, skills, students…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {q && <button onClick={() => setQ("")}><X className="h-4 w-4 text-slate-400" /></button>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label !mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCat(cat === c.value ? null : c.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      cat === c.value ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label !mb-2">Skill Level</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLvl(lvl === l.value ? null : l.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      lvl === l.value ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasFilter && (
            <button
              onClick={() => { setQ(""); setCat(null); setLvl(null); }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-12 text-center text-slate-500">Loading commissions…</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">
              <SlidersHorizontal className="mr-1 inline h-4 w-4" />
              Showing <strong>{visible.length}</strong> open commission{visible.length === 1 ? "" : "s"}
            </p>

            {visible.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((c) => (
                  <article key={c.id} id={c.id} className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
                    {c.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.coverImageUrl} alt="" className="h-32 w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className={`pill ${CAT_PILL[c.category] ?? "bg-slate-500 text-white"}`}>
                        {c.category.replace("_", " ")}
                      </span>
                      <span className={`pill ${LEVEL_PILL[c.requiredLevel]}`}>{c.requiredLevel}</span>
                    </div>
                    {c.subcategory && (
                      <span className="pill mb-3 w-fit bg-slate-100 text-slate-700">{c.subcategory}</span>
                    )}
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold text-ink">{c.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">{c.description}</p>
                    <p className="mb-4 text-base font-bold text-brand-600">{fareDisplay(c)}</p>
                    <p className="mb-3 text-xs text-slate-500">
                      Posted by {c.commissioner.fullName} · {c._count.applications} applicant{c._count.applications === 1 ? "" : "s"}
                    </p>
                    <Link href={`/commission/${c.id}`} className="btn-primary mt-auto w-full">
                      View &amp; Apply <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                <p className="text-slate-500">
                  {hasFilter
                    ? "Walang available na commission sa filter mo. Try clearing one."
                    : "No commissions posted yet. Check back soon — or post one yourself!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

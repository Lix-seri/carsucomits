/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from "@/lib/labels";
import { CommissionCard, type CommissionCardData } from "./commission-card";

export function BrowseContent() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  // Deep links from the home page: /browse?category=TECHNICAL
  const [cat, setCat] = useState<string | null>(params.get("category"));
  const [lvl, setLvl] = useState<string | null>(params.get("level"));
  const [items, setItems] = useState<CommissionCardData[]>([]);
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
              aria-label="Search commissions"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {q && <button onClick={() => setQ("")} aria-label="Clear search"><X className="h-4 w-4 text-slate-400" /></button>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label !mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCat(cat === c.value ? null : c.value)}
                    aria-pressed={cat === c.value}
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
                {LEVEL_OPTIONS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLvl(lvl === l.value ? null : l.value)}
                    aria-pressed={lvl === l.value}
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
                {visible.map((c) => <CommissionCard key={c.id} c={c} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                <p className="text-slate-500">
                  {hasFilter
                    ? "No open commissions match these filters. Try clearing one."
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

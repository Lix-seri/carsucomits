"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CommissionCard } from "@/components/commission-card";
import { COMMISSIONS, type Category, type SkillLevel } from "@/lib/mock-data";

const CATS: Category[] = ["Academic", "Technical", "General Errands"];
const LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function BrowseContent() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState<Category | null>(null);
  const [lvl, setLvl] = useState<SkillLevel | null>(null);

  // Pick up changes when navigating from search bar
  useEffect(() => {
    const next = params.get("q") ?? "";
    setQ(next);
  }, [params]);

  const filtered = useMemo(() => {
    return COMMISSIONS.filter((c) => {
      const matchQ =
        !q ||
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        c.description.toLowerCase().includes(q.toLowerCase()) ||
        c.category.toLowerCase().includes(q.toLowerCase()) ||
        (c.subcategory ?? "").toLowerCase().includes(q.toLowerCase());
      const matchC = !cat || c.category === cat;
      const matchL = !lvl || c.skillLevel === lvl;
      return matchQ && matchC && matchL;
    });
  }, [q, cat, lvl]);

  const hasFilter = cat || lvl || q;

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
                    key={c}
                    onClick={() => setCat(cat === c ? null : c)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      cat === c ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label !mb-2">Skill Level</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLvl(lvl === l ? null : l)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      lvl === l ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {l}
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

        <p className="mb-4 text-sm text-slate-600">
          <SlidersHorizontal className="mr-1 inline h-4 w-4" />
          Showing <strong>{filtered.length}</strong> of {COMMISSIONS.length} commissions
        </p>

        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <div key={c.id} id={c.id} className="scroll-mt-24">
                <CommissionCard c={c} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <p className="text-slate-500">Walang available na commission sa filter mo. Try clearing one.</p>
          </div>
        )}
      </div>
    </main>
  );
}

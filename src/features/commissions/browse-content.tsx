"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CommissionCard, type CommissionCardData } from "./commission-card";

function Chips({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? null : o.value)}
            aria-pressed={value === o.value}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              value === o.value ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white text-ink hover:border-brand-300",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function BrowseContent() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
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

  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const hasFilter = cat || lvl || q;
  const clear = () => { setQ(""); setCat(null); setLvl(null); };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Browse commissions" description="Open work posted by CSU Main students. Filter by category and the skill level asked for." />

      <div className="mb-6 space-y-4 rounded-xl border border-line bg-white p-4 sm:p-5">
        <div className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <Search className="h-5 w-5 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, descriptions, skills…"
            aria-label="Search commissions"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Chips label="Category" options={CATEGORY_OPTIONS} value={cat} onChange={setCat} />
          <Chips label="Skill level" options={LEVEL_OPTIONS} value={lvl} onChange={setLvl} />
        </div>
      </div>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm text-muted">
          {loading ? "Loading…" : <><span className="font-semibold text-ink">{items.length}</span> open commission{items.length === 1 ? "" : "s"}</>}
        </p>
        {hasFilter && (
          <button onClick={clear} className="btn-ghost btn-sm">
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((c) => <CommissionCard key={c.id} c={c} />)}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title={hasFilter ? "Nothing matches these filters" : "No open commissions yet"}
          action={hasFilter ? <button onClick={clear} className="btn-secondary">Clear filters</button> : undefined}
        >
          {hasFilter ? "Try another category or skill level, or a shorter search." : "Check back soon, or post one yourself."}
        </EmptyState>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, CATEGORY_OPTIONS, LEVEL_LABEL, LEVEL_OPTIONS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelPips, categoryStyle } from "@/components/ui/category";
import { CommissionCard, type CommissionCardData } from "./commission-card";

/** Category chips: outlined until chosen, then filled with the category's own colour. */
function CategoryChips({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div role="group" aria-label="Category" className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      {CATEGORY_OPTIONS.map((o) => {
        const s = categoryStyle(o.value);
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(on ? null : o.value)}
            aria-pressed={on}
            className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition duration-150 active:scale-95", on ? s.chipOn : cn("bg-surface", s.chipOff))}
          >
            <s.icon aria-hidden className="h-4 w-4" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function LevelChips({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div role="group" aria-label="Skill level" className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      {LEVEL_OPTIONS.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(on ? null : o.value)}
            aria-pressed={on}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border-2 px-3 py-1.5 transition duration-150 active:scale-95",
              on ? "border-brand-500 bg-brand-50" : "border-line-strong bg-surface hover:border-brand-300",
            )}
          >
            <LevelPips level={o.value} className={on ? "text-brand-700" : "text-ink"} />
          </button>
        );
      })}
    </div>
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

  const active = [
    cat && { key: "cat", label: CATEGORY_LABEL[cat] ?? cat, clear: () => setCat(null) },
    lvl && { key: "lvl", label: LEVEL_LABEL[lvl] ?? lvl, clear: () => setLvl(null) },
    q && { key: "q", label: `“${q}”`, clear: () => setQ("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const clear = () => { setQ(""); setCat(null); setLvl(null); };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Browse the board" description="Open commissions from CSU Main students. Pick a category or a skill level to narrow it down." />

      <div className="sticky top-16 z-20 -mx-4 mb-6 space-y-3 border-b border-line bg-canvas/95 px-4 pb-4 pt-2 sm:mx-0 sm:rounded-2xl sm:border sm:bg-surface sm:p-4 sm:shadow-card">
        <label className="flex items-center gap-3 rounded-xl border border-line-strong bg-surface px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <Search aria-hidden className="h-5 w-5 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles and descriptions"
            aria-label="Search commissions"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="rounded p-0.5 text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <CategoryChips value={cat} onChange={setCat} />
        <LevelChips value={lvl} onChange={setLvl} />
      </div>

      <div className="mb-4 flex min-h-8 flex-wrap items-center gap-2" aria-live="polite">
        <p className="mr-2 text-sm text-muted">
          {loading ? "Looking at the board…" : <><span className="font-semibold text-ink">{items.length}</span> open commission{items.length === 1 ? "" : "s"}</>}
        </p>
        {active.map((a) => (
          <button key={a.key} type="button" onClick={a.clear} className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas hover:opacity-90" aria-label={`Remove filter ${a.label}`}>
            {a.label} <X aria-hidden className="h-3.5 w-3.5" />
          </button>
        ))}
        {active.length > 1 && <button type="button" onClick={clear} className="text-xs font-semibold text-muted underline hover:text-ink">Clear all</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-3"><Skeleton className="h-7 w-7" /><Skeleton className="h-4 w-24" /></div>
              <Skeleton className="mt-4 h-5 w-4/5" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-6 h-8 w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => <CommissionCard key={c.id} c={c} />)}
        </div>
      ) : (
        <EmptyState
          pose={active.length ? "search" : "sleep"}
          title={active.length ? "Nothing on the board matches that" : "The board is empty right now"}
          action={
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {active.length > 0 && <button type="button" onClick={clear} className="btn-secondary">Clear filters</button>}
              <Link href="/hiring/post" className="btn-primary">Post one yourself</Link>
            </div>
          }
        >
          {active.length ? "Try another category or skill level, or a shorter search." : "Wala pa. Be the first to post what you need."}
        </EmptyState>
      )}
    </div>
  );
}

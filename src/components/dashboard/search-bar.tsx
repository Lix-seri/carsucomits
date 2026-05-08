"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";

type Commission = {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  requiredLevel: string;
  fareMin: number;
  fareMax: number | null;
  fareUnit: string | null;
};

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<Commission[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const handle = setTimeout(() => {
      fetch(`/api/commissions?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.ok ? data.commissions.slice(0, 6) : []))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    if (results.length > 0 && active < results.length) {
      router.push(`/commission/${results[active].id}`);
    } else {
      router.push(`/browse?q=${encodeURIComponent(q)}`);
    }
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
  }

  const fareDisplay = useMemo(() => (c: Commission) =>
    c.fareMax
      ? `₱${c.fareMin}–${c.fareMax}${c.fareUnit ?? ""}`
      : `₱${c.fareMin}${c.fareUnit ?? ""}`,
  []);

  return (
    <div ref={ref} className="relative flex-1">
      <form onSubmit={submit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-500">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search commissions, skills, students…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setOpen(false); }} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-card">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              No matches for <strong>&quot;{q}&quot;</strong>. Try a different keyword.
            </p>
          ) : (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Commissions
              </p>
              <ul>
                {results.map((c, i) => (
                  <li key={c.id}>
                    <Link
                      href={`/commission/${c.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2 transition ${
                        i === active ? "bg-brand-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                        <Search className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.title}</p>
                        <p className="truncate text-xs text-slate-500">
                          {c.category.replace("_", " ")}{c.subcategory ? ` · ${c.subcategory}` : ""} · {fareDisplay(c)}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {c.requiredLevel}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/browse?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-slate-100"
              >
                See all results for &quot;{q}&quot;
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

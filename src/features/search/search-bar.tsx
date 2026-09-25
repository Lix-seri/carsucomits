"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ArrowRight, Briefcase, User as UserIcon, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatFare } from "@/lib/format";

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

type User = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  ratingAvg: number | null;
  reviewCount: number;
};

const ROLE_LABEL: Record<string, string> = {
  STUDENT_EMPLOYEE: "Student",
  COMMISSIONER: "Commissioner",
};

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Combined flat list for keyboard navigation: users first, then commissions.
  const flat = useMemo(
    () => [
      ...users.map((u) => ({ kind: "user" as const, id: u.id, data: u })),
      ...commissions.map((c) => ({ kind: "commission" as const, id: c.id, data: c })),
    ],
    [users, commissions],
  );

  useEffect(() => {
    if (!q.trim()) { setUsers([]); setCommissions([]); return; }
    const handle = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setUsers(data.users ?? []);
            setCommissions(data.commissions ?? []);
          }
        })
        .catch(() => { setUsers([]); setCommissions([]); });
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
    if (flat.length > 0 && active < flat.length) {
      const item = flat[active];
      router.push(item.kind === "user" ? `/u/${item.id}` : `/commission/${item.id}`);
    } else {
      router.push(`/browse?q=${encodeURIComponent(q)}`);
    }
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
  }

  const totalResults = flat.length;

  return (
    <div ref={ref} className="relative flex-1">
      <form onSubmit={submit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-500">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search users, commissions, skills…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setOpen(false); }} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-card">
          {totalResults === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              No matches for <strong>&quot;{q}&quot;</strong>. Try a different keyword.
            </p>
          ) : (
            <>
              {users.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-3 pt-2 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Users · {users.length}
                    </p>
                    <UserIcon className="h-3 w-3 text-slate-300" />
                  </div>
                  <ul>
                    {users.map((u, i) => {
                      const idx = i;
                      const isActive = idx === active;
                      return (
                        <li key={u.id}>
                          <Link
                            href={`/u/${u.id}`}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${isActive ? "bg-brand-50" : "hover:bg-slate-50"}`}
                          >
                            <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {u.fullName}
                                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-blue-700">
                                  <UserIcon className="h-2.5 w-2.5" /> User
                                </span>
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {ROLE_LABEL[u.role] ?? u.role}
                                {u.ratingAvg != null && (
                                  <span className="ml-2 text-amber-500">
                                    <Star className="mr-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" />
                                    {u.ratingAvg.toFixed(1)} ({u.reviewCount})
                                  </span>
                                )}
                                {u.reviewCount === 0 && <span className="ml-2 text-slate-400">No reviews yet</span>}
                                {u.status !== "ACTIVE" && (
                                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">{u.status}</span>
                                )}
                              </p>
                            </div>
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">View Profile</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {commissions.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-3 pt-3 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Commissions · {commissions.length}
                    </p>
                    <Briefcase className="h-3 w-3 text-slate-300" />
                  </div>
                  <ul>
                    {commissions.map((c, i) => {
                      const idx = users.length + i;
                      const isActive = idx === active;
                      return (
                        <li key={c.id}>
                          <Link
                            href={`/commission/${c.id}`}
                            onClick={() => setOpen(false)}
                            className={`flex items-start gap-3 rounded-lg px-3 py-2 transition ${isActive ? "bg-brand-50" : "hover:bg-slate-50"}`}
                          >
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                              <Briefcase className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {c.title}
                                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-700">
                                  <Briefcase className="h-2.5 w-2.5" /> Commission
                                </span>
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {c.category.replace("_", " ")}{c.subcategory ? ` · ${c.subcategory}` : ""} · {formatFare(c)}
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              {c.requiredLevel}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <Link
                href={`/browse?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-slate-100"
              >
                See all commissions for &quot;{q}&quot;
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

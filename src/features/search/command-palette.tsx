"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Bookmark, Briefcase, CornerDownLeft, MessageCircle, Plus, Search, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFare } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/ui/category";

type Person = { id: string; fullName: string; avatarUrl: string | null; ratingAvg: number | null; reviewCount: number };
type Commission = { id: string; title: string; category: string; fareMin: number; fareMax: number | null; fareUnit: string | null };
type Item = { key: string; label: string; hint?: string; href: string; icon: React.ReactNode; group: string };

const ACTIONS: Item[] = [
  { key: "post", label: "Post a commission", href: "/hiring/post", icon: <Plus className="h-4 w-4" />, group: "Go to" },
  { key: "browse", label: "Browse the board", href: "/browse", icon: <Search className="h-4 w-4" />, group: "Go to" },
  { key: "hub", label: "My hub", href: "/hub", icon: <Briefcase className="h-4 w-4" />, group: "Go to" },
  { key: "messages", label: "Messages", href: "/messages", icon: <MessageCircle className="h-4 w-4" />, group: "Go to" },
  { key: "saved", label: "Saved", href: "/saved", icon: <Bookmark className="h-4 w-4" />, group: "Go to" },
  { key: "profile", label: "My profile", href: "/profile", icon: <UserIcon className="h-4 w-4" />, group: "Go to" },
];

/**
 * Global search and quick navigation, opened with Ctrl/Cmd+K, "/" or the top-bar button.
 * Uses the existing /api/search endpoint (people and open commissions).
 */
export function CommandPalette() {
  const router = useRouter();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [mac, setMac] = useState(false);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 0);
    else { setQ(""); setActive(0); }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) { setPeople([]); setCommissions([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => { if (d.ok) { setPeople(d.users ?? []); setCommissions(d.commissions ?? []); } })
        .catch(() => {});
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const items = useMemo<Item[]>(() => {
    if (!q.trim()) return ACTIONS;
    return [
      ...commissions.map((c) => ({ key: `c-${c.id}`, label: c.title, hint: formatFare(c), href: `/commission/${c.id}`, icon: <CategoryIcon category={c.category} size="sm" />, group: "Commissions" })),
      ...people.map((p) => ({
        key: `u-${p.id}`,
        label: p.fullName,
        hint: p.reviewCount ? `${p.ratingAvg?.toFixed(1)} ★ · ${p.reviewCount} review${p.reviewCount === 1 ? "" : "s"}` : "No reviews yet",
        href: `/u/${p.id}`,
        icon: <Avatar name={p.fullName} src={p.avatarUrl} size="xs" />,
        group: "People",
      })),
      { key: "all", label: `Search the board for “${q.trim()}”`, href: `/browse?q=${encodeURIComponent(q.trim())}`, icon: <Search className="h-4 w-4" />, group: "More" },
    ];
  }, [q, people, commissions]);

  function go(item: Item | undefined) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(items[active]); }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search and go"
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-sm text-muted transition hover:border-brand-300 sm:max-w-md"
      >
        <Search aria-hidden className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left"><span className="sm:hidden">Search</span><span className="hidden sm:inline">Search commissions and people</span></span>
        <kbd className="hidden rounded-md border border-line-strong px-1.5 py-0.5 font-sans text-xs sm:inline">{mac ? "⌘" : "Ctrl"} K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-20" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Search and go" className="pop w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search aria-hidden className="h-5 w-5 text-faint" />
              <input
                ref={input}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={onKey}
                placeholder="Search commissions and people, or jump to a page"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={items[active] ? `${listId}-${items[active].key}` : undefined}
                aria-label="Search"
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none"
              />
              <kbd className="rounded-md border border-line-strong px-1.5 py-0.5 text-xs text-muted">Esc</kbd>
            </div>
            <ul id={listId} role="listbox" aria-label="Results" className="max-h-palette overflow-y-auto p-2">
              {items.map((item, i) => (
                <li key={item.key} role="presentation">
                  {(i === 0 || items[i - 1].group !== item.group) && <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted">{item.group}</p>}
                  <button
                    type="button"
                    id={`${listId}-${item.key}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm", i === active ? "bg-brand-50 text-brand-800" : "text-ink")}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center text-muted">{item.icon}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                    {item.hint && <span className="shrink-0 text-xs text-muted">{item.hint}</span>}
                    {i === active && <CornerDownLeft aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />}
                  </button>
                </li>
              ))}
              {q.trim() && people.length + commissions.length === 0 && (
                <li role="presentation" className="px-3 py-2 text-sm text-muted">No people or open commissions match yet.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

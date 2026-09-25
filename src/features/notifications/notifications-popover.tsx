"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { timeAgoShort } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationsPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) { setItems(data.notifications); setUnread(data.unread); }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}) });
    setItems(items.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    setUnread(0);
  }

  return (
    <div ref={ref} role="dialog" aria-label="Notifications" className="absolute right-0 top-12 z-50 max-h-popover w-80 max-w-popover overflow-y-auto rounded-xl border border-line bg-white p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between px-1 py-1">
        <p className="text-sm font-semibold">Notifications</p>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="tabular text-xs text-muted">{unread} new</span>
          )}
          {items.length > 0 && unread > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-brand-700 hover:underline">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 p-1"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
      ) : items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-muted">You&apos;re all caught up.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((n) => {
            const inner = (
              <div className="flex gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sunken">
                <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-brand-500"}`} />
                <div className="min-w-0">
                <p className={`leading-snug ${n.readAt ? "" : "font-semibold"}`}>{n.title}{!n.readAt && <span className="sr-only"> (unread)</span>}</p>
                {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>}
                <p className="mt-1 text-xs text-muted">{timeAgoShort(n.createdAt)}</p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.link ? (
                  <Link href={n.link} onClick={() => onClose()}>{inner}</Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

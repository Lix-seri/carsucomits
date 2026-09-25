"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

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
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}) });
    setItems(items.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    setUnread(0);
  }

  return (
    <div ref={ref} className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between px-1 py-1">
        <p className="text-sm font-semibold">Notifications</p>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">{unread} new</span>
          )}
          {items.length > 0 && unread > 0 && (
            <button onClick={markAllRead} className="text-[11px] font-semibold text-brand-600 hover:underline">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="px-3 py-6 text-center text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((n) => {
            const inner = (
              <div className={`rounded-lg px-3 py-2 text-sm ${!n.readAt ? "bg-brand-50/50" : "hover:bg-slate-50"}`}>
                <p className="leading-snug">{n.title}</p>
                {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.body}</p>}
                <p className="mt-1 text-xs text-slate-500">{timeAgo(n.createdAt)}</p>
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

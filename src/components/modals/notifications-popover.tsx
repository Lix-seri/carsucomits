"use client";
import { useEffect, useRef } from "react";

const SAMPLE = [
  { title: "Maria Santos accepted your offer for Math Tutoring.", time: "2m ago", unread: true },
  { title: "New applicant on \"Need 50 Flyers\": Jefferson Sevillano.", time: "14m ago", unread: true },
  { title: "Your profile was viewed 12 times today.", time: "1h ago", unread: false },
];

export function NotificationsPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const newCount = SAMPLE.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between px-1 py-1">
        <p className="text-sm font-semibold">Notifications</p>
        {newCount > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">{newCount} new</span>
        )}
      </div>
      <ul className="space-y-1">
        {SAMPLE.map((n, i) => (
          <li key={i} className={`rounded-lg px-3 py-2 text-sm ${n.unread ? "bg-brand-50/50" : "hover:bg-slate-50"}`}>
            <p className="leading-snug">{n.title}</p>
            <p className="mt-1 text-xs text-slate-500">{n.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Filter, Bell, Plus } from "lucide-react";
import { SearchBar } from "@/features/search/search-bar";
import { NotificationsPopover } from "@/features/notifications/notifications-popover";

export function DashboardTopbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    function load() {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          if (active && data.ok) setUnread(data.unread);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, [showNotif]);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
      <SearchBar />
      <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
        <Filter className="h-4 w-4" /> Filter
      </button>
      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        {showNotif && <NotificationsPopover onClose={() => setShowNotif(false)} />}
      </div>
      <Link href="/commissioner/post" className="btn-primary !py-2">
        <Plus className="h-4 w-4" /> Post a Commission
      </Link>
    </div>
  );
}

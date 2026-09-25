/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationsPopover } from "./notifications-popover";

/** Bell with an unread badge (polls every 30 s) that opens the notifications popover. */
export function NotificationsBell() {
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
  );
}

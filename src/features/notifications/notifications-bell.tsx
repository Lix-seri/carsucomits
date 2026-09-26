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
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-line-strong bg-surface hover:bg-sunken"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={showNotif}
      >
        <Bell aria-hidden className="h-5 w-5" />
        {unread > 0 && <span aria-hidden className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-coral-500 ring-2 ring-surface" />}
      </button>
      {showNotif && <NotificationsPopover onClose={() => setShowNotif(false)} />}
    </div>
  );
}

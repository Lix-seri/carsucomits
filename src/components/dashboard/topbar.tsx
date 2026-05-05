"use client";
import { useState } from "react";
import { Filter, Bell, Plus } from "lucide-react";
import { SearchBar } from "@/components/dashboard/search-bar";
import { NotificationsPopover } from "@/components/modals/notifications-popover";
import { PostCommissionModal } from "@/components/modals/post-commission-modal";

export function DashboardTopbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [showPost, setShowPost] = useState(false);

  return (
    <>
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
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          {showNotif && <NotificationsPopover onClose={() => setShowNotif(false)} />}
        </div>
        <button onClick={() => setShowPost(true)} className="btn-primary !py-2">
          <Plus className="h-4 w-4" /> Post a Commission
        </button>
      </div>
      {showPost && <PostCommissionModal onClose={() => setShowPost(false)} />}
    </>
  );
}

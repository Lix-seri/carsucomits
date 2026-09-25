/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
import Link from "next/link";
import { Filter, Plus } from "lucide-react";

/** Signed-in top bar. The layout passes in the search box and the notification bell. */
export function DashboardTopbar({ search, bell }: { search: React.ReactNode; bell: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
      {search}
      <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
        <Filter className="h-4 w-4" /> Filter
      </button>
      {bell}
      <Link href="/commissioner/post" className="btn-primary !py-2">
        <Plus className="h-4 w-4" /> Post a Commission
      </Link>
    </div>
  );
}

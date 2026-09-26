import Link from "next/link";
import { Plus } from "lucide-react";

/** Signed-in top bar. The layout passes in the search box and the notification bell. */
export function DashboardTopbar({ search, bell }: { search: React.ReactNode; bell: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="min-w-0 flex-1">{search}</div>
      {bell}
      <Link href="/hiring/post" className="btn-primary !px-3 !py-2 sm:!px-5" aria-label="Post a Commission">
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Post a Commission</span>
      </Link>
    </div>
  );
}

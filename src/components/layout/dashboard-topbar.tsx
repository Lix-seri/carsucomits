import Link from "next/link";
import { Plus } from "lucide-react";

/** Signed-in top bar: the search palette, the bell, and Post (Post moves to the bottom nav on phones). */
export function DashboardTopbar({ search, bell }: { search: React.ReactNode; bell: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="min-w-0 flex-1">{search}</div>
      {bell}
      <Link href="/hiring/post" className="btn-primary hidden lg:inline-flex">
        <Plus aria-hidden className="h-4 w-4" /> Post a commission
      </Link>
    </div>
  );
}

import { AppShell } from "@/components/layout/app-shell";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import type { Session } from "@/lib/session";
import { SearchBar } from "@/features/search/search-bar";
import { NotificationsBell } from "@/features/notifications/notifications-bell";

/** The app frame for a signed-in student: sidebar, search, bell. Used by every signed-in route. */
export function SignedInShell({ session, children }: { session: Session; children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<DashboardSidebar user={{ fullName: session.fullName, avatarUrl: session.avatarUrl, role: session.role }} />}
      header={<DashboardTopbar search={<SearchBar />} bell={<NotificationsBell />} />}
    >
      {children}
    </AppShell>
  );
}

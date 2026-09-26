import { AppShell } from "@/components/layout/app-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import type { Session } from "@/lib/session";
import { CommandPalette } from "@/features/search/command-palette";
import { NotificationsBell } from "@/features/notifications/notifications-bell";

/** The app frame for a signed-in student: sidebar, search palette, bell and the phone tab bar. */
export function SignedInShell({ session, children }: { session: Session; children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<DashboardSidebar user={{ fullName: session.fullName, avatarUrl: session.avatarUrl, role: session.role }} />}
      header={<DashboardTopbar search={<CommandPalette />} bell={<NotificationsBell />} />}
      bottomNav={<BottomNav />}
    >
      {children}
    </AppShell>
  );
}

import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { pageSession } from "@/lib/session";
import { SearchBar } from "@/features/search/search-bar";
import { NotificationsBell } from "@/features/notifications/notifications-bell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await pageSession();
  // Admins use the Admin Panel; to use the student side they sign in on the Student tab.
  if (session.role === "ADMIN") redirect("/admin");

  return (
    <AppShell
      sidebar={<DashboardSidebar user={{ fullName: session.fullName, avatarUrl: session.avatarUrl, role: session.role }} />}
      header={<DashboardTopbar search={<SearchBar />} bell={<NotificationsBell />} />}
    >
      {children}
    </AppShell>
  );
}

import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen bg-brand-50/40">
      <DashboardSidebar user={{ fullName: session.fullName, avatarUrl: session.avatarUrl, role: session.role }} />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar search={<SearchBar />} bell={<NotificationsBell />} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

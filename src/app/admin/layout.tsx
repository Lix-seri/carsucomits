import { AppShell } from "@/components/layout/app-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { pageSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await pageSession({ admin: true });
  return (
    <AppShell sidebar={<AdminSidebar />} header={<h1 className="text-lg font-bold">Admin Control Panel</h1>}>
      {children}
    </AppShell>
  );
}

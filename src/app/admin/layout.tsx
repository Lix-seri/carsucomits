import { AppShell } from "@/components/layout/app-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { pageSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await pageSession({ admin: true });
  return (
    <AppShell sidebar={<AdminSidebar adminName={session.fullName} />} header={<p className="text-sm font-semibold text-muted">Admin panel</p>}>
      {children}
    </AppShell>
  );
}

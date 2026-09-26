import { AppShell } from "@/components/layout/app-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { pageSession } from "@/lib/session";

// University Student Enterprise Development office (decision 0012). Admins may visit too.
export default async function UsedLayout({ children }: { children: React.ReactNode }) {
  const session = await pageSession({ staff: true });
  return (
    <AppShell sidebar={<AdminSidebar adminName={session.fullName} variant="used" />} header={<p className="text-sm font-semibold text-muted">USED office</p>}>
      {children}
    </AppShell>
  );
}

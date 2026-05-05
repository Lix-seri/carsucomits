import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect("/login?reason=admin-only");
  if (session.role !== "ADMIN") redirect("/dashboard?error=admin-only");

  return (
    <div className="flex min-h-screen bg-brand-50/40">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="text-lg font-bold">Admin Control Panel</h1>
          <button className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-50" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

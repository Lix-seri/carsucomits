import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Admins must use the Admin Panel. To switch to the student side, they must log out
  // and sign back in on the Student tab.
  if (session?.role === "ADMIN") {
    redirect("/admin");
  }

  const dbUser = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { avatarUrl: true } })
    : null;

  const user = session
    ? { fullName: session.fullName, rating: 4.8, verified: true, avatarUrl: dbUser?.avatarUrl ?? null, role: session.role }
    : { fullName: "Guest", rating: 0, verified: false, avatarUrl: null, role: "STUDENT_EMPLOYEE" };

  return (
    <div className="flex min-h-screen bg-brand-50/40">
      <DashboardSidebar user={user} />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

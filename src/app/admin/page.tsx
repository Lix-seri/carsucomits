import Link from "next/link";
import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminDashboard } from "@/features/admin/server";
import { FlaggedUsersTable } from "@/features/admin/flagged-users-table";
import { ReportList } from "@/features/reports/report-list";

export const metadata = { title: "Admin overview" };

export default async function AdminDashboard() {
  const d = await getAdminDashboard(await pageSession({ admin: true }));
  const numbers: [string, number, string][] = [
    ["Users", d.totalUsers, "/admin/users"],
    ["Active commissions", d.activeListings, "/admin/commissions"],
    ["Pending reports", d.pendingReports, "/admin/reports"],
    ["Warned, suspended or banned", d.flaggedAccounts, "/admin/users"],
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader title="Overview" description="What needs attention across CarsuComits." />
      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-white lg:grid-cols-4">
        {numbers.map(([label, value, href]) => (
          <Link key={label} href={href} className="border-b border-r border-line px-4 py-4 transition-colors hover:bg-sunken lg:border-b-0">
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className="tabular mt-1 text-2xl font-semibold">{value}</dd>
          </Link>
        ))}
      </dl>
      <FlaggedUsersTable users={d.flaggedUsers} avgMap={d.avgMap} emptyText="No one has an open report" />
      <ReportList title="Pending reports" reports={d.latestReports} emptyText="No reports waiting" />
    </div>
  );
}

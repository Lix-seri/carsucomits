import { Users, ClipboardList, Flag, AlertOctagon } from "lucide-react";
import { pageSession } from "@/lib/session";
import { Kpi } from "@/components/ui/kpi";
import { getAdminDashboard } from "@/features/admin/server";
import { FlaggedUsersTable } from "@/features/admin/flagged-users-table";
import { ReportList } from "@/features/reports/report-list";

export default async function AdminDashboard() {
  const d = await getAdminDashboard(await pageSession({ admin: true }));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Users" value={d.totalUsers} icon={Users} color="text-brand-600 bg-brand-50" />
        <Kpi label="Active Listings" value={d.activeListings} icon={ClipboardList} color="text-brand-600 bg-brand-50" />
        <Kpi label="Pending Reports" value={d.pendingReports} icon={Flag} color="text-danger-600 bg-danger-50" />
        <Kpi label="Flagged Accounts" value={d.flaggedAccounts} icon={AlertOctagon} color="text-danger-600 bg-danger-50" />
      </div>
      <FlaggedUsersTable users={d.flaggedUsers} avgMap={d.avgMap} emptyText="No flagged users right now." />
      <ReportList title="Pending Reports" reports={d.latestReports} emptyText="All reports resolved." />
    </div>
  );
}

/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
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
        <Kpi label="Total Users" value={d.totalUsers} icon={Users} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Active Listings" value={d.activeListings} icon={ClipboardList} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Pending Reports" value={d.pendingReports} icon={Flag} color="text-red-600 bg-red-50" />
        <Kpi label="Flagged Accounts" value={d.flaggedAccounts} icon={AlertOctagon} color="text-red-600 bg-red-50" />
      </div>
      <FlaggedUsersTable users={d.flaggedUsers} avgMap={d.avgMap} emptyText="No flagged users right now." />
      <ReportList title="Pending Reports" reports={d.latestReports} emptyText="All reports resolved." />
    </div>
  );
}

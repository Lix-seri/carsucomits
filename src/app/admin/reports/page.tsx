import { pageSession } from "@/lib/session";
import { getReportsOverview } from "@/features/admin/server";
import { FlaggedUsersTable } from "@/features/admin/flagged-users-table";
import { ReportList } from "@/features/reports/report-list";

export default async function AdminReports() {
  const { flaggedUsers, allReports, avgMap } = await getReportsOverview(await pageSession({ admin: true }));
  return (
    <div className="space-y-6">
      <FlaggedUsersTable users={flaggedUsers} avgMap={avgMap} emptyText="No flagged users." />
      <ReportList title="All Reports" reports={allReports} emptyText="No reports filed yet." />
    </div>
  );
}

import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { getReportsOverview } from "@/features/admin/server";
import { FlaggedUsersTable } from "@/features/admin/flagged-users-table";
import { ReportList } from "@/features/reports/report-list";

export const metadata = { title: "Reports" };

export default async function AdminReports() {
  const { flaggedUsers, allReports, avgMap } = await getReportsOverview(await pageSession({ admin: true }));
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader title="Reports" description="Reports students filed, newest first, and the people they're about." />
      <FlaggedUsersTable users={flaggedUsers} avgMap={avgMap} emptyText="No one has an open report" />
      <ReportList title="All reports" reports={allReports} emptyText="No reports filed yet" />
    </div>
  );
}

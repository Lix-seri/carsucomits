import { Flag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportActionButtons } from "./report-action-buttons";

type ReportRow = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: Date;
  reporter: { fullName: string };
  reportee: { fullName: string };
};

/** Admin list of reports with Resolve / Escalate / Reopen. */
export function ReportList({ title, reports, emptyText }: { title: string; reports: ReportRow[]; emptyText: string }) {
  return (
    <section aria-labelledby="report-list">
      <h2 id="report-list" className="mb-3 flex items-center gap-2 text-lg font-semibold">
        {title} <span className="tabular text-sm font-medium text-muted">{reports.length}</span>
      </h2>
      {reports.length === 0 ? (
        <EmptyState icon={Flag} title={emptyText} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {reports.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{r.reporter.fullName}</span> <span className="text-muted">reported</span>{" "}
                  <span className="font-semibold">{r.reportee.fullName}</span>
                </p>
                <p className="mt-0.5 text-sm">
                  <span className="font-medium">{r.reason}</span>
                  {r.details && <span className="text-muted"> — {r.details}</span>}
                </p>
                <p className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</p>
              </div>
              <ReportActionButtons reportId={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

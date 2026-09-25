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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {reports.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-sm">
                  <strong>{r.reporter.fullName}</strong> <span className="text-slate-500">reported</span>{" "}
                  <strong className="text-red-600">{r.reportee.fullName}</strong>
                </p>
                <p className="text-xs text-slate-600">Reason: {r.reason}{r.details ? ` — ${r.details}` : ""}</p>
                <p className="text-[11px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <ReportActionButtons reportId={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

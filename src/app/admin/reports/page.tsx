import { Star } from "lucide-react";
import { pageSession } from "@/lib/session";
import { getReportsOverview } from "@/features/admin/server";
import { UserActionButtons } from "@/features/admin/user-action-buttons";
import { ReportActionButtons } from "@/features/reports/report-action-buttons";

const ROLE_LABEL: Record<string, string> = {
  STUDENT_EMPLOYEE: "Student Employee",
  COMMISSIONER: "Commissioner",
  ADMIN: "Admin",
};

export default async function AdminReports() {
  const { flaggedUsers, allReports, avgMap } = await getReportsOverview(await pageSession({ admin: true }));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          Flagged Users
          <span className="grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">{flaggedUsers.length}</span>
        </h2>
        {flaggedUsers.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No flagged users.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 font-semibold">User Name</th>
                  <th className="py-2 font-semibold">Role</th>
                  <th className="py-2 font-semibold">Reason Flagged</th>
                  <th className="py-2 font-semibold">Rating</th>
                  <th className="py-2 font-semibold">Date Reported</th>
                  <th className="py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flaggedUsers.map((u) => {
                  const r = u.receivedReports[0];
                  const avg = avgMap.get(u.id);
                  return (
                    <tr key={u.id}>
                      <td className="py-3 font-semibold">{u.fullName}</td>
                      <td className="py-3 text-slate-600">{ROLE_LABEL[u.role] ?? u.role}</td>
                      <td className="py-3">{r?.reason ?? "—"}</td>
                      <td className="py-3 text-amber-500">
                        {avg != null ? <><Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400" /> {avg.toFixed(1)}</> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 text-slate-600">{r ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="py-3"><UserActionButtons userId={u.id} status={u.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">All Reports</h2>
        {allReports.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No reports filed yet.</p>
        ) : (
          <ul className="space-y-2">
            {allReports.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-sm">
                    <strong>{r.reporter.fullName}</strong>{" "}
                    <span className="text-slate-500">reported</span>{" "}
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
    </div>
  );
}

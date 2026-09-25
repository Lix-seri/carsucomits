import { Star } from "lucide-react";
import { ROLE_LABEL } from "@/lib/labels";
import { UserActionButtons } from "./user-action-buttons";

type FlaggedUser = {
  id: string;
  fullName: string;
  role: string;
  status: string;
  receivedReports: { reason: string; createdAt: Date }[];
};

/** Users with an open report against them, with moderation buttons. */
export function FlaggedUsersTable({ users, avgMap, emptyText }: { users: FlaggedUser[]; avgMap: Map<string, number | null>; emptyText: string }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        Flagged Users
        <span className="grid h-6 w-6 place-items-center rounded-full bg-danger-500 text-xs font-bold text-white">{users.length}</span>
      </h2>
      {users.length === 0 ? (
        <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 font-semibold">User Name</th>
                <th className="py-2 font-semibold">Role</th>
                <th className="py-2 font-semibold">Reason Flagged</th>
                <th className="py-2 font-semibold">Rating</th>
                <th className="py-2 font-semibold">Date Reported</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const latestReport = u.receivedReports[0];
                const avg = avgMap.get(u.id);
                return (
                  <tr key={u.id}>
                    <td className="py-3 font-semibold">{u.fullName}</td>
                    <td className="py-3 text-muted">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td className="py-3">{latestReport?.reason ?? "—"}</td>
                    <td className="py-3 text-warning-500">
                      {avg != null ? <><Star className="mr-1 inline h-3.5 w-3.5 fill-warning-400" /> {avg.toFixed(1)}</> : <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 text-muted">{latestReport ? new Date(latestReport.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3"><UserActionButtons userId={u.id} status={u.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

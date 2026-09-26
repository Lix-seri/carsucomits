import { ShieldCheck, Star } from "lucide-react";
import { ROLE_LABEL } from "@/lib/labels";
import { AccountStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ModerateButton } from "./moderate-button";

type FlaggedUser = {
  id: string;
  fullName: string;
  role: string;
  status: string;
  receivedReports: { reason: string; createdAt: Date }[];
};

/** Users with an open report against them. */
export function FlaggedUsersTable({ users, avgMap, emptyText }: { users: FlaggedUser[]; avgMap: Map<string, number | null>; emptyText: string }) {
  return (
    <section aria-labelledby="flagged">
      <h2 id="flagged" className="mb-3 flex items-center gap-2 text-lg font-semibold">
        Reported users <span className="tabular text-sm font-medium text-muted">{users.length}</span>
      </h2>
      {users.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={emptyText} />
      ) : (
        <div className="rounded-xl border border-line bg-surface px-4 sm:px-5">
          <table className="table-stack">
            <thead>
              <tr className="border-b border-line">
                <th>User</th>
                <th>Latest report</th>
                <th>Rating</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const latest = u.receivedReports[0];
                const avg = avgMap.get(u.id);
                return (
                  <tr key={u.id}>
                    <td data-label="">
                      <p className="font-semibold">{u.fullName}</p>
                      <p className="text-xs text-muted">{ROLE_LABEL[u.role] ?? u.role}</p>
                    </td>
                    <td data-label="Latest report">
                      {latest ? (
                        <>
                          <p>{latest.reason}</p>
                          <p className="text-xs text-muted">{new Date(latest.createdAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td data-label="Rating">
                      {avg != null ? (
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" /> {avg.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td data-label="Status"><AccountStatusBadge status={u.status} /></td>
                    <td data-label="" className="text-right">
                      {u.role !== "ADMIN" && <ModerateButton userId={u.id} userName={u.fullName} status={u.status} />}
                    </td>
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

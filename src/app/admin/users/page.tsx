import { Star } from "lucide-react";
import { pageSession } from "@/lib/session";
import { listUsers } from "@/features/admin/server";
import { UserActionButtons } from "@/features/admin/user-action-buttons";
import { ROLE_LABEL } from "@/lib/labels";

export default async function ManageUsers({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  const { users, avgMap } = await listUsers(await pageSession({ admin: true }), search);

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">User Management</h2>
        <form className="inline">
          <input
            name="q"
            defaultValue={search}
            placeholder="Search users…"
            aria-label="Search users"
            className="input !py-2 !w-56"
          />
        </form>
      </div>
      {users.length === 0 ? (
        <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 font-semibold">Name</th>
                <th className="py-2 font-semibold">Email</th>
                <th className="py-2 font-semibold">Role</th>
                <th className="py-2 font-semibold">Rating</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const avg = avgMap.get(u.id);
                return (
                  <tr key={u.id}>
                    <td className="py-3 font-semibold">{u.fullName}</td>
                    <td className="py-3 text-muted">{u.email}</td>
                    <td className="py-3 text-muted">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td className="py-3 text-warning-500">
                      {avg != null ? <><Star className="mr-1 inline h-3.5 w-3.5 fill-warning-400" /> {avg.toFixed(1)}</> : <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3"><span className="pill bg-sunken text-ink">{u.status}</span></td>
                    <td className="py-3"><UserActionButtons userId={u.id} status={u.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

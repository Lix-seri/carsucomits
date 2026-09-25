/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
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
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2 font-semibold">Name</th>
                <th className="py-2 font-semibold">Email</th>
                <th className="py-2 font-semibold">Role</th>
                <th className="py-2 font-semibold">Rating</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const avg = avgMap.get(u.id);
                return (
                  <tr key={u.id}>
                    <td className="py-3 font-semibold">{u.fullName}</td>
                    <td className="py-3 text-slate-600">{u.email}</td>
                    <td className="py-3 text-slate-600">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td className="py-3 text-amber-500">
                      {avg != null ? <><Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400" /> {avg.toFixed(1)}</> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-3"><span className="pill bg-slate-100 text-slate-700">{u.status}</span></td>
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

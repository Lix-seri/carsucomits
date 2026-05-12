import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { UserActionButtons } from "@/components/admin/user-action-buttons";

const ROLE_LABEL: Record<string, string> = {
  STUDENT_EMPLOYEE: "Student Employee",
  COMMISSIONER: "Commissioner",
  ADMIN: "Admin",
};

export default async function ManageUsers({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const ratings = await Promise.all(
    users.map((u) =>
      prisma.rating.aggregate({ where: { rateeId: u.id }, _avg: { stars: true } }).then((r) => ({ id: u.id, avg: r._avg.stars }))
    )
  );
  const avgMap = new Map(ratings.map((r) => [r.id, r.avg]));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">User Management</h2>
        <form className="inline">
          <input
            name="q"
            defaultValue={search}
            placeholder="Search users…"
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

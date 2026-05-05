import { Users, ClipboardList, Flag, AlertOctagon, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { UserActionButtons } from "@/components/admin/user-action-buttons";
import { ReportActionButtons } from "@/components/admin/report-action-buttons";

const ROLE_LABEL: Record<string, string> = {
  STUDENT_EMPLOYEE: "Student Employee",
  COMMISSIONER: "Commissioner",
  ADMIN: "Admin",
};

export default async function AdminDashboard() {
  const [totalUsers, activeListings, pendingReports, flaggedAccounts, flaggedUsers, latestReports] = await Promise.all([
    prisma.user.count(),
    prisma.commission.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: { in: ["WARNED", "SUSPENDED", "BANNED"] } } }),
    prisma.user.findMany({
      where: { receivedReports: { some: { status: { in: ["PENDING", "UNDER_INVESTIGATION"] } } } },
      include: {
        receivedReports: {
          where: { status: { in: ["PENDING", "UNDER_INVESTIGATION"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { receivedRatings: true } },
      },
      take: 10,
    }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { fullName: true } }, reportee: { select: { fullName: true } } },
      take: 10,
    }),
  ]);

  const ratingsByUser = await Promise.all(
    flaggedUsers.map((u) =>
      prisma.rating.aggregate({ where: { rateeId: u.id }, _avg: { stars: true } }).then((r) => ({ id: u.id, avg: r._avg.stars }))
    )
  );
  const avgMap = new Map(ratingsByUser.map((r) => [r.id, r.avg]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Users" value={totalUsers} icon={Users} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Active Listings" value={activeListings} icon={ClipboardList} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Pending Reports" value={pendingReports} icon={Flag} color="text-red-600 bg-red-50" />
        <Kpi label="Flagged Accounts" value={flaggedAccounts} icon={AlertOctagon} color="text-red-600 bg-red-50" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          Flagged Users
          <span className="grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">{flaggedUsers.length}</span>
        </h2>
        {flaggedUsers.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No flagged users right now.</p>
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
                  const latestReport = u.receivedReports[0];
                  const avg = avgMap.get(u.id);
                  return (
                    <tr key={u.id}>
                      <td className="py-3 font-semibold">{u.fullName}</td>
                      <td className="py-3 text-slate-600">{ROLE_LABEL[u.role] ?? u.role}</td>
                      <td className="py-3">{latestReport?.reason ?? "—"}</td>
                      <td className="py-3 text-amber-500">
                        {avg != null ? <><Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400" /> {avg.toFixed(1)}</> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 text-slate-600">{latestReport ? new Date(latestReport.createdAt).toLocaleDateString() : "—"}</td>
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
        <h2 className="mb-4 text-lg font-bold">Pending Reports</h2>
        {latestReports.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">All reports resolved.</p>
        ) : (
          <ul className="space-y-2">
            {latestReports.map((r) => (
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

function Kpi({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

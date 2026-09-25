import Link from "next/link";
import { ClipboardList, Users, CheckCircle2, Plus, Eye, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { Avatar } from "@/components/ui/avatar";
import { ApplicantDecisionButtons } from "@/features/applications/applicant-decision-buttons";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-emerald-50 text-emerald-700",
  TECHNICAL: "bg-blue-50 text-blue-700",
  GENERAL_ERRANDS: "bg-amber-50 text-amber-700",
  ADMINISTRATIVE: "bg-purple-50 text-purple-700",
};
const STATUS_PILL: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
};

function timeBasedGreeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function CommissionerHome() {
  const session = await getSession();
  const firstName = (session?.fullName ?? "Guest").split(" ")[0];

  if (!session) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        Please <Link href="/login" className="text-brand-600 hover:underline">log in</Link> to view your commissioner dashboard.
      </p>
    );
  }

  const [activeListings, totalApplicants, completedTasks, listings, recentApplicants] = await Promise.all([
    prisma.commission.count({ where: { commissionerId: session.userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.application.count({ where: { commission: { commissionerId: session.userId } } }),
    prisma.commission.count({ where: { commissionerId: session.userId, status: "COMPLETED" } }),
    prisma.commission.findMany({
      where: { commissionerId: session.userId, status: { in: ["OPEN", "IN_PROGRESS", "AWAITING_REVIEW"] } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
      take: 10,
    }),
    prisma.application.findMany({
      where: { commission: { commissionerId: session.userId }, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        applicant: { select: { id: true, fullName: true, avatarUrl: true } },
        commission: { select: { id: true, title: true } },
      },
      take: 10,
    }),
  ]);

  const applicantRatings = await Promise.all(
    recentApplicants.map((a) =>
      prisma.rating.aggregate({ where: { rateeId: a.applicantId }, _avg: { stars: true } })
        .then((r) => ({ id: a.applicantId, avg: r._avg.stars }))
    )
  );
  const ratingMap = new Map(applicantRatings.map((r) => [r.id, r.avg]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{timeBasedGreeting()}, {firstName}!</h1>
        <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your commissions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Active Listings" value={activeListings} icon={ClipboardList} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Total Applicants" value={totalApplicants} icon={Users} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Completed Tasks" value={completedTasks} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">My Active Listings</h2>
          <Link href="/commissioner/post" className="btn-primary !py-2"><Plus className="h-4 w-4" /> Post New</Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No active listings. Click <strong>Post New</strong> to create one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 font-semibold">Task Title</th>
                  <th className="py-2 font-semibold">Category</th>
                  <th className="py-2 font-semibold">Applicants</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 font-medium">{l.title}</td>
                    <td className="py-3"><span className={`pill ${CAT_PILL[l.category] ?? "bg-slate-100 text-slate-700"}`}>{l.category.replace("_", " ")}</span></td>
                    <td className="py-3">{l._count.applications}</td>
                    <td className="py-3"><span className={`pill ${STATUS_PILL[l.status]}`}>{l.status.replace("_", " ")}</span></td>
                    <td className="py-3">
                      <Link href={`/commission/${l.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"><Eye className="h-3.5 w-3.5" /> View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Pending Applicants</h2>
        {recentApplicants.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No pending applicants right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentApplicants.map((a) => {
              const avg = ratingMap.get(a.applicantId);
              return (
                <li key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/u/${a.applicant.id}`} className="shrink-0">
                      <Avatar name={a.applicant.fullName} src={a.applicant.avatarUrl} size="sm" />
                    </Link>
                    <div>
                      <Link href={`/u/${a.applicant.id}`} className="text-sm font-semibold hover:text-brand-600 hover:underline">
                        {a.applicant.fullName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {avg != null ? <><Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400" /> {avg.toFixed(1)}</> : <span>No reviews yet</span>}
                        <span className="mx-1">·</span>
                        Applied to <Link href={`/commission/${a.commission.id}`} className="text-brand-600 hover:underline">{a.commission.title}</Link>
                      </p>
                      {a.coverLetter && <p className="mt-1 text-xs italic text-slate-600">&ldquo;{a.coverLetter}&rdquo;</p>}
                    </div>
                  </div>
                  <ApplicantDecisionButtons applicationId={a.id} />
                </li>
              );
            })}
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

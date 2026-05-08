import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

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
  AWAITING_REVIEW: "bg-blue-50 text-blue-700",
  DISPUTED: "bg-red-100 text-red-700",
};

export default async function ListingsPage() {
  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        Please <Link href="/login" className="text-brand-600 hover:underline">log in</Link>.
      </p>
    );
  }

  const listings = await prisma.commission.findMany({
    where: { commissionerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-slate-500">Manage your commission listings.</p>
        </div>
        <Link href="/commissioner/post" className="btn-primary"><Plus className="h-4 w-4" /> Post New</Link>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-500 shadow-card">
          You haven&apos;t posted any commissions yet.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
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
                  <td className="py-3"><span className={`pill ${STATUS_PILL[l.status] ?? "bg-slate-100 text-slate-700"}`}>{l.status.replace("_", " ")}</span></td>
                  <td className="py-3">
                    <Link href={`/commission/${l.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"><Eye className="h-3.5 w-3.5" /> View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

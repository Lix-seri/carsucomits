import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { pageSession } from "@/lib/session";
import { getMyListings } from "@/features/commissions/server";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-brand-50 text-brand-700",
  TECHNICAL: "bg-info-50 text-info-700",
  GENERAL_ERRANDS: "bg-warning-50 text-warning-700",
  ADMINISTRATIVE: "bg-info-50 text-info-700",
};
const STATUS_PILL: Record<string, string> = {
  OPEN: "bg-brand-50 text-brand-700",
  IN_PROGRESS: "bg-warning-50 text-warning-700",
  COMPLETED: "bg-sunken text-ink",
  CANCELLED: "bg-danger-50 text-danger-700",
  AWAITING_REVIEW: "bg-info-50 text-info-700",
  DISPUTED: "bg-danger-100 text-danger-700",
};

export default async function ListingsPage() {
  const session = await pageSession();
  const listings = await getMyListings(session.userId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted">Manage your commission listings.</p>
        </div>
        <Link href="/commissioner/post" className="btn-primary"><Plus className="h-4 w-4" /> Post New</Link>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-4 py-12 text-center text-muted shadow-card">
          You haven&apos;t posted any commissions yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white p-6 shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 font-semibold">Task Title</th>
                <th className="py-2 font-semibold">Category</th>
                <th className="py-2 font-semibold">Applicants</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listings.map((l) => (
                <tr key={l.id}>
                  <td className="py-3 font-medium">{l.title}</td>
                  <td className="py-3"><span className={`pill ${CAT_PILL[l.category] ?? "bg-sunken text-ink"}`}>{l.category.replace("_", " ")}</span></td>
                  <td className="py-3">{l._count.applications}</td>
                  <td className="py-3"><span className={`pill ${STATUS_PILL[l.status] ?? "bg-sunken text-ink"}`}>{l.status.replace("_", " ")}</span></td>
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

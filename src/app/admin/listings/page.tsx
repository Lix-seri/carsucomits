import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { pageSession } from "@/lib/session";
import { listAllListings } from "@/features/admin/server";
import { formatFare } from "@/lib/format";

const CAT_PILL: Record<string, string> = {
  ACADEMIC: "bg-brand-50 text-brand-700",
  TECHNICAL: "bg-info-50 text-info-700",
  GENERAL_ERRANDS: "bg-warning-50 text-warning-700",
  ADMINISTRATIVE: "bg-info-50 text-info-700",
};
const STATUS_PILL: Record<string, string> = {
  OPEN: "bg-brand-50 text-brand-700",
  IN_PROGRESS: "bg-warning-50 text-warning-700",
  AWAITING_REVIEW: "bg-info-50 text-info-700",
  COMPLETED: "bg-sunken text-ink",
  CANCELLED: "bg-danger-50 text-danger-700",
  DISPUTED: "bg-danger-100 text-danger-700",
};

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const search = (q ?? "").trim();
  const statusFilter = status?.trim();

  const { listings, totalCount, counts } = await listAllListings(await pageSession({ admin: true }), search, statusFilter);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="All" value={totalCount} active={!statusFilter} href="/admin/listings" />
        <KpiCard label="Open" value={counts.OPEN ?? 0} active={statusFilter === "OPEN"} href="/admin/listings?status=OPEN" />
        <KpiCard label="In Progress" value={counts.IN_PROGRESS ?? 0} active={statusFilter === "IN_PROGRESS"} href="/admin/listings?status=IN_PROGRESS" />
        <KpiCard label="Awaiting Review" value={counts.AWAITING_REVIEW ?? 0} active={statusFilter === "AWAITING_REVIEW"} href="/admin/listings?status=AWAITING_REVIEW" />
        <KpiCard label="Completed" value={counts.COMPLETED ?? 0} active={statusFilter === "COMPLETED"} href="/admin/listings?status=COMPLETED" />
        <KpiCard label="Cancelled" value={counts.CANCELLED ?? 0} active={statusFilter === "CANCELLED"} href="/admin/listings?status=CANCELLED" />
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">
            All Listings <span className="text-sm font-normal text-muted">({listings.length})</span>
          </h2>
          <form className="inline">
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5">
              <Search className="h-4 w-4 text-muted" />
              <input
                name="q"
                defaultValue={search}
                placeholder="Search title or description…"
                aria-label="Search listings"
                className="w-64 bg-transparent text-sm outline-none"
              />
            </div>
          </form>
        </div>

        {listings.length === 0 ? (
          <p className="rounded-lg bg-sunken px-4 py-12 text-center text-sm text-muted">
            {search || statusFilter
              ? "No listings match your filters."
              : "No commissions in the system yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-2 font-semibold">Title</th>
                  <th className="py-2 font-semibold">Commissioner</th>
                  <th className="py-2 font-semibold">Category</th>
                  <th className="py-2 font-semibold">Fare</th>
                  <th className="py-2 font-semibold">Applicants</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Posted</th>
                  <th className="py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-sunken/50">
                    <td className="py-3">
                      <Link href={`/commission/${l.id}`} className="font-semibold hover:text-brand-600">
                        {l.title}
                      </Link>
                    </td>
                    <td className="py-3 text-muted">{l.commissioner.fullName}</td>
                    <td className="py-3">
                      <span className={`pill ${CAT_PILL[l.category] ?? "bg-sunken text-ink"}`}>
                        {l.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-brand-600">{formatFare(l)}</td>
                    <td className="py-3">{l._count.applications}</td>
                    <td className="py-3">
                      <span className={`pill ${STATUS_PILL[l.status] ?? "bg-sunken text-ink"}`}>
                        {l.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/commission/${l.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, active, href }: { label: string; value: number; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col rounded-xl border p-3 transition ${
        active
          ? "border-brand-500 bg-brand-50 shadow-soft"
          : "border-line bg-white hover:border-brand-300 hover:bg-sunken"
      }`}
    >
      <span className="text-2xl font-bold">{value}</span>
      <span className={`text-xs ${active ? "font-semibold text-brand-700" : "text-muted"}`}>{label}</span>
    </Link>
  );
}

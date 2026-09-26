import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { pageSession } from "@/lib/session";
import { formatFare } from "@/lib/format";
import { COMMISSION_STATUS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { CategoryBadge, CommissionStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listAllListings } from "@/features/admin/server";

export const metadata = { title: "Commissions" };

export default async function AdminListings({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const search = (q ?? "").trim();
  const statusFilter = status?.trim();
  const { listings, totalCount, counts } = await listAllListings(await pageSession({ admin: true }), search, statusFilter);
  const filters: [string, string, number][] = [
    ["", "All", totalCount],
    ...Object.entries(COMMISSION_STATUS).map(([k, v]) => [k, v.label, counts[k] ?? 0] as [string, string, number]),
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Commissions" description="Every commission on the site, newest first." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          {filters.map(([value, label, count]) => {
            const active = (statusFilter ?? "") === value;
            const href = `/admin/commissions?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(value ? { status: value } : {}) })}`;
            return (
              <Link
                key={value || "all"}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface hover:border-brand-300")}
              >
                {label} <span className={cn("tabular", active ? "text-white/80" : "text-muted")}>{count}</span>
              </Link>
            );
          })}
        </nav>
        <form className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 sm:w-72">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <Search className="h-4 w-4 text-faint" />
          <input name="q" defaultValue={search} placeholder="Title or description" aria-label="Search commissions" className="w-full bg-transparent py-2 text-sm outline-none" />
        </form>
      </div>

      {listings.length === 0 ? (
        <EmptyState icon={ClipboardList} title={search || statusFilter ? "No commissions match" : "No commissions yet"} />
      ) : (
        <div className="rounded-xl border border-line bg-surface px-4 sm:px-5">
          <table className="table-stack">
            <thead>
              <tr className="border-b border-line">
                <th>Commission</th>
                <th>Category</th>
                <th>Fare</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listings.map((l) => (
                <tr key={l.id}>
                  <td data-label="">
                    <Link href={`/commission/${l.id}`} className="font-semibold hover:text-brand-700 hover:underline">{l.title}</Link>
                    <p className="text-xs text-muted">by {l.commissioner.fullName}</p>
                  </td>
                  <td data-label="Category"><CategoryBadge category={l.category} /></td>
                  <td data-label="Fare" className="tabular font-semibold">{formatFare(l)}</td>
                  <td data-label="Applicants" className="tabular">{l._count.applications}</td>
                  <td data-label="Status"><CommissionStatusBadge status={l.status} /></td>
                  <td data-label="Posted" className="text-xs text-muted">{new Date(l.createdAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

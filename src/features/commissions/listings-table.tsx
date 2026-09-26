import Link from "next/link";
import { formatFare } from "@/lib/format";
import { CategoryBadge, CommissionStatusBadge } from "@/components/ui/badge";

type Listing = {
  id: string;
  title: string;
  category: string;
  status: string;
  fareMin: number;
  fareMax: number | null;
  fareUnit: string | null;
  _count: { applications: number };
};

/** Your posted commissions. A table on desktop, labelled rows on phones. */
export function ListingsTable({ listings }: { listings: Listing[] }) {
  return (
    <table className="table-stack">
      <thead>
        <tr className="border-b border-line">
          <th>Commission</th>
          <th>Category</th>
          <th>Fare</th>
          <th>Applicants</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {listings.map((l) => (
          <tr key={l.id}>
            <td data-label="">
              <Link href={`/commission/${l.id}`} className="font-semibold hover:text-brand-700">{l.title}</Link>
            </td>
            <td data-label="Category"><CategoryBadge category={l.category} /></td>
            <td data-label="Fare" className="whitespace-nowrap">{formatFare(l)}</td>
            <td data-label="Applicants">
              {l.status === "OPEN" ? (
                <Link href={`/hiring/applicants?commissionId=${l.id}`} className="font-semibold text-brand-700 hover:underline">
                  {l._count.applications}
                </Link>
              ) : (
                l._count.applications
              )}
            </td>
            <td data-label="Status"><CommissionStatusBadge status={l.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

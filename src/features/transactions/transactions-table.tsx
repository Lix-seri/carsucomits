import Link from "next/link";
import { Receipt } from "lucide-react";
import { CommissionStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Transaction } from "./server";

const day = (d: Date) => d.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });

/**
 * Transaction rows. With `meId` it reads from that person's side ("You paid" / "You earned");
 * without it (admin), both parties are shown.
 */
export function TransactionsTable({ transactions, meId, empty }: { transactions: Transaction[]; meId?: string; empty: React.ReactNode }) {
  if (transactions.length === 0) return <EmptyState icon={Receipt} title="No transactions yet">{empty}</EmptyState>;
  return (
    <div className="rounded-xl border border-line bg-surface px-4 sm:px-5">
      <table className="table-stack">
        <thead>
          <tr className="border-b border-line">
            <th>Date</th>
            <th>Commission</th>
            <th>{meId ? "With" : "Poster → worker"}</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {transactions.map((t) => {
            const paying = meId === t.poster.id;
            const other = paying ? t.worker : t.poster;
            return (
              <tr key={t.id}>
                <td data-label="Date" className="whitespace-nowrap text-muted">{day(t.date)}</td>
                <td data-label="">
                  <Link href={`/commission/${t.id}`} className="font-semibold hover:text-brand-700 hover:underline">{t.title}</Link>
                </td>
                <td data-label={meId ? "With" : "Parties"}>
                  {meId ? (
                    <>
                      <Link href={`/u/${other.id}`} className="hover:underline">{other.name}</Link>
                      <p className="text-xs text-muted">{paying ? "you hired them" : "hired you"}</p>
                    </>
                  ) : (
                    <span>{t.poster.name} → {t.worker.name}</span>
                  )}
                </td>
                <td data-label="Amount" className="tabular whitespace-nowrap">
                  <span className="font-semibold">{t.amount}</span>
                  {meId && <p className="text-xs text-muted">{paying ? "you pay" : "you earn"}</p>}
                </td>
                <td data-label="Status"><CommissionStatusBadge status={t.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

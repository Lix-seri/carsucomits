import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { listMyTransactions } from "@/features/transactions/server";
import { TransactionsTable } from "@/features/transactions/transactions-table";

export const metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const session = await pageSession();
  const { transactions, paidFrom, earnedFrom } = await listMyTransactions(session);
  const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Transactions"
        description="Every commission you hired someone for or were hired to do. CarSUComits doesn't handle payments, so completed means the work is done, not that money changed hands."
      />
      <dl className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-r border-line px-4 py-3">
          <dt className="text-xs font-semibold text-muted">Earned on completed work, from</dt>
          <dd className="tabular mt-1 text-xl font-semibold">{peso(earnedFrom)}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs font-semibold text-muted">Paid for completed work, from</dt>
          <dd className="tabular mt-1 text-xl font-semibold">{peso(paidFrom)}</dd>
        </div>
      </dl>
      <TransactionsTable transactions={transactions} meId={session.userId} empty="When you hire someone or get hired, the commission shows up here." />
    </div>
  );
}

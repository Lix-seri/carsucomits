import Link from "next/link";
import { pageSession } from "@/lib/session";
import { COMMISSION_STATUS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { listAllTransactions } from "@/features/transactions/server";
import { transactionFilterSchema } from "@/features/transactions/schemas";
import { TransactionsTable } from "@/features/transactions/transactions-table";

export const metadata = { title: "Transactions" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminTransactions({ searchParams }: Props) {
  const session = await pageSession({ admin: true });
  const parsed = transactionFilterSchema.safeParse(await searchParams);
  const filter = parsed.success ? parsed.data : {};
  const { transactions, completedFrom } = await listAllTransactions(session, filter);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Transactions" description={`Every hired commission. Completed work in this view: from ₱${completedFrom.toLocaleString("en-PH")}.`} />
      <form className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <label className="text-sm">
          <span className="label">Person</span>
          <input name="q" defaultValue={filter.q ?? ""} placeholder="Name or email" className="input" />
        </label>
        <label className="text-sm">
          <span className="label">Status</span>
          <select name="status" defaultValue={filter.status ?? ""} className="input">
            <option value="">Any</option>
            {Object.entries(COMMISSION_STATUS).filter(([k]) => k !== "OPEN").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="label">From</span>
          <input type="date" name="from" defaultValue={filter.from ?? ""} className="input" />
        </label>
        <label className="text-sm">
          <span className="label">To</span>
          <input type="date" name="to" defaultValue={filter.to ?? ""} className="input" />
        </label>
        <div className="flex gap-2">
          <button className="btn-primary">Filter</button>
          <Link href="/admin/transactions" className="btn-ghost">Clear</Link>
        </div>
      </form>
      {!parsed.success && <p role="alert" className="mb-4 text-sm text-danger-600">Some filters weren&apos;t valid and were ignored.</p>}
      <TransactionsTable transactions={transactions} empty="Nothing matches these filters." />
    </div>
  );
}

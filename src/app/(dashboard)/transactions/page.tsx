import { Info } from "lucide-react";
import { pageSession } from "@/lib/session";
import { peso } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { listMyTransactions } from "@/features/transactions/server";
import { TransactionsTable } from "@/features/transactions/transactions-table";

export const metadata = { title: "Transactions" };

/** Earned vs paid as two bars, only when there is something to compare. */
function EarnedVsPaid({ earned, paid }: { earned: number; paid: number }) {
  const max = Math.max(earned, paid, 1);
  const rows = [
    { label: "You earned", value: earned, bar: "bg-brand-500" },
    { label: "You paid", value: paid, bar: "bg-gold-400" },
  ];
  return (
    <figure className="rounded-3xl border-2 border-line bg-surface p-5">
      <figcaption className="font-display text-lg font-bold">Completed work</figcaption>
      <p className="text-sm text-muted">Totals use each commission&apos;s minimum fare.</p>
      <dl className="mt-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="flex items-baseline justify-between gap-2 text-sm font-semibold">
              {r.label}
              <span className="font-display text-2xl font-extrabold tabular">{peso(r.value)}</span>
            </dt>
            <dd className="mt-1 h-4 overflow-hidden rounded-full bg-sunken" aria-hidden>
              <span className={`block h-full rounded-full ${r.bar}`} style={{ width: `${Math.round((r.value / max) * 100)}%` }} />
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

export default async function TransactionsPage() {
  const session = await pageSession();
  const { transactions, paidFrom, earnedFrom } = await listMyTransactions(session);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Transactions" description="Every commission you hired someone for, or were hired to do." />
      <p role="note" className="flex gap-3 rounded-2xl border border-info-200 bg-info-50 p-4 text-sm text-info-800">
        <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <span>
          <span className="font-semibold">CarSUComits doesn&apos;t handle payments.</span> You and the other student settle the fare directly. Here,
          &ldquo;completed&rdquo; means the work is done, not that money changed hands.
        </span>
      </p>
      {earnedFrom + paidFrom > 0 && <EarnedVsPaid earned={earnedFrom} paid={paidFrom} />}
      <TransactionsTable transactions={transactions} meId={session.userId} empty="When you hire someone or get hired, the commission shows up here." />
    </div>
  );
}

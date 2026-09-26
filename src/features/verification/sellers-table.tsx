"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Store } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/form";

type Seller = {
  id: string;
  fullName: string;
  email: string;
  verifiedAt: string | null;
  completed: number;
  active: number;
  earnedFrom: number;
};

/** Registered student sellers with their activity; suspend or reinstate selling, with a reason. */
export function SellersTable({ sellers }: { sellers: Seller[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<Seller | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const suspending = !!target?.verifiedAt;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setBusy(true);
    const res = await api(`/api/sellers/${target.id}/status`, { json: { action: suspending ? "SUSPEND" : "REINSTATE", reason } });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setTarget(null);
    router.refresh();
  }

  if (sellers.length === 0) return <EmptyState icon={Store} title="No sellers yet">Students appear here once their CCIS verification is approved.</EmptyState>;

  return (
    <>
      <div className="rounded-xl border border-line bg-white px-4 sm:px-5">
        <table className="table-stack">
          <thead>
            <tr className="border-b border-line">
              <th>Seller</th>
              <th>Completed</th>
              <th>In progress</th>
              <th>Earned (from)</th>
              <th>Selling</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sellers.map((s) => (
              <tr key={s.id}>
                <td data-label="">
                  <p className="font-semibold">{s.fullName}</p>
                  <p className="break-all text-xs text-muted">{s.email}</p>
                </td>
                <td data-label="Completed" className="tabular">{s.completed}</td>
                <td data-label="In progress" className="tabular">{s.active}</td>
                <td data-label="Earned (from)" className="tabular">₱{s.earnedFrom.toLocaleString("en-PH")}</td>
                <td data-label="Selling">{s.verifiedAt ? <Badge tone="brand">Active</Badge> : <Badge tone="danger">Suspended</Badge>}</td>
                <td data-label="" className="text-right">
                  <button onClick={() => { setError(null); setReason(""); setTarget(s); }} className="btn-secondary btn-sm">
                    {s.verifiedAt ? "Suspend selling…" : "Reinstate…"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={target !== null}
        onClose={() => !busy && setTarget(null)}
        title={`${suspending ? "Suspend" : "Reinstate"} ${target?.fullName ?? ""} as a seller`}
        description={suspending ? "They can still post and message, but can't apply to or be hired for commissions." : "They can apply to commissions again."}
      >
        <form noValidate onSubmit={submit} className="space-y-4">
          <Field label="Reason" error={error} hint="Recorded in the activity log and sent to the student.">
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input min-h-20" maxLength={500} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setTarget(null)} disabled={busy}>Cancel</button>
            <button type="submit" className={suspending ? "btn-danger" : "btn-primary"} disabled={busy}>
              {busy ? "Saving…" : suspending ? "Suspend selling" : "Reinstate"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

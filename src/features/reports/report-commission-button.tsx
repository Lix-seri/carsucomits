"use client";
import { useState } from "react";
import { Flag } from "lucide-react";
import { api } from "@/lib/api";
import { REPORT_REASONS } from "@/lib/labels";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/ui/form";

/** Report this commission to the admins, for example a request for graded academic work. */
export function ReportCommissionButton({ commissionId }: { commissionId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const errorFor = (f: string) => (error?.field === f ? error.message : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await api(`/api/commissions/${commissionId}/report`, { json: { reason, details } });
    setBusy(false);
    if (!res.ok) return setError({ field: res.field, message: res.error });
    setOpen(false);
    setSent(true);
  }

  if (sent) return <p role="status" className="text-sm text-muted">Reported. Admins will review it.</p>;
  return (
    <>
      <button type="button" onClick={() => { setError(null); setOpen(true); }} className="btn-ghost btn-sm text-muted">
        <Flag className="h-3.5 w-3.5" /> Report this commission
      </button>
      <Dialog open={open} onClose={() => !busy && setOpen(false)} title="Report this commission" description="Admins review every report. The poster won't see your name.">
        <form noValidate onSubmit={submit} className="space-y-3">
          <Field label="Reason" error={errorFor("reason")}>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="" disabled>Choose a reason</option>
              {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="What's wrong?" error={errorFor("details")} hint="At least 10 characters.">
            <textarea className="input min-h-24" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} />
          </Field>
          <FormError message={error && !["reason", "details"].includes(error.field ?? "") ? error.message : null} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={busy} className="btn-danger">{busy ? "Sending…" : "Send report"}</button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

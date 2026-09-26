"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/form";

type Request = {
  id: string;
  studentIdNumber: string;
  proofName: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
};

/** Pending CCIS verification requests: open the proof, then approve or reject with a reason. */
export function VerificationQueue({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Request | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<{ id?: string; field?: string; message: string } | null>(null);

  async function decide(id: string, decision: "APPROVE" | "REJECT", note?: string) {
    setBusy(id);
    const res = await api(`/api/verification/${id}/decision`, { json: { decision, note } });
    setBusy(null);
    if (!res.ok) return setError({ id, field: res.field, message: res.error });
    setError(null);
    setRejecting(null);
    setNote("");
    router.refresh();
  }

  if (requests.length === 0) return <EmptyState icon={BadgeCheck} title="No requests waiting">New CCIS verification requests appear here.</EmptyState>;

  return (
    <>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {requests.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{r.user.fullName}</p>
              <p className="break-all text-muted">{r.user.email}</p>
              <p className="mt-1">
                Student ID <span className="tabular font-semibold">{r.studentIdNumber}</span>
                <span className="text-muted"> · sent {new Date(r.createdAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</span>
              </p>
              <a href={`/api/verification/${r.id}/proof`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                Open proof <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {error?.id === r.id && !rejecting && <p role="alert" className="mt-1 text-xs text-danger-600">{error.message}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => decide(r.id, "APPROVE")} disabled={busy !== null} className="btn-primary btn-sm">
                {busy === r.id ? "Saving…" : `Approve ${r.user.fullName.split(" ")[0]}`}
              </button>
              <button onClick={() => { setError(null); setNote(""); setRejecting(r); }} disabled={busy !== null} className="btn-secondary btn-sm">Reject…</button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={rejecting !== null} onClose={() => !busy && setRejecting(null)} title={`Reject ${rejecting?.user.fullName ?? ""}'s request`} description="The student sees your reason and can send a new request.">
        <form noValidate onSubmit={(e) => { e.preventDefault(); if (rejecting) decide(rejecting.id, "REJECT", note); }} className="space-y-4">
          <Field label="Reason" error={error?.field === "note" || (error && !error.field) ? error.message : null}>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input min-h-20" maxLength={500} placeholder="The ID photo is blurry; send a clearer one." />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRejecting(null)} disabled={busy !== null}>Cancel</button>
            <button type="submit" className="btn-danger" disabled={busy !== null}>{busy ? "Saving…" : "Reject request"}</button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

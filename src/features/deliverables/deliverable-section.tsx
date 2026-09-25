"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/form";
import { api } from "@/lib/api";

type Deliverable = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  message: string | null;
  status: string;
  reviewerNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  submitter: { fullName: string; avatarUrl: string | null };
};

const STATUS_PILL: Record<string, string> = {
  SUBMITTED: "bg-warning-100 text-warning-700",
  APPROVED: "bg-brand-100 text-brand-700",
  REVISION_REQUESTED: "bg-danger-100 text-danger-700",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeliverableSection({
  commissionId, isOwner, isAwardedStudent, commissionStatus, initialDeliverables,
}: {
  commissionId: string;
  isOwner: boolean;
  isAwardedStudent: boolean;
  commissionStatus: string;
  initialDeliverables: Deliverable[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitDeliverable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Pick a file to upload."); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (message.trim()) fd.append("message", message.trim());
      const res = await fetch(`/api/commissions/${commissionId}/deliverables`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed."); return; }
      setMessage("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // Revision notes are asked for in a dialog; errors show next to the buttons.
  const [revisionFor, setRevisionFor] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [decideError, setDecideError] = useState<{ id: string; message: string } | null>(null);

  async function decide(deliverableId: string, action: "APPROVE" | "REQUEST_REVISION") {
    setBusy(true);
    setDecideError(null);
    const res = await api(`/api/deliverables/${deliverableId}/decision`, { json: { action, notes: action === "REQUEST_REVISION" ? notes.trim() : undefined } });
    setBusy(false);
    if (!res.ok) {
      if (action === "REQUEST_REVISION") setNotesError(res.error);
      else setDecideError({ id: deliverableId, message: res.error });
      return;
    }
    setRevisionFor(null);
    setNotes("");
    router.refresh();
  }

  const canSubmit = isAwardedStudent && (commissionStatus === "IN_PROGRESS" || commissionStatus === "AWAITING_REVIEW");

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">📦 Job Workspace — Deliverables</h2>

      {canSubmit && (
        <form onSubmit={submitDeliverable} className="mb-6 rounded-xl border border-dashed border-line-strong bg-sunken p-5">
          <p className="mb-3 text-sm font-semibold">Submit a deliverable</p>
          <input ref={fileRef} type="file" aria-label="Deliverable file" className="block w-full text-sm" />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message to the commissioner…"
            className="input mt-3 min-h-20"
          />
          {error && <p className="mt-2 text-xs text-danger-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-3">
            <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Submit deliverable"}
          </button>
          <p className="mt-2 text-xs text-muted">Up to 20 MB. Images, PDFs, docs, spreadsheets, or zip archives.</p>
        </form>
      )}

      {initialDeliverables.length === 0 ? (
        <p className="rounded-lg bg-sunken px-4 py-6 text-center text-sm text-muted">
          No deliverables yet.
          {canSubmit && " Use the form above to submit your work."}
        </p>
      ) : (
        <ul className="space-y-3">
          {initialDeliverables.map((d) => (
            <li key={d.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={d.submitter.fullName} src={d.submitter.avatarUrl} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{d.submitter.fullName}</p>
                    <p className="text-xs text-muted">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {new Date(d.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`pill ${STATUS_PILL[d.status]}`}>
                  {d.status === "SUBMITTED" && <Clock className="mr-1 inline h-3 w-3" />}
                  {d.status === "APPROVED" && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                  {d.status === "REVISION_REQUESTED" && <XCircle className="mr-1 inline h-3 w-3" />}
                  {d.status.replace("_", " ")}
                </span>
              </div>

              <a
                href={d.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-sunken"
              >
                <FileText className="h-4 w-4 text-brand-600" />
                <span className="font-medium">{d.fileName}</span>
                <span className="text-xs text-muted">({formatSize(d.fileSize)})</span>
              </a>

              {d.message && (
                <div className="mt-3 rounded-lg bg-sunken p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted">
                    <MessageSquare className="h-3 w-3" /> From {d.submitter.fullName}:
                  </p>
                  <p className="whitespace-pre-line text-ink">{d.message}</p>
                </div>
              )}

              {d.reviewerNotes && (
                <div className={`mt-3 rounded-lg p-3 text-sm ${d.status === "APPROVED" ? "bg-brand-50" : "bg-danger-50"}`}>
                  <p className={`mb-1 text-xs font-semibold ${d.status === "APPROVED" ? "text-brand-700" : "text-danger-700"}`}>
                    Reviewer notes:
                  </p>
                  <p className={`whitespace-pre-line ${d.status === "APPROVED" ? "text-brand-800" : "text-danger-700"}`}>
                    {d.reviewerNotes}
                  </p>
                </div>
              )}

              {isOwner && d.status === "SUBMITTED" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => decide(d.id, "APPROVE")}
                    disabled={busy}
                    className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => { setNotes(""); setNotesError(null); setRevisionFor(d.id); }}
                    disabled={busy}
                    className="rounded-lg border border-danger-200 bg-white px-4 py-1.5 text-sm font-semibold text-danger-600 hover:bg-danger-50 disabled:opacity-50"
                  >
                    <XCircle className="mr-1 inline h-3.5 w-3.5" /> Request revision
                  </button>
                </div>
              )}
              {decideError?.id === d.id && <p role="alert" className="mt-2 text-xs text-danger-600">{decideError.message}</p>}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={revisionFor !== null} onClose={() => !busy && setRevisionFor(null)} title="Request a revision" description="Tell the student what to change. They'll see this with the deliverable.">
        <form noValidate onSubmit={(e) => { e.preventDefault(); if (revisionFor) decide(revisionFor, "REQUEST_REVISION"); }} className="space-y-4">
          <Field label="What needs to change?" error={notesError}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-28" maxLength={1000} autoFocus />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRevisionFor(null)} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Sending…" : "Request revision"}</button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}

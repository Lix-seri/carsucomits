"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/ui/form";

export function ApplyButton({ commissionId, disabled, label = "Apply Now" }: { commissionId: string; disabled?: boolean; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await api(`/api/commissions/${commissionId}/apply`, { json: { coverLetter } });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setOpen(false);
    router.push("/hub");
    router.refresh();
  }

  if (disabled) {
    return (
      <button disabled className="btn-secondary">
        {label}
      </button>
    );
  }

  return (
    <>
      <button onClick={() => { setError(null); setOpen(true); }} className="btn-primary">
        {label} <ArrowRight className="h-3.5 w-3.5" />
      </button>
      <Dialog open={open} onClose={() => !busy && setOpen(false)} title="Apply to this commission" description="The commissioner sees your profile, ratings and this note.">
        <form noValidate onSubmit={submit} className="space-y-4">
          <Field label={<>Cover letter <span className="font-normal text-muted">(optional)</span></>} hint={`${coverLetter.length} / 500`}>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Briefly tell the commissioner why you're a good fit."
              maxLength={500}
              className="input min-h-28"
            />
          </Field>
          <FormError message={error} />
          <div className="flex gap-3">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? "Submitting…" : "Submit Application"}</button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

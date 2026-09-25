/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

export function ApplyButton({
  commissionId, disabled, label = "Apply Now",
}: { commissionId: string; disabled?: boolean; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/commissions/${commissionId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to apply."); return; }
      router.refresh();
      setOpen(false);
      router.push("/hub");
    } finally {
      setBusy(false);
    }
  }

  if (disabled) {
    return (
      <button disabled className="rounded-lg bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-500">
        {label}
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        {label} <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Apply to this commission</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Cover letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly tell the commissioner why you're a good fit. (max 500 chars)"
                  maxLength={500}
                  className="input min-h-[120px]"
                />
                <p className="mt-1 text-xs text-slate-500">{coverLetter.length} / 500</p>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary flex-1">
                  {busy ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

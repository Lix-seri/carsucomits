"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/ui/form";

type Action = "WARN" | "SUSPEND" | "BAN" | "REINSTATE";

const ACTIONS: Record<Action, { label: string; effect: string; danger: boolean }> = {
  WARN: { label: "Warn", effect: "They get a notification with your reason. Nothing else changes.", danger: false },
  SUSPEND: { label: "Suspend", effect: "Signed out now and can't sign in until reinstated.", danger: true },
  BAN: { label: "Ban", effect: "Signed out and blocked. Only an admin can reinstate them.", danger: true },
  REINSTATE: { label: "Reinstate", effect: "The account goes back to active.", danger: false },
};

const AVAILABLE: Record<string, Action[]> = {
  ACTIVE: ["WARN", "SUSPEND", "BAN"],
  WARNED: ["SUSPEND", "BAN", "REINSTATE"],
  SUSPENDED: ["REINSTATE", "BAN"],
  BANNED: ["REINSTATE"],
};

/** One quiet row action; the decision and its reason happen in a dialog that names the person. */
export function ModerateButton({ userId, userName, status }: { userId: string; userName: string; status: string }) {
  const router = useRouter();
  const options = AVAILABLE[status] ?? [];
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action>(options[0] ?? "WARN");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await api(`/api/admin/users/${userId}/action`, { json: { action, reason } });
    setBusy(false);
    if (!res.ok) return setError({ field: res.field, message: res.error });
    setOpen(false);
    setReason("");
    router.refresh();
  }

  if (options.length === 0) return null;
  const chosen = ACTIONS[action];
  return (
    <>
      <button type="button" className="btn-secondary btn-sm" onClick={() => { setError(null); setAction(options[0]); setOpen(true); }}>
        Moderate…
      </button>
      <Dialog open={open} onClose={() => !busy && setOpen(false)} title={`Moderate ${userName}`} description="Every action is recorded in the activity log with your reason.">
        <form noValidate onSubmit={submit} className="space-y-4">
          <fieldset>
            <legend className="label">Action</legend>
            <div className="grid gap-2">
              {options.map((a) => (
                <label
                  key={a}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition-colors",
                    action === a ? "border-brand-500 bg-brand-50" : "border-line hover:bg-sunken",
                  )}
                >
                  <input type="radio" name="action" value={a} checked={action === a} onChange={() => setAction(a)} className="mt-0.5 accent-brand-600" />
                  <span>
                    <span className="block font-semibold">{ACTIONS[a].label}</span>
                    <span className="block text-muted">{ACTIONS[a].effect}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Reason" error={error?.field === "reason" ? error.message : null} hint="Shown in the activity log; for a warning, also sent to the student.">
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input min-h-20" maxLength={500} />
          </Field>
          <FormError message={error && error.field !== "reason" ? error.message : null} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            <button type="submit" className={chosen.danger ? "btn-danger" : "btn-primary"} disabled={busy}>
              {busy ? "Working…" : `${chosen.label} ${userName.split(" ")[0]}`}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

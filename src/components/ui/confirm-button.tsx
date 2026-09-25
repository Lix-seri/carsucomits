"use client";
import { useState } from "react";
import { Dialog } from "./dialog";
import { FormError } from "./form";
import { cn } from "@/lib/utils";

/**
 * A button that asks for confirmation in the site's own dialog before running
 * `onConfirm`. If `onConfirm` returns an error message, it's shown in the dialog.
 */
export function ConfirmButton({
  children, className, title, message, confirmLabel, danger = false, onConfirm, disabled,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<string | null | void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const err = await onConfirm();
    setBusy(false);
    if (err) setError(err);
    else setOpen(false);
  }

  return (
    <>
      <button type="button" className={className} disabled={disabled} onClick={() => { setError(null); setOpen(true); }}>
        {children}
      </button>
      <Dialog open={open} onClose={() => !busy && setOpen(false)} title={title} description={message}>
        <div className="space-y-4">
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className={cn("btn-primary", danger && "bg-danger-600 hover:bg-danger-700 focus:ring-danger-600")}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

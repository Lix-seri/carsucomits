"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal built on the native <dialog>: showModal() gives focus trapping, Escape to
 * close and inert background for free. Closes on Escape, the X, or a click outside.
 */
export function Dialog({
  open, onClose, title, description, children,
}: { open: boolean; onClose: () => void; title: string; description?: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="w-11/12 max-w-md rounded-2xl bg-surface p-0 text-ink shadow-soft backdrop:bg-ink/40"
    >
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-bold">{title}</h2>
              {description && <div className="mt-1 text-sm text-muted">{description}</div>}
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

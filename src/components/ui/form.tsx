"use client";
import { Children, cloneElement, isValidElement, useEffect, useId, useState } from "react";

/**
 * A labelled form control with an inline error. Wires the label to the control and
 * the error to aria-describedby, so screen readers announce both, and focuses the
 * control when an error appears. Editing the control hides its error until the next submit.
 */
export function Field({
  label, error, hint, children,
}: { label: React.ReactNode; error?: string | null; hint?: React.ReactNode; children: React.ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const [edited, setEdited] = useState(false);
  if (edited) error = null;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const control = Children.only(children);
  // A new submit may bring the same message back, so show errors again on every submit.
  useEffect(() => {
    const form = document.getElementById(id)?.closest("form");
    const reset = () => setEdited(false);
    form?.addEventListener("submit", reset);
    return () => form?.removeEventListener("submit", reset);
  }, [id]);
  const onChange = (e: unknown) => {
    (control.props.onChange as ((e: unknown) => void) | undefined)?.(e);
    setEdited(true);
  };
  // Take the user to the problem: focusing also scrolls the field into view.
  useEffect(() => {
    if (error) document.getElementById(id)?.focus();
  }, [error, id]);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {isValidElement(control) && cloneElement(control, { id, onChange, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
}

/** A form-level message (e.g. "Invalid credentials"), announced when it appears. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">{message}</p>;
}

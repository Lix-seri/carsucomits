"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Field, FormError } from "@/components/ui/form";

const FIELDS = ["studentIdNumber", "ccis", "proof"];

/** Student ID number, a CCIS confirmation and one proof file, sent for staff review. */
export function VerifyForm() {
  const router = useRouter();
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const errorFor = (f: string) => (error?.field === f ? error.message : null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await api("/api/verification", { form: new FormData(e.currentTarget) });
    setBusy(false);
    if (!res.ok) return setError({ field: res.field, message: res.error });
    setError(null);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-4 rounded-xl border border-line bg-white p-5 sm:p-6">
      <Field label="Student ID number" error={errorFor("studentIdNumber")} hint="As printed on your student ID.">
        <input name="studentIdNumber" inputMode="numeric" autoComplete="off" className="input sm:w-64" />
      </Field>
      <Field label="Proof" error={errorFor("proof")} hint="A photo or scan of your student ID or current registration form. JPG, PNG, WebP or PDF, up to 2 MB. Only admins and USED officers can see it.">
        <input name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="block w-full text-sm" />
      </Field>
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input name="ccis" type="checkbox" className="mt-0.5 accent-brand-600" aria-invalid={errorFor("ccis") ? true : undefined} />
          <span>I&apos;m enrolled in a program of the College of Computing and Information Sciences (CCIS).</span>
        </label>
        {errorFor("ccis") && <p className="mt-1 text-xs font-medium text-danger-600">{errorFor("ccis")}</p>}
      </div>
      <FormError message={error && !FIELDS.includes(error.field ?? "") ? error.message : null} />
      <button type="submit" disabled={busy} className="btn-primary">{busy ? "Sending…" : "Send for review"}</button>
    </form>
  );
}

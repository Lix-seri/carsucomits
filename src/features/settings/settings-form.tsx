"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Field, FormError } from "@/components/ui/form";
import { SETTINGS, type Limits, type SettingKey } from "./limits";

const KEYS = Object.keys(SETTINGS) as SettingKey[];

/** Admin form for the marketplace limits; every change is audit-logged by the server. */
export function SettingsForm({ limits }: { limits: Limits }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<SettingKey, string>>(
    Object.fromEntries(KEYS.map((k) => [k, String(limits[k])])) as Record<SettingKey, string>,
  );
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    const res = await api("/api/admin/settings", { method: "PUT", json: values });
    setBusy(false);
    if (!res.ok) return setError({ field: res.field, message: res.error });
    setError(null);
    setSaved(true);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-5 rounded-xl border border-line bg-white p-5 sm:p-6">
      {KEYS.map((k) => (
        <Field key={k} label={SETTINGS[k].label} hint={`${SETTINGS[k].hint} Default ${SETTINGS[k].default}.`} error={error?.field === k ? error.message : null}>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={values[k]}
            onChange={(e) => { setSaved(false); setValues({ ...values, [k]: e.target.value }); }}
            className="input w-32"
          />
        </Field>
      ))}
      <FormError message={error && !KEYS.includes(error.field as SettingKey) ? error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save limits"}</button>
        {saved && <p role="status" className="text-sm text-muted">Saved. The change is in the activity log.</p>}
      </div>
    </form>
  );
}

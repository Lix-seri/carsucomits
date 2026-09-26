"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Field, FormError } from "@/components/ui/form";

type Word = { id: string; term: string; category: string };

const CATEGORY_LABEL: Record<string, string> = { GENERAL: "General", ACADEMIC_DISHONESTY: "Academic dishonesty" };

/** The flagged-word list: add a term with its category, or remove one. Every change is audit-logged. */
export function WordList({ words }: { words: Word[] }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await api("/api/admin/words", { json: { term, category } });
    setBusy(false);
    if (!res.ok) return setError({ field: res.field ?? "term", message: res.error });
    setError(null);
    setTerm("");
    router.refresh();
  }

  async function remove(id: string) {
    const res = await api(`/api/admin/words/${id}`, { method: "DELETE" });
    if (!res.ok) return setError({ message: res.error });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form noValidate onSubmit={add} className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-field-select-action sm:items-end">
        <Field label="Word or phrase" error={error?.field === "term" ? error.message : null} hint="Matching ignores case, spacing, symbols and look-alike numbers.">
          <input value={term} onChange={(e) => setTerm(e.target.value)} className="input" maxLength={60} />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            <option value="GENERAL">General</option>
            <option value="ACADEMIC_DISHONESTY">Academic dishonesty</option>
          </select>
        </Field>
        <button type="submit" disabled={busy} className="btn-primary sm:mb-5">{busy ? "Adding…" : "Add"}</button>
      </form>
      <FormError message={error && !error.field ? error.message : null} />
      {(["ACADEMIC_DISHONESTY", "GENERAL"] as const).map((cat) => (
        <section key={cat} aria-labelledby={`words-${cat}`}>
          <h3 id={`words-${cat}`} className="mb-2 text-sm font-semibold">{CATEGORY_LABEL[cat]}</h3>
          <ul className="flex flex-wrap gap-2">
            {words.filter((w) => w.category === cat).map((w) => (
              <li key={w.id} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface py-1 pl-2.5 pr-1 text-sm">
                {w.term}
                <button type="button" onClick={() => remove(w.id)} aria-label={`Remove ${w.term}`} className="rounded p-0.5 text-muted hover:bg-sunken hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

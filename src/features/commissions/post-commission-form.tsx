"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from "@/lib/labels";
import { api } from "@/lib/api";
import { Field, FormError } from "@/components/ui/form";

const FIELDS = ["title", "category", "requiredLevel", "subcategory", "deadline", "fareMin", "fareMax", "fareUnit", "description"];

export function PostCommissionForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const errorFor = (field: string) => (error?.field === field ? error.message : null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    // Sent as typed; the server's schema decides what's valid and names the field.
    const payload = {
      title: text("title"),
      description: text("description"),
      category: text("category") || undefined,
      subcategory: text("subcategory") || null,
      requiredLevel: text("requiredLevel"),
      fareMin: text("fareMin") || undefined,
      fareMax: text("fareMax") || null,
      fareUnit: text("fareUnit") || null,
      deadline: text("deadline") || null,
    };

    setSubmitting(true);
    const res = await api<{ commission: { id: string } }>("/api/commissions", { json: payload });
    if (!res.ok) {
      setSubmitting(false);
      return setError({ field: res.field, message: res.error });
    }
    const cover = form.get("coverImage");
    if (cover instanceof File && cover.size > 0) {
      const fd = new FormData();
      fd.append("file", cover);
      await api(`/api/commissions/${res.data.commission.id}/cover`, { form: fd }); // can be retried from the commission page
    }
    router.replace(`/commission/${res.data.commission.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Post a Commission</h1>
      <p className="mb-6 text-sm text-muted">Describe the task you need done and pick a fair fare.</p>

      <div className="mb-5 flex gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <strong>No graded academic work.</strong> Theses, capstones, research papers, essays, assignments and exams done for
          someone else are not allowed and will be removed. Tutoring and feedback on your own work are fine.{" "}
          <Link href="/terms#academic-work" className="font-semibold underline">Read the rule</Link>.
        </p>
      </div>

      <form noValidate onSubmit={submit} className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card">
        <Field label="Title" error={errorFor("title")}>
          <input name="title" className="input" placeholder="e.g. Logo design for student org" maxLength={120} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category" error={errorFor("category")}>
            <select name="category" className="input" defaultValue="">
              <option value="" disabled>Select category</option>
              {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Required skill level" error={errorFor("requiredLevel")}>
            <select name="requiredLevel" className="input" defaultValue="INTERMEDIATE">
              {LEVEL_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </Field>
          <Field label={<>Subcategory <span className="font-normal text-muted">(optional)</span></>} error={errorFor("subcategory")}>
            <input name="subcategory" className="input" placeholder="e.g. Graphic Design, Web" maxLength={60} />
          </Field>
          <Field label={<>Deadline <span className="font-normal text-muted">(optional)</span></>} error={errorFor("deadline")}>
            <input type="date" name="deadline" className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Fare (min) ₱" error={errorFor("fareMin")}>
            <input type="number" inputMode="numeric" name="fareMin" className="input" placeholder="500" />
          </Field>
          <Field label={<>Fare (max) <span className="font-normal text-muted">(optional)</span></>} error={errorFor("fareMax")}>
            <input type="number" inputMode="numeric" name="fareMax" className="input" placeholder="1500" />
          </Field>
          <Field label="Unit" error={errorFor("fareUnit")}>
            <select name="fareUnit" className="input" defaultValue="">
              <option value="">Fixed</option>
              <option value="/hr">/hr</option>
              <option value="/day">/day</option>
              <option value="/errand">/errand</option>
            </select>
          </Field>
        </div>

        <Field label="Description" error={errorFor("description")} hint="At least 20 characters: what you need, the deliverables, and any references.">
          <textarea name="description" className="input min-h-36" maxLength={5000} />
        </Field>

        <Field label={<>Cover image <span className="font-normal text-muted">(optional)</span></>} hint="JPG/PNG/WebP up to 5 MB. Shows on browse cards and the detail page.">
          <input name="coverImage" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
        </Field>

        <FormError message={error && !FIELDS.includes(error.field ?? "") ? error.message : null} />

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium hover:bg-sunken">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Posting…" : "Post Commission"}
          </button>
        </div>
      </form>
    </div>
  );
}

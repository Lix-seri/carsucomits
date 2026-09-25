"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATS = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "GENERAL_ERRANDS", label: "General Errands" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
];
const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
];

export function PostCommissionForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const f = e.currentTarget;
    const get = (name: string) =>
      (f.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? "";

    const payload = {
      title: get("title"),
      description: get("description"),
      category: get("category"),
      subcategory: get("subcategory") || null,
      requiredLevel: get("requiredLevel"),
      fareMin: Number(get("fareMin")),
      fareMax: get("fareMax") ? Number(get("fareMax")) : null,
      fareUnit: get("fareUnit") || null,
      deadline: get("deadline") || null,
    };

    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to post commission."); return; }

      // If the commissioner picked a cover image, upload it now.
      const coverInput = f.elements.namedItem("coverImage") as HTMLInputElement | null;
      const coverFile = coverInput?.files?.[0];
      if (coverFile && data.commission?.id) {
        const fd = new FormData();
        fd.append("file", coverFile);
        await fetch(`/api/commissions/${data.commission.id}/cover`, { method: "POST", body: fd });
      }

      router.replace(`/commission/${data.commission?.id ?? ""}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Post a Commission</h1>
      <p className="mb-6 text-sm text-slate-500">Describe the task you need done and pick a fair fare.</p>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div>
          <label className="label">Title</label>
          <input name="title" className="input" placeholder="e.g. Logo design for student org" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select name="category" className="input" required defaultValue="">
              <option value="" disabled>Select category</option>
              {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Required skill level</label>
            <select name="requiredLevel" className="input" required defaultValue="INTERMEDIATE">
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subcategory <span className="text-slate-400">(optional)</span></label>
            <input name="subcategory" className="input" placeholder="e.g. Graphic Design, Mathematics" />
          </div>
          <div>
            <label className="label">Deadline <span className="text-slate-400">(optional)</span></label>
            <input type="date" name="deadline" className="input" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Fare (min) ₱</label>
            <input type="number" name="fareMin" className="input" min={0} required placeholder="500" />
          </div>
          <div>
            <label className="label">Fare (max) <span className="text-slate-400">(optional)</span></label>
            <input type="number" name="fareMax" className="input" min={0} placeholder="1500" />
          </div>
          <div>
            <label className="label">Unit</label>
            <select name="fareUnit" className="input" defaultValue="">
              <option value="">Fixed</option>
              <option value="/hr">/hr</option>
              <option value="/day">/day</option>
              <option value="/errand">/errand</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea name="description" className="input min-h-[140px]" placeholder="Describe what you need, deliverables, and any references…" required />
        </div>

        <div>
          <label className="label">Cover image <span className="text-slate-400">(optional)</span></label>
          <input
            name="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">JPG/PNG/WebP up to 5 MB. Shows on browse cards and the detail page.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Posting…" : "Post Commission"}
          </button>
        </div>
      </form>
    </div>
  );
}

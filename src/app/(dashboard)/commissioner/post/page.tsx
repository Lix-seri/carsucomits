"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATS = ["Academic", "Technical", "General Errands", "Administrative"];

export default function PostCommissionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Post a Commission</h1>
      <p className="mb-6 text-sm text-slate-500">Describe the task you need done and pick a fair fare.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          setTimeout(() => router.push("/commissioner"), 600);
        }}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Logo design for student org" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" required>
              <option value="">Select category</option>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Required skill level</label>
            <select className="input" required>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>
          <div>
            <label className="label">Payment</label>
            <input className="input" placeholder="e.g. ₱2,500 or ₱500/hr" required />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[140px]" placeholder="Describe what you need, deliverables, and any references…" required />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Posting…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

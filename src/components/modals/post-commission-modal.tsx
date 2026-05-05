"use client";
import { useState } from "react";
import { ModalShell } from "./modal-shell";

const CATS = ["Academic", "Technical", "General Errands", "Administrative"];

export function PostCommissionModal({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <ModalShell title="Post a Commission" onClose={onClose} headerClass="bg-white !text-ink border-b border-slate-200">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          setTimeout(() => { setSubmitting(false); onClose(); }, 500);
        }}
      >
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="Enter commission title" required />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" required>
            <option value="">Select category</option>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Payment</label>
          <input className="input" placeholder="e.g., ₱5,000 or ₱500/hr" required />
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px]" placeholder="Describe the commission details…" required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Posting…" : "Submit"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

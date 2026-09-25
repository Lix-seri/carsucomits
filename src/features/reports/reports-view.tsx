/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, FileText, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/ui/form";
import { REPORT_REASONS } from "@/lib/labels";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
};
type FiledReport = Report & { reportee: { fullName: string } };

const STATUS_PILL: Record<string, string> = {
  PENDING:              "bg-amber-100 text-amber-700",
  UNDER_INVESTIGATION:  "bg-blue-100 text-blue-700",
  RESOLVED:             "bg-emerald-100 text-emerald-700",
  ESCALATED:            "bg-red-100 text-red-700",
};

export function ReportsView() {
  const [showNew, setShowNew] = useState(false);
  const [filed, setFiled] = useState<FiledReport[]>([]);
  const [aboutMe, setAboutMe] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/mine")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setFiled(data.filed);
          setAboutMe(data.aboutMe);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const [form, setForm] = useState({ reporteeEmail: "", reason: "", details: "" });
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorFor = (name: string) => (fieldError?.field === name ? fieldError.message : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await api("/api/reports", { json: form });
    setSubmitting(false);
    if (!res.ok) return setFieldError({ field: res.field, message: res.error });
    setFieldError(null);
    setForm({ reporteeEmail: "", reason: "", details: "" });
    setShowNew(false);
    const mine = await api<{ filed: FiledReport[]; aboutMe: Report[] }>("/api/reports/mine");
    if (mine.ok) { setFiled(mine.data.filed); setAboutMe(mine.data.aboutMe); }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white">
          <h2 className="flex items-center gap-2 text-lg font-bold"><AlertTriangle className="h-5 w-5" /> Reports Center</h2>
          <p className="text-sm text-white/85">Manage your reports and flags</p>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">🚩 Reports About You</h3>
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : aboutMe.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
                ✓ No reports filed against you. Keep it up!
              </p>
            ) : (
              <ul className="space-y-2">
                {aboutMe.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-red-50/60 p-3">
                    <div>
                      <p className="text-sm font-semibold">A user reported you</p>
                      <p className="text-xs text-slate-600">Reason: {r.reason}</p>
                      {r.details && <p className="text-xs italic text-slate-500">&quot;{r.details}&quot;</p>}
                      <p className="text-[11px] text-slate-500">Filed {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`pill ${STATUS_PILL[r.status]} h-fit`}>{r.status.replaceAll("_", " ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><FileText className="h-4 w-4" /> Reports You Filed</h3>
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : filed.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                You haven&apos;t filed any reports yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {filed.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-blue-50/60 p-3">
                    <div>
                      <p className="text-sm font-semibold">You reported {r.reportee.fullName}</p>
                      <p className="text-xs text-slate-600">Reason: {r.reason}</p>
                      {r.details && <p className="text-xs italic text-slate-500">&quot;{r.details}&quot;</p>}
                      <p className="text-[11px] text-slate-500">Filed {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`pill ${STATUS_PILL[r.status]} h-fit`}>{r.status.replaceAll("_", " ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div>
            <button onClick={() => setShowNew(true)} className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
              <Plus className="mr-1 inline h-4 w-4" /> Submit New Report
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showNew} onClose={() => !submitting && setShowNew(false)} title="Submit a report" description="Admins review every report. The person you report won't see your name.">
        <form noValidate onSubmit={submit} className="space-y-3">
          <Field label="Reported user's email" error={errorFor("reporteeEmail")}>
            <input type="email" className="input" placeholder="theiremail@carsu.edu.ph" value={form.reporteeEmail} onChange={(e) => setForm({ ...form, reporteeEmail: e.target.value })} />
          </Field>
          <Field label="Reason" error={errorFor("reason")}>
            <select className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
              <option value="" disabled>Choose a reason</option>
              {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="What happened?" error={errorFor("details")} hint="At least 10 characters.">
            <textarea className="input min-h-24" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} maxLength={2000} />
          </Field>
          <FormError message={fieldError && !["reporteeEmail", "reason", "details"].includes(fieldError.field ?? "") ? fieldError.message : null} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowNew(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">{submitting ? "Submitting…" : "Submit"}</button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

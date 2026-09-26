"use client";
import { useEffect, useState } from "react";
import { FileText, Flag, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { REPORT_REASONS } from "@/lib/labels";
import { ReportStatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FormError } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

type Report = { id: string; reason: string; details: string | null; status: string; createdAt: string };
type FiledReport = Report & { reportee: { fullName: string } };

const date = (iso: string) => new Date(iso).toLocaleDateString("en-PH", { dateStyle: "medium" });

function ReportItems({ reports, headline }: { reports: Report[]; headline: (r: Report) => string }) {
  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
      {reports.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{headline(r)}</p>
            <p className="mt-0.5">
              {r.reason}
              {r.details && <span className="text-muted"> — {r.details}</span>}
            </p>
            <p className="text-xs text-muted">Filed {date(r.createdAt)}</p>
          </div>
          <ReportStatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}

export function ReportsView() {
  const [showNew, setShowNew] = useState(false);
  const [filed, setFiled] = useState<FiledReport[]>([]);
  const [aboutMe, setAboutMe] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const mine = await api<{ filed: FiledReport[]; aboutMe: Report[] }>("/api/reports/mine");
    if (mine.ok) { setFiled(mine.data.filed); setAboutMe(mine.data.aboutMe); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

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
    await load();
  }

  const loadingList = <div className="space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Reports"
        description="Report ghosting, scams or anything that breaks the rules. Admins review every report."
        actions={<button onClick={() => { setFieldError(null); setShowNew(true); }} className="btn-secondary"><Flag className="h-4 w-4" /> Report someone</button>}
      />

      <section aria-labelledby="about-you">
        <h2 id="about-you" className="mb-3 text-lg font-semibold">About you</h2>
        {loading ? loadingList : aboutMe.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No one has reported you" />
        ) : (
          <ReportItems reports={aboutMe} headline={() => "A student reported you"} />
        )}
      </section>

      <section aria-labelledby="you-filed">
        <h2 id="you-filed" className="mb-3 text-lg font-semibold">You filed</h2>
        {loading ? loadingList : filed.length === 0 ? (
          <EmptyState icon={FileText} title="You haven't filed any reports">Reports you file show up here with their status.</EmptyState>
        ) : (
          <ReportItems reports={filed} headline={(r) => `You reported ${(r as FiledReport).reportee.fullName}`} />
        )}
      </section>

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
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-danger">{submitting ? "Submitting…" : "Submit"}</button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

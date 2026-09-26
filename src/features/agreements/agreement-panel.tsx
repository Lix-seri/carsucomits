"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Circle, FileSignature } from "lucide-react";
import { api } from "@/lib/api";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormError } from "@/components/ui/form";
import { AGREEMENT_CLAUSES, AGREEMENT_VERSION, type AgreementTerms } from "./agreement";

type Party = { id: string; name: string; role: string; acceptedAt: string | null };

const date = (iso: string) => new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

/**
 * The agreement between the poster and the hired student. While it's pending, each party
 * reads the terms and accepts or declines; afterwards it stays as a record of what was agreed.
 */
export function AgreementPanel({ commissionId, pending, meId, terms, parties }: {
  commissionId: string;
  pending: boolean;
  meId: string;
  terms: AgreementTerms;
  parties: Party[];
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const me = parties.find((p) => p.id === meId);
  const waitingOnMe = pending && me && !me.acceptedAt;

  async function accept(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return setError("Tick the box to confirm you've read the agreement.");
    setBusy(true);
    const res = await api(`/api/commissions/${commissionId}/agreement`, { method: "POST" });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  async function decline() {
    const res = await api(`/api/commissions/${commissionId}/agreement`, { method: "DELETE", json: {} });
    if (!res.ok) return res.error;
    router.refresh();
  }

  return (
    <section aria-labelledby="agreement" className="rounded-xl border border-line bg-canvas p-5">
      <h2 id="agreement" className="flex items-center gap-2 font-semibold">
        <FileSignature className="h-4 w-4 text-muted" /> Agreement
      </h2>
      <p className="mt-1 text-sm text-muted">
        {pending ? "Work starts when both of you accept." : "Both of you accepted these terms before work started."}
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-label-bar">
        <dt className="text-muted">Scope</dt>
        <dd className="whitespace-pre-line">{terms.scope}</dd>
        <dt className="text-muted">Fare</dt>
        <dd className="tabular font-semibold">{terms.fare}</dd>
        <dt className="text-muted">Deadline</dt>
        <dd>{terms.deadline ? new Date(terms.deadline).toLocaleDateString("en-PH", { dateStyle: "medium" }) : "None set"}</dd>
      </dl>

      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm">
        {AGREEMENT_CLAUSES.map((c) => <li key={c}>{c}</li>)}
      </ol>

      <ul className="mt-4 space-y-1.5 text-sm" aria-label="Who has accepted">
        {parties.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            {p.acceptedAt ? <CheckCircle2 className="h-4 w-4 text-brand-600" /> : <Circle className="h-4 w-4 text-faint" />}
            <span className="font-medium">{p.id === meId ? "You" : p.name}</span>
            <span className="text-muted">({p.role})</span>
            <span className="text-muted">{p.acceptedAt ? `accepted ${date(p.acceptedAt)}` : "hasn't accepted yet"}</span>
          </li>
        ))}
      </ul>

      {waitingOnMe && (
        <form noValidate onSubmit={accept} className="mt-5 space-y-3 border-t border-line pt-4">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setError(null); }} className="mt-0.5 accent-brand-600" />
            <span>I&apos;ve read the agreement and accept it.</span>
          </label>
          <FormError message={error} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? "Accepting…" : "Accept agreement"}</button>
            <ConfirmButton
              className="btn-ghost"
              title="Decline the agreement?"
              message="The hire is cancelled and the commission opens for applications again."
              confirmLabel="Decline"
              danger
              onConfirm={decline}
            >
              Decline
            </ConfirmButton>
          </div>
        </form>
      )}
      <p className="mt-4 text-xs text-muted">Agreement version {AGREEMENT_VERSION}</p>
    </section>
  );
}

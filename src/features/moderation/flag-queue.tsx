"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type Flag = {
  id: string;
  kind: string;
  refId: string;
  text: string;
  terms: string[];
  category: string;
  createdAt: string;
  author: { id: string; fullName: string };
};

const KIND: Record<string, string> = { COMMISSION: "Commission", MESSAGE: "Message", APPLICATION: "Cover letter", SKILL: "Skill" };
const REMOVE_EFFECT: Record<string, string> = {
  COMMISSION: "Remove (cancel the commission)",
  MESSAGE: "Remove (never deliver)",
  APPLICATION: "Remove the cover letter",
  SKILL: "Remove the skill",
};

/** Flagged-word matches waiting for a decision. Nothing is removed until an admin says so. */
export function FlagQueue({ flags }: { flags: Flag[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);

  async function decide(id: string, decision: "APPROVE" | "REMOVE") {
    setBusy(id);
    const res = await api(`/api/admin/flags/${id}/decision`, { json: { decision } });
    setBusy(null);
    if (!res.ok) return setError({ id, message: res.error });
    setError(null);
    router.refresh();
  }

  if (flags.length === 0) return <EmptyState icon={ShieldCheck} title="Nothing to review">Posts, messages, cover letters and skills that match the word list appear here.</EmptyState>;

  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-white">
      {flags.map((f) => (
        <li key={f.id} className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={f.category === "ACADEMIC_DISHONESTY" ? "danger" : "warning"}>
              {f.category === "ACADEMIC_DISHONESTY" ? "Academic dishonesty" : "General"}
            </Badge>
            <span className="font-semibold">{KIND[f.kind] ?? f.kind}</span>
            <span className="text-muted">by</span>
            <Link href={`/u/${f.author.id}`} className="font-semibold hover:underline">{f.author.fullName}</Link>
            <span className="text-muted">· {new Date(f.createdAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}</span>
          </div>
          <p className="max-h-40 overflow-y-auto whitespace-pre-line break-words rounded-lg bg-sunken p-3 text-sm">{f.text}</p>
          <p className="text-xs text-muted">Matched: {f.terms.map((t) => `“${t}”`).join(", ")}</p>
          {error?.id === f.id && <p role="alert" className="text-xs text-danger-600">{error.message}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => decide(f.id, "APPROVE")} disabled={busy !== null} className="btn-secondary btn-sm">{busy === f.id ? "Saving…" : "Approve"}</button>
            <button onClick={() => decide(f.id, "REMOVE")} disabled={busy !== null} className="btn-danger btn-sm">{REMOVE_EFFECT[f.kind] ?? "Remove"}</button>
            {f.kind === "COMMISSION" && <Link href={`/commission/${f.refId}`} className="btn-ghost btn-sm">Open commission</Link>}
          </div>
        </li>
      ))}
    </ul>
  );
}

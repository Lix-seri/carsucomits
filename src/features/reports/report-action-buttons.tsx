"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

type Action = "RESOLVE" | "ESCALATE" | "REOPEN";

const STATUS_PILL: Record<string, string> = {
  PENDING:              "bg-warning-100 text-warning-700",
  UNDER_INVESTIGATION:  "bg-info-100 text-info-700",
  RESOLVED:             "bg-brand-100 text-brand-700",
  ESCALATED:            "bg-danger-100 text-danger-700",
};

export function ReportActionButtons({
  reportId, status,
}: { reportId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action) {
    setBusy(action);
    setError(null);
    const res = await api<{ status: string }>(`/api/admin/reports/${reportId}/action`, { json: { action } });
    setBusy(null);
    if (!res.ok) return setError(res.error);
    setCurrent(res.data.status);
    router.refresh();
  }
  const errorNote = error && <p role="alert" className="mt-1 text-xs text-danger-600">{error}</p>;

  if (current === "RESOLVED" || current === "ESCALATED") {
    return (
      <div>
      <div className="flex items-center gap-2">
        <span className={`pill ${STATUS_PILL[current]}`}>{current.replaceAll("_", " ")}</span>
        <button
          onClick={() => run("REOPEN")}
          disabled={busy === "REOPEN"}
          className="rounded-md border border-line-strong px-3 py-1 text-xs font-semibold text-ink hover:bg-sunken disabled:opacity-50"
        >
          Reopen
        </button>
      </div>
      {errorNote}
      </div>
    );
  }

  return (
    <div>
    <div className="flex gap-2">
      <button
        onClick={() => run("RESOLVE")}
        disabled={busy !== null}
        className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy === "RESOLVE" ? "…" : "Resolve"}
      </button>
      <button
        onClick={() => run("ESCALATE")}
        disabled={busy !== null}
        className="rounded-md bg-danger-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-danger-600 disabled:opacity-50"
      >
        {busy === "ESCALATE" ? "…" : "Escalate"}
      </button>
    </div>
    {errorNote}
    </div>
  );
}

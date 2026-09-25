"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Action = "RESOLVE" | "ESCALATE" | "REOPEN";

const STATUS_PILL: Record<string, string> = {
  PENDING:              "bg-amber-100 text-amber-700",
  UNDER_INVESTIGATION:  "bg-blue-100 text-blue-700",
  RESOLVED:             "bg-emerald-100 text-emerald-700",
  ESCALATED:            "bg-red-100 text-red-700",
};

export function ReportActionButtons({
  reportId, status,
}: { reportId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [current, setCurrent] = useState(status);

  async function run(action: Action) {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Action failed."); return; }
      setCurrent(data.status);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (current === "RESOLVED" || current === "ESCALATED") {
    return (
      <div className="flex items-center gap-2">
        <span className={`pill ${STATUS_PILL[current]}`}>{current.replaceAll("_", " ")}</span>
        <button
          onClick={() => run("REOPEN")}
          disabled={busy === "REOPEN"}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Reopen
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => run("RESOLVE")}
        disabled={busy !== null}
        className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        {busy === "RESOLVE" ? "…" : "Resolve"}
      </button>
      <button
        onClick={() => run("ESCALATE")}
        disabled={busy !== null}
        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
      >
        {busy === "ESCALATE" ? "…" : "Escalate"}
      </button>
    </div>
  );
}

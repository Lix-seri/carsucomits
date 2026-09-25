"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { ReportStatusBadge } from "@/components/ui/badge";

type Action = "RESOLVE" | "ESCALATE" | "REOPEN";

/** Resolve or escalate an open report; reopen a closed one. */
export function ReportActionButtons({ reportId, status }: { reportId: string; status: string }) {
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

  const closed = current === "RESOLVED" || current === "ESCALATED";
  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        {closed ? (
          <>
            <ReportStatusBadge status={current} />
            <button onClick={() => run("REOPEN")} disabled={busy !== null} className="btn-ghost btn-sm">Reopen</button>
          </>
        ) : (
          <>
            <button onClick={() => run("RESOLVE")} disabled={busy !== null} className="btn-secondary btn-sm">
              {busy === "RESOLVE" ? "Resolving…" : "Resolve"}
            </button>
            <button onClick={() => run("ESCALATE")} disabled={busy !== null} className="btn-ghost btn-sm text-danger-700">
              {busy === "ESCALATE" ? "Escalating…" : "Escalate"}
            </button>
          </>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-danger-600">{error}</p>}
    </div>
  );
}

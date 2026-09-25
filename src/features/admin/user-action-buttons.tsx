/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Action = "WARN" | "SUSPEND" | "BAN" | "REINSTATE";

const STATUS_PILL: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  WARNED:    "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-orange-100 text-orange-700",
  BANNED:    "bg-red-100 text-red-700",
};

export function UserActionButtons({
  userId, status,
}: { userId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [current, setCurrent] = useState(status);

  async function run(action: Action, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
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

  if (current !== "ACTIVE") {
    return (
      <div className="flex items-center gap-2">
        <span className={`pill ${STATUS_PILL[current] ?? "bg-slate-100 text-slate-700"}`}>{current}</span>
        <button
          onClick={() => run("REINSTATE")}
          disabled={busy === "REINSTATE"}
          className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {busy === "REINSTATE" ? "…" : "Reinstate"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => run("WARN")}
        disabled={busy !== null}
        className="rounded-md bg-amber-400 px-3 py-1 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-50"
      >
        {busy === "WARN" ? "…" : "Warn"}
      </button>
      <button
        onClick={() => run("SUSPEND", "Suspend this user? They will not be able to log in.")}
        disabled={busy !== null}
        className="rounded-md bg-orange-500 px-3 py-1 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {busy === "SUSPEND" ? "…" : "Suspend"}
      </button>
      <button
        onClick={() => run("BAN", "Ban this user permanently? This cannot be auto-reverted.")}
        disabled={busy !== null}
        className="rounded-md bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
      >
        {busy === "BAN" ? "…" : "Ban"}
      </button>
    </div>
  );
}

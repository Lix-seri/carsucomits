/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { ConfirmButton } from "@/components/ui/confirm-button";

type Action = "WARN" | "SUSPEND" | "BAN" | "REINSTATE";

const STATUS_PILL: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  WARNED: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-orange-100 text-orange-700",
  BANNED: "bg-red-100 text-red-700",
};

export function UserActionButtons({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action): Promise<string | null> {
    setBusy(action);
    setError(null);
    const res = await api<{ status: string }>(`/api/admin/users/${userId}/action`, { json: { action } });
    setBusy(null);
    if (!res.ok) return res.error;
    setCurrent(res.data.status);
    router.refresh();
    return null;
  }
  const runInline = async (action: Action) => setError(await run(action));

  return (
    <div>
      {current !== "ACTIVE" ? (
        <div className="flex items-center gap-2">
          <span className={`pill ${STATUS_PILL[current] ?? "bg-slate-100 text-slate-700"}`}>{current}</span>
          <button
            onClick={() => runInline("REINSTATE")}
            disabled={busy !== null}
            className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {busy === "REINSTATE" ? "…" : "Reinstate"}
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button
            onClick={() => runInline("WARN")}
            disabled={busy !== null}
            className="rounded-md bg-amber-400 px-3 py-1 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {busy === "WARN" ? "…" : "Warn"}
          </button>
          <ConfirmButton
            title="Suspend this user?"
            message="They'll be signed out and won't be able to sign in until an admin reinstates them."
            confirmLabel="Suspend"
            danger
            onConfirm={() => run("SUSPEND")}
            disabled={busy !== null}
            className="rounded-md bg-orange-500 px-3 py-1 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            Suspend
          </ConfirmButton>
          <ConfirmButton
            title="Ban this user?"
            message="They'll be signed out and blocked. Only an admin can reinstate the account."
            confirmLabel="Ban"
            danger
            onConfirm={() => run("BAN")}
            disabled={busy !== null}
            className="rounded-md bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
          >
            Ban
          </ConfirmButton>
        </div>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { ConfirmButton } from "@/components/ui/confirm-button";

type Action = "WARN" | "SUSPEND" | "BAN" | "REINSTATE";

const STATUS_PILL: Record<string, string> = {
  ACTIVE: "bg-brand-100 text-brand-700",
  WARNED: "bg-warning-100 text-warning-700",
  SUSPENDED: "bg-warning-100 text-warning-700",
  BANNED: "bg-danger-100 text-danger-700",
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
          <span className={`pill ${STATUS_PILL[current] ?? "bg-sunken text-ink"}`}>{current}</span>
          <button
            onClick={() => runInline("REINSTATE")}
            disabled={busy !== null}
            className="rounded-md bg-brand-500 px-3 py-1 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {busy === "REINSTATE" ? "…" : "Reinstate"}
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button
            onClick={() => runInline("WARN")}
            disabled={busy !== null}
            className="rounded-md bg-warning-400 px-3 py-1 text-xs font-bold text-white hover:bg-warning-500 disabled:opacity-50"
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
            className="rounded-md bg-warning-500 px-3 py-1 text-xs font-bold text-white hover:bg-warning-600 disabled:opacity-50"
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
            className="rounded-md bg-danger-500 px-3 py-1 text-xs font-bold text-white hover:bg-danger-600 disabled:opacity-50"
          >
            Ban
          </ConfirmButton>
        </div>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

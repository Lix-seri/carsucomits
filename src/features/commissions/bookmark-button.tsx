/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Bookmark } from "lucide-react";

export function BookmarkButton({
  commissionId,
  initialSaved,
  size = "md",
}: {
  commissionId: string;
  initialSaved: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    setError(null);
    const res = await api(`/api/saved/${commissionId}`, { method: "POST" });
    setBusy(false);
    if (res.ok) return router.refresh();
    setSaved(!next); // rollback
    if (res.status === 401) router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
    else setError(res.error);
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span className="relative inline-flex">
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove bookmark" : "Save commission"}
      title={saved ? "Saved — click to remove" : "Save for later"}
      className={`rounded-lg border ${saved ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-200 bg-white text-slate-500"} p-2 transition hover:bg-slate-50 disabled:opacity-50`}
    >
      <Bookmark className={`${iconSize} ${saved ? "fill-brand-500" : ""}`} />
    </button>
    {error && <span role="alert" className="absolute right-0 top-full mt-1 w-48 rounded-md bg-white p-2 text-xs text-red-600 shadow-card">{error}</span>}
    </span>
  );
}

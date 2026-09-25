"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const res = await fetch(`/api/saved/${commissionId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSaved(!next); // rollback
        if (res.status === 401) alert("Please log in to save commissions.");
        else alert(data.error ?? "Failed to save.");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove bookmark" : "Save commission"}
      title={saved ? "Saved — click to remove" : "Save for later"}
      className={`rounded-lg border ${saved ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-200 bg-white text-slate-500"} p-2 transition hover:bg-slate-50 disabled:opacity-50`}
    >
      <Bookmark className={`${iconSize} ${saved ? "fill-brand-500" : ""}`} />
    </button>
  );
}

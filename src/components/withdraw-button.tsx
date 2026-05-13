"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function withdraw() {
    if (!window.confirm("Withdraw your application? You can re-apply later if the commission is still open.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/withdraw`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to withdraw."); return; }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={withdraw}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      <X className="h-4 w-4" /> {busy ? "Withdrawing…" : "Withdraw application"}
    </button>
  );
}

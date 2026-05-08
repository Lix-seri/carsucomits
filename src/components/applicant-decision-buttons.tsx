"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApplicantDecisionButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);

  async function run(kind: "accept" | "decline", confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(kind);
    try {
      const res = await fetch(`/api/applications/${applicationId}/${kind}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Action failed."); return; }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => run("accept", "Accept this applicant? Other pending applicants will be auto-rejected and the commission moves to In Progress.")}
        disabled={busy !== null}
        className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy === "accept" ? "…" : "Accept"}
      </button>
      <button
        onClick={() => run("decline")}
        disabled={busy !== null}
        className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {busy === "decline" ? "…" : "Decline"}
      </button>
    </div>
  );
}

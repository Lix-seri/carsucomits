"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { RatingModal } from "@/components/rating-modal";

export function MarkCompleteButton({
  commissionId, commissionTitle, awardedToId,
}: { commissionId: string; commissionTitle: string; awardedToId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showRating, setShowRating] = useState(false);

  async function complete() {
    if (!window.confirm(`Mark "${commissionTitle}" as completed? You'll be asked to leave a rating.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/commissions/${commissionId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to mark complete."); return; }
      router.refresh();
      if (data.promptRating) setShowRating(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={complete} disabled={busy} className="btn-primary w-full">
        <CheckCircle2 className="h-4 w-4" /> {busy ? "Marking…" : "Mark Complete & Review"}
      </button>
      {showRating && (
        <RatingModal
          commissionId={commissionId}
          commissionTitle={commissionTitle}
          rateeId={awardedToId}
          onClose={() => setShowRating(false)}
        />
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { RatingModal } from "@/features/ratings/rating-modal";

export function MarkCompleteButton({
  commissionId, commissionTitle, awardedToName,
}: { commissionId: string; commissionTitle: string; awardedToName: string }) {
  const [showRating, setShowRating] = useState(false);

  return (
    <>
      <button onClick={() => setShowRating(true)} className="btn-primary w-full">
        <CheckCircle2 className="h-4 w-4" /> Mark Complete &amp; Review
      </button>
      {showRating && (
        <RatingModal
          commissionId={commissionId}
          commissionTitle={commissionTitle}
          rateeName={awardedToName}
          onClose={() => setShowRating(false)}
        />
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { RatingDialog } from "./rating-dialog";

export function MarkCompleteButton({ commissionId, commissionTitle, awardedToName }: { commissionId: string; commissionTitle: string; awardedToName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        <CheckCircle2 className="h-4 w-4" /> Mark Complete &amp; Review
      </button>
      <RatingDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rate & mark complete"
        subtitle={commissionTitle}
        note="A rating is required. The commission is marked completed when you submit; cancelling keeps it open."
        rateeName={awardedToName}
        endpoint={`/api/commissions/${commissionId}/complete`}
        submitLabel="Submit rating & complete"
      />
    </>
  );
}

"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { RatingDialog } from "./rating-dialog";

export function RateCommissionerButton({ commissionId, commissionTitle, commissionerName }: { commissionId: string; commissionTitle: string; commissionerName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-bold text-white hover:bg-warning-600">
        <Star className="mr-1 inline h-3.5 w-3.5 fill-white" /> Rate the commissioner
      </button>
      <RatingDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rate the commissioner"
        subtitle={commissionTitle}
        note={`Your rating helps other students know what to expect when working with ${commissionerName}.`}
        rateeName={commissionerName}
        endpoint="/api/ratings/commissioner"
        extraBody={{ commissionId }}
        submitLabel="Submit rating"
      />
    </>
  );
}

/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { RatingDialog } from "./rating-dialog";

export function RateNowButton({ commissionId, commissionTitle, rateeName }: { commissionId: string; commissionTitle: string; rateeName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600">
        <Star className="mr-1 inline h-3.5 w-3.5 fill-white" /> Rate Now
      </button>
      <RatingDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rate this commission"
        subtitle={commissionTitle}
        note={`You completed this commission without rating ${rateeName}. Ratings keep the marketplace trustworthy.`}
        rateeName={rateeName}
        endpoint={`/api/commissions/${commissionId}/rate-now`}
        submitLabel="Submit rating"
      />
    </>
  );
}

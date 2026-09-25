/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, X, AlertCircle } from "lucide-react";

const STAR_LABEL: Record<number, string> = {
  1: "Terrible — major problems",
  2: "Poor — fell short of expectations",
  3: "Okay — got the job done with issues",
  4: "Good — satisfied with the work",
  5: "Excellent — would hire again",
};

export function RatingModal({
  commissionId,
  commissionTitle,
  rateeName,
  onClose,
  onSubmitted,
}: {
  commissionId: string;
  commissionTitle: string;
  rateeName: string;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (stars <= 3 && comment.trim().length < 10) {
      setError("Please leave at least 10 characters of feedback for ratings of 3 or below.");
      return;
    }
    setBusy(true);
    try {
      // This single endpoint does BOTH: marks the commission completed AND creates the rating.
      const res = await fetch(`/api/commissions/${commissionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, comment: comment.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit rating."); return; }
      router.refresh();
      onSubmitted?.();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-bold">Rate &amp; Mark Complete</h3>
            <p className="text-sm text-white/85">&ldquo;{commissionTitle}&rdquo;</p>
          </div>
          <button onClick={onClose} disabled={busy} className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
            Rating is required. The commission will only be marked completed once you submit.
          </div>

          <div>
            <p className="label">How did <strong>{rateeName}</strong> do?</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setStars(n)}
                  className="rounded-md p-1 hover:bg-amber-50"
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                >
                  <Star
                    className={`h-8 w-8 transition ${
                      n <= (hover || stars) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-slate-700">{stars}/5</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{STAR_LABEL[hover || stars]}</p>
          </div>

          <div>
            <label className="label">
              Feedback {stars <= 3 && <span className="text-red-500">* required for low ratings</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                stars <= 3
                  ? "What went wrong? This helps other commissioners and supports admin review."
                  : "Optional — let other commissioners know how it went."
              }
              className="input min-h-[100px]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? "Submitting…" : "Submit Rating & Complete"}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400">
            Cancelling keeps the commission in progress. You can rate later from My Hub.
          </p>
        </form>
      </div>
    </div>
  );
}

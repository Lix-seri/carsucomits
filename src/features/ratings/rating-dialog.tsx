/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/ui/form";

const STAR_LABEL: Record<number, string> = {
  1: "Terrible — major problems",
  2: "Poor — fell short of expectations",
  3: "Okay — got the job done with issues",
  4: "Good — satisfied with the work",
  5: "Excellent — would work with again",
};

/** The one rating form: completion, retroactive ratings and rating the commissioner all use it. */
export function RatingDialog({
  open, onClose, title, subtitle, note, rateeName, endpoint, extraBody, submitLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  note: string;
  rateeName: string;
  endpoint: string;
  extraBody?: Record<string, unknown>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await api(endpoint, { json: { ...extraBody, stars, comment: comment.trim() || null } });
    setBusy(false);
    if (!res.ok) return setError({ field: res.field, message: res.error });
    setError(null);
    router.refresh();
    onClose();
  }

  const shown = hover || stars;
  return (
    <Dialog open={open} onClose={() => !busy && onClose()} title={title} description={<>&ldquo;{subtitle}&rdquo;</>}>
      <form noValidate onSubmit={submit} className="space-y-4">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{note}</p>
        <div>
          <p id="rating-label" className="label">How was it working with {rateeName}?</p>
          <div role="radiogroup" aria-labelledby="rating-label" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === stars}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                onMouseEnter={() => setHover(n)}
                onClick={() => setStars(n)}
                className="rounded-md p-1 hover:bg-amber-50"
              >
                <Star className={`h-8 w-8 transition ${n <= shown ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold">{stars}/5</span>
          </div>
          <p className="mt-1 text-xs text-muted">{STAR_LABEL[shown]}</p>
        </div>
        <Field
          label={<>Feedback {stars <= 3 ? <span className="text-danger-600">(required for 3 stars or fewer)</span> : <span className="font-normal text-muted">(optional)</span>}</>}
          error={error?.field === "comment" ? error.message : null}
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={stars <= 3 ? "What went wrong? At least 10 characters." : "How did it go?"}
            className="input min-h-24"
            maxLength={1000}
          />
        </Field>
        <FormError message={error && error.field !== "comment" ? error.message : null} />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? "Submitting…" : submitLabel}</button>
        </div>
      </form>
    </Dialog>
  );
}

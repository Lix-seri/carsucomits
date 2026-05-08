"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, X } from "lucide-react";

export function RatingModal({
  commissionId, commissionTitle, rateeId, onClose,
}: {
  commissionId: string;
  commissionTitle: string;
  rateeId: string;
  onClose: () => void;
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
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId, rateeId, stars, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit rating."); return; }
      router.refresh();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-bold">Rate this commission</h3>
            <p className="text-sm text-white/85">&ldquo;{commissionTitle}&rdquo;</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/20 p-1.5 hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <p className="label">How did the student do?</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setStars(n)}
                  className="rounded-md p-1 hover:bg-amber-50"
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
          </div>

          <div>
            <label className="label">Feedback {stars <= 3 && <span className="text-red-500">*</span>}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={stars <= 3 ? "What went wrong? Required for low ratings." : "Optional — let other commissioners know how it went."}
              className="input min-h-[100px]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50">Skip</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? "Submitting…" : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

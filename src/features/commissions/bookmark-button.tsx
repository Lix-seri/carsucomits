"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

/** Save a commission for later: a heart that pops when it's filled. */
export function BookmarkButton({ commissionId, initialSaved }: { commissionId: string; initialSaved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(0);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    if (next) setPopped((n) => n + 1);
    const res = await api(`/api/saved/${commissionId}`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      toast(next ? "Saved for later" : "Removed from Saved", { tone: "info" });
      return router.refresh();
    }
    setSaved(!next); // rollback
    if (res.status === 401) router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
    else toast(res.error, { tone: "error" });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from Saved" : "Save for later"}
      className={cn(
        "btn border-2 px-3",
        saved ? "border-coral-300 bg-coral-50 text-coral-700" : "border-line-strong bg-surface text-muted hover:border-coral-300 hover:text-coral-600",
      )}
    >
      <Heart key={popped} aria-hidden className={cn("h-5 w-5", saved && "pop fill-coral-500 text-coral-500")} />
      <span className="text-sm">{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

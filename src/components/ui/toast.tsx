"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tisa } from "@/components/illustrations/tisa";

type Tone = "success" | "info" | "error";
type Toast = { id: number; message: string; detail?: string; tone: Tone; celebrate: boolean };

const EVENT = "carsu:toast";

/** Show a toast from any client component. `celebrate` adds Tisa and a burst of chalk dust. */
export function toast(message: string, opts: { detail?: string; tone?: Tone; celebrate?: boolean } = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, detail: opts.detail, tone: opts.tone ?? "success", celebrate: !!opts.celebrate } }));
}
export const celebrate = (message: string, detail?: string) => toast(message, { detail, celebrate: true });

const ICON = { success: CheckCircle2, info: Info, error: AlertCircle };
const DUST = ["bg-gold-400", "bg-coral-400", "bg-brand-400", "bg-academic-500", "bg-errand-500", "bg-board-chalk"];

function Burst() {
  // Fixed offsets (not random) so every burst reads the same and nothing depends on timing.
  const bits = [[-70, -60], [-40, -85], [0, -95], [40, -85], [70, -60], [85, -20], [-85, -20], [-55, 30], [55, 30], [0, 40], [-25, -70], [25, -70]];
  return (
    <span aria-hidden className="pointer-events-none absolute left-10 top-8">
      {bits.map(([dx, dy], i) => (
        <span
          key={i}
          className={cn("absolute h-2 w-2 rounded-sm", DUST[i % DUST.length])}
          style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, animation: "dust 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards" } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

/** Mounted once in the root layout. Toasts sit above the phone bottom nav. */
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    let next = 1;
    const onToast = (e: Event) => {
      const t = { id: next++, ...(e as CustomEvent<Omit<Toast, "id">>).detail };
      setItems((all) => [...all.slice(-2), t]);
      setTimeout(() => setItems((all) => all.filter((x) => x.id !== t.id)), t.celebrate ? 6000 : 4500);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6">
      {items.map((t) => {
        const Icon = ICON[t.tone];
        return (
          <div
            key={t.id}
            className={cn(
              "pop pointer-events-auto relative flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-lift",
              t.celebrate ? "board border-board-deep" : "border-line bg-surface",
            )}
          >
            {t.celebrate ? (
              <>
                <Burst />
                <Tisa pose="cheer" className="-my-2 h-16 w-16" />
              </>
            ) : (
              <Icon aria-hidden className={cn("h-5 w-5 shrink-0", t.tone === "error" ? "text-danger-600" : t.tone === "info" ? "text-info-600" : "text-brand-600")} />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className={cn("font-semibold", t.celebrate && "font-display text-base")}>{t.message}</p>
              {t.detail && <p className={t.celebrate ? "text-board-dust" : "text-muted"}>{t.detail}</p>}
            </div>
            <button
              type="button"
              onClick={() => setItems((all) => all.filter((x) => x.id !== t.id))}
              aria-label="Dismiss"
              className={cn("rounded-lg p-1", t.celebrate ? "text-board-dust hover:text-board-chalk" : "text-muted hover:bg-sunken hover:text-ink")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

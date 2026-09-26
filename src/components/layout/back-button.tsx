"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Pages visited in this tab since the last full load. Client-side navigations don't update
// document.referrer, so the history inside the app is counted here instead.
let pagesSinceLoad = 0;

/** Mounted once in the root layout: counts each page shown. */
export function NavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    pagesSinceLoad += 1;
  }, [pathname]);
  return null;
}

/**
 * Goes back to the previous page when it was on this site (Hub, Saved, a profile…), otherwise
 * to `fallback`, so a deep link opened from chat never "goes back" off the site.
 */
export function BackButton({ fallback, label }: { fallback: string; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const cameFromHere = pagesSinceLoad > 1 || document.referrer.startsWith(window.location.origin);
        if (cameFromHere && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}

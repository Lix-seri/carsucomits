"use client";
import { useEffect } from "react";

/**
 * Marks <html data-hydrated> once React is interactive. The browser tests wait for it after
 * every page load, because a click that lands before hydration is silently lost.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}

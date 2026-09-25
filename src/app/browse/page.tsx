import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BrowseContent } from "@/features/commissions/browse-content";

export default function BrowsePage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-12 text-muted">Loading commissions…</div>}>
        <BrowseContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}

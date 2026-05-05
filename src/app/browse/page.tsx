import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrowseContent } from "@/components/browse-content";

export default function BrowsePage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-12 text-slate-500">Loading commissions…</div>}>
        <BrowseContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}

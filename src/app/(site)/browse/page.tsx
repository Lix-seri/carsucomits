import { Suspense } from "react";
import { BrowseContent } from "@/features/commissions/browse-content";

export const metadata = { title: "Browse commissions" };

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}

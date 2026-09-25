import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingContent } from "@/components/landing-content";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <LandingContent />
      <SiteFooter />
    </>
  );
}

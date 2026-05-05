import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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

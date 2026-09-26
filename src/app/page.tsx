import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingContent } from "@/features/landing/landing-content";
import { getBoardStats, listCommissions } from "@/features/commissions/server";

// Live board and counts: render per request, never at build time (the build must not need a database).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ commissions }, { openByCategory, ...stats }] = await Promise.all([listCommissions({ status: "OPEN" }, 3), getBoardStats()]);
  return (
    <>
      <SiteHeader />
      <main id="main">
        <LandingContent slips={commissions} stats={stats} openByCategory={openByCategory} />
      </main>
      <SiteFooter />
    </>
  );
}

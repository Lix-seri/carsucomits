import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EmptyState } from "@/components/ui/empty-state";
import { LandingContent } from "@/features/landing/landing-content";
import { CommissionCard } from "@/features/commissions/commission-card";
import { listCommissions } from "@/features/commissions/server";

export default async function HomePage() {
  const { commissions } = await listCommissions({ status: "OPEN" }, 6);
  return (
    <>
      <SiteHeader />
      <main id="main">
        <LandingContent
          latest={
            commissions.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {commissions.map((c) => (
                  <CommissionCard key={c.id} c={c} />
                ))}
              </div>
            ) : (
              <EmptyState icon={ClipboardList} title="No open commissions yet" action={<Link href="/commissioner/post" className="btn-primary">Post the first one</Link>} />
            )
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}

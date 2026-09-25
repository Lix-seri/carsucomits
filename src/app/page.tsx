import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingContent } from "@/features/landing/landing-content";
import { CommissionCard } from "@/features/commissions/commission-card";
import { listCommissions } from "@/features/commissions/server";

export default async function HomePage() {
  const { commissions } = await listCommissions({ status: "OPEN" }, 8);
  return (
    <>
      <SiteHeader />
      <LandingContent
        latest={
          commissions.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {commissions.map((c) => (
                <CommissionCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-brand-200 bg-white py-12 text-center text-muted">
              No open commissions yet. <Link href="/commissioner/post" className="font-semibold text-brand-600 hover:underline">Post the first one</Link>.
            </p>
          )
        }
      />
      <SiteFooter />
    </>
  );
}

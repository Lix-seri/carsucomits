import { PageHeader } from "@/components/ui/page-header";
import { pageSession } from "@/lib/session";
import { listSellers, listVerifications } from "./server";
import { SellersTable } from "./sellers-table";
import { VerificationQueue } from "./verification-queue";

// Shared by /admin/* and /used/* (decision 0012): same data, each inside its own staff shell.

export async function VerificationsPage() {
  const { requests } = await listVerifications(await pageSession({ staff: true }));
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Verifications" description="CCIS students asking to offer their services. Check the ID number against the proof." />
      <VerificationQueue requests={requests.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))} />
    </div>
  );
}

export async function SellersPage({ q }: { q?: string }) {
  const search = (q ?? "").trim();
  const { sellers } = await listSellers(await pageSession({ staff: true }), search);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Sellers" description="Verified CCIS students who offer commissions, with their work so far. Earnings use each commission's minimum fare." />
      <form className="mb-4 w-full sm:w-72">
        <input name="q" defaultValue={search} placeholder="Name or email" aria-label="Search sellers" className="input" />
      </form>
      <SellersTable sellers={sellers.map((s) => ({ ...s, verifiedAt: s.verifiedAt?.toISOString() ?? null }))} />
    </div>
  );
}

import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getMyListings } from "@/features/commissions/server";
import { ListingsTable } from "@/features/commissions/listings-table";

export const metadata = { title: "Your commissions" };

export default async function ListingsPage() {
  const session = await pageSession();
  const listings = await getMyListings(session.userId);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Your commissions"
        description="Everything you have posted, newest first."
        actions={<Link href="/hiring/post" className="btn-primary"><Plus className="h-4 w-4" /> Post a commission</Link>}
      />
      {listings.length === 0 ? (
        <EmptyState icon={Megaphone} title="You haven't posted anything" action={<Link href="/hiring/post" className="btn-secondary">Post a commission</Link>} />
      ) : (
        <div className="rounded-xl border border-line bg-white px-4 sm:px-5">
          <ListingsTable listings={listings} />
        </div>
      )}
    </div>
  );
}

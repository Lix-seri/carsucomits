import Link from "next/link";
import { Plus } from "lucide-react";
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
        <EmptyState pose="hold" title="Nothing posted yet" action={<Link href="/hiring/post" className="btn-primary">Post a commission</Link>}>
          Your commissions show up here with their applicants and progress.
        </EmptyState>
      ) : (
        <div className="rounded-xl border border-line bg-surface px-4 sm:px-5">
          <ListingsTable listings={listings} />
        </div>
      )}
    </div>
  );
}

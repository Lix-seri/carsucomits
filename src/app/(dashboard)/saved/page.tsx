import Link from "next/link";
import { Bookmark } from "lucide-react";
import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getSavedCommissions } from "@/features/commissions/server";
import { CommissionCard } from "@/features/commissions/commission-card";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const session = await pageSession();
  const saved = await getSavedCommissions(session.userId);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Saved" description="Commissions you bookmarked. Unsave from the commission page." />
      {saved.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet" action={<Link href="/browse" className="btn-primary">Browse commissions</Link>}>
          Use the bookmark on any commission to keep it here for later.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {saved.map((s) => <CommissionCard key={s.id} c={s.commission} />)}
        </div>
      )}
    </div>
  );
}

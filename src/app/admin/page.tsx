import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { pageSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { BarChart } from "@/components/ui/bar-chart";
import { getAdminDashboard } from "@/features/admin/server";
import { FlaggedUsersTable } from "@/features/admin/flagged-users-table";
import { ReportList } from "@/features/reports/report-list";

export const metadata = { title: "Admin overview" };

type Series = { day: string; count: number }[];
const week = (s: Series) => s.slice(7).reduce((n, d) => n + d.count, 0);
const prevWeek = (s: Series) => s.slice(0, 7).reduce((n, d) => n + d.count, 0);

function Trend({ series }: { series: Series }) {
  const now = week(series);
  const before = prevWeek(series);
  if (now === 0 && before === 0) return <span className="text-xs text-muted">Nothing new in 2 weeks</span>;
  const up = now >= before;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", up ? "text-brand-700" : "text-coral-700")}>
      <Icon aria-hidden className="h-3.5 w-3.5" /> {now} this week <span className="font-normal text-muted">(vs {before})</span>
    </span>
  );
}

export default async function AdminDashboard() {
  const d = await getAdminDashboard(await pageSession({ admin: true }));
  const cards = [
    { label: "Accounts", value: d.totalUsers, href: "/admin/users", trend: <Trend series={d.signups} /> },
    { label: "Live commissions", value: d.activeListings, href: "/admin/commissions", trend: <Trend series={d.commissionsPosted} /> },
    { label: "Waiting for review", value: d.pendingFlags + d.pendingVerifications, href: d.pendingFlags ? "/admin/moderation" : "/admin/verifications", note: `${d.pendingFlags} flagged · ${d.pendingVerifications} verifications`, alert: d.pendingFlags + d.pendingVerifications > 0 },
    { label: "Pending reports", value: d.pendingReports, href: "/admin/reports", alert: d.pendingReports > 0 },
    { label: "Warned, suspended or banned", value: d.flaggedAccounts, href: "/admin/users?status=WARNED" },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title="Overview" description="What needs attention across CarSUComits today." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={cn("lift rounded-2xl border-2 bg-surface p-4", c.alert ? "border-gold-300" : "border-line")}>
            <p className="text-sm font-semibold text-muted">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold tabular">{c.value}</p>
            <p className="mt-1">{c.trend ?? <span className="text-xs text-muted">{c.note ?? (c.alert ? "Needs a look" : "All clear")}</span>}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "Sign-ups, last 14 days", data: d.signups, bar: "fill-brand-500" },
          { title: "Commissions posted, last 14 days", data: d.commissionsPosted, bar: "fill-gold-500" },
        ].map((c) => (
          <section key={c.title} className="rounded-2xl border-2 border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-lg font-bold">{c.title}</h2>
            <BarChart data={c.data} label={c.title} barClass={c.bar} />
          </section>
        ))}
      </div>
      <FlaggedUsersTable users={d.flaggedUsers} avgMap={d.avgMap} emptyText="No one has an open report" />
      <ReportList title="Pending reports" reports={d.latestReports} emptyText="No reports waiting" />
    </div>
  );
}

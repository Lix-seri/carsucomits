import { pageSession } from "@/lib/session";
import { ReportsView } from "@/features/reports/reports-view";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  await pageSession();
  return <ReportsView />;
}

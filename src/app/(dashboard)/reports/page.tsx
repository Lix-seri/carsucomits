import { pageSession } from "@/lib/session";
import { ReportsView } from "@/features/reports/reports-view";

export default async function ReportsPage() {
  await pageSession();
  return <ReportsView />;
}

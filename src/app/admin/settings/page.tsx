import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { getLimits } from "@/features/settings/server";
import { SettingsForm } from "@/features/settings/settings-form";

export const metadata = { title: "Settings" };

export default async function AdminSettings() {
  await pageSession({ admin: true });
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Limits that keep work spread fairly. Students see a clear message when they reach one." />
      <SettingsForm limits={await getLimits()} />
    </div>
  );
}

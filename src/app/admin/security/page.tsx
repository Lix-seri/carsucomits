import { ShieldAlert, ShieldCheck } from "lucide-react";
import { pageSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { getMfaStatus } from "@/features/admin/server";
import { MfaSetup } from "@/features/auth/mfa-setup";

export const metadata = { title: "Security" };

export default async function AdminSecurityPage() {
  const user = await getMfaStatus(await pageSession({ admin: true }));
  const on = !!user?.mfaEnabled;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Security" description="Protect your admin account with a second step at sign-in." />
      <section aria-labelledby="mfa" className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="mfa" className="text-lg font-semibold">Two-factor sign-in</h2>
          {on ? (
            <Badge tone="brand" icon={<ShieldCheck className="h-3.5 w-3.5" />}>On</Badge>
          ) : (
            <Badge tone="warning" icon={<ShieldAlert className="h-3.5 w-3.5" />}>Off</Badge>
          )}
        </div>
        <p className="mb-5 max-w-prose text-sm text-muted">
          {on
            ? "You'll be asked for a 6-digit code from your authenticator app each time you sign in."
            : "Use an authenticator app such as Google Authenticator, Authy or 1Password to add a 6-digit code to every sign-in."}
        </p>
        <MfaSetup initiallyEnabled={on} email={user?.email ?? ""} />
      </section>
    </div>
  );
}

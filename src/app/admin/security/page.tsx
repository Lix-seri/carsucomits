import { ShieldCheck, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { MfaSetup } from "@/features/auth/mfa-setup";

export default async function AdminSecurityPage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: { mfaEnabled: true, email: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-slate-500">Manage two-factor authentication on your admin account.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-start gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-lg ${user?.mfaEnabled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
            {user?.mfaEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold">Two-Factor Authentication (TOTP)</h2>
            <p className="text-sm text-slate-600">
              {user?.mfaEnabled
                ? "MFA is active. You'll be asked for a 6-digit code each time you log in."
                : "Add a second layer of security by using an authenticator app like Google Authenticator, Authy, or 1Password."}
            </p>
          </div>
        </div>

        <MfaSetup initiallyEnabled={!!user?.mfaEnabled} email={user?.email ?? ""} />
      </section>
    </div>
  );
}

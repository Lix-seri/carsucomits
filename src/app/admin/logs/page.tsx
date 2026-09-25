import { ScrollText } from "lucide-react";
import { pageSession } from "@/lib/session";
import { CAMPUS_TZ, timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listAuditLogs } from "@/features/admin/server";

export const metadata = { title: "Activity log" };

// What the actor did, as the middle of a sentence: "<actor> <verb> <target>".
const VERB: Record<string, string> = {
  LOGIN: "signed in",
  LOGIN_FAILED: "failed to sign in",
  LOGOUT: "signed out",
  REGISTER: "created an account",
  WARN: "warned",
  SUSPEND: "suspended",
  BAN: "banned",
  REINSTATE: "reinstated",
  APPROVE: "approved",
  REPORT_RESOLVE: "resolved a report on",
  REPORT_ESCALATE: "escalated a report on",
  REPORT_REOPEN: "reopened a report on",
  AUTO_FLAG_LOW_RATING: "was auto-flagged for low ratings",
  MFA_ENABLED: "turned on two-factor sign-in",
  MFA_DISABLED: "turned off two-factor sign-in",
};
const DANGER = new Set(["LOGIN_FAILED", "SUSPEND", "BAN", "REPORT_ESCALATE", "AUTO_FLAG_LOW_RATING", "MFA_DISABLED"]);

function parseMeta(raw: string | null): Record<string, unknown> {
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export default async function AdminLogs() {
  const { logs, targetMap } = await listAuditLogs(await pageSession({ admin: true }));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Activity log" description="Sign-ins, moderation and automatic flags, newest first. Showing the latest 200." />
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Nothing recorded yet">Sign-ins, moderation actions and auto-flags will appear here.</EmptyState>
      ) : (
        <ol className="divide-y divide-line rounded-xl border border-line bg-white">
          {logs.map((l) => {
            const meta = parseMeta(l.meta);
            const target = l.target ? targetMap.get(l.target) ?? null : null;
            const reason = typeof meta.reason === "string" ? meta.reason : null;
            return (
              <li key={l.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 text-sm">
                  <p>
                    <span className="font-semibold">{l.actor.fullName}</span>{" "}
                    <span className={DANGER.has(l.action) ? "text-danger-700" : "text-muted"}>{VERB[l.action] ?? l.action.toLowerCase().replaceAll("_", " ")}</span>
                    {target && <> <span className="font-semibold">{target}</span></>}
                  </p>
                  {reason && <p className="mt-0.5 text-muted">“{reason}”</p>}
                  {Object.keys(meta).length > 0 && (
                    <details className="mt-1 text-xs text-muted">
                      <summary className="cursor-pointer select-none">Details</summary>
                      <pre className="mt-1 whitespace-pre-wrap break-all rounded-lg bg-sunken p-2 font-mono">{JSON.stringify(meta, null, 2)}</pre>
                    </details>
                  )}
                </div>
                <time
                  dateTime={l.createdAt.toISOString()}
                  title={l.createdAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: CAMPUS_TZ })}
                  className="shrink-0 text-xs text-muted"
                >
                  {timeAgo(l.createdAt)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

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
  REPORT_RESOLVE: "resolved a report on",
  REPORT_ESCALATE: "escalated a report on",
  REPORT_REOPEN: "reopened a report on",
  AUTO_FLAG_LOW_RATING: "rated, and the system flagged",
  MFA_ENABLED: "turned on two-factor sign-in",
  MFA_DISABLED: "turned off two-factor sign-in",
  COMMISSION_CREATED: "posted",
  COMMISSION_STATUS: "changed the status of",
  APPLICATION_ACCEPTED: "hired",
  APPLICATION_DECLINED: "declined the application of",
  DELIVERABLE_APPROVED: "approved the delivery on",
  DELIVERABLE_REVISION: "asked for a revision on",
};
const DANGER = new Set(["LOGIN_FAILED", "SUSPEND", "BAN", "REPORT_ESCALATE", "AUTO_FLAG_LOW_RATING", "MFA_DISABLED"]);
const label = (action: string) => VERB[action] ?? action.toLowerCase().replaceAll("_", " ");

function parseMeta(raw: string | null): Record<string, unknown> {
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

/** One row per field that changed: before and after. */
function changes(before: unknown, after: unknown) {
  const b = (before ?? {}) as Record<string, unknown>;
  const a = (after ?? {}) as Record<string, unknown>;
  return Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).map((k) => ({ field: k, from: b[k], to: a[k] }));
}
const show = (v: unknown) => (v == null ? "—" : String(v));

export default async function AdminLogs({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const { action } = await searchParams;
  const { logs, targetMap, actions } = await listAuditLogs(await pageSession({ admin: true }), action || undefined);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Activity log"
        description="Append-only: entries can't be edited or deleted. Newest first, latest 200."
        actions={
          <form className="flex items-center gap-2">
            <label htmlFor="action" className="text-sm text-muted">Show</label>
            <select id="action" name="action" defaultValue={action ?? ""} className="input w-auto py-2">
              <option value="">Everything</option>
              {actions.map((a) => <option key={a} value={a}>{label(a)}</option>)}
            </select>
            <button className="btn-secondary btn-sm">Filter</button>
          </form>
        }
      />
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Nothing recorded yet">Sign-ins, moderation, status changes and approvals appear here.</EmptyState>
      ) : (
        <ol className="divide-y divide-line rounded-xl border border-line bg-white">
          {logs.map((l) => {
            const meta = parseMeta(l.meta);
            const target = l.target ? targetMap.get(l.target) ?? null : null;
            const reason = typeof meta.reason === "string" ? meta.reason : null;
            const diff = changes(l.before, l.after);
            return (
              <li key={l.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 text-sm">
                  <p>
                    <span className="font-semibold">{l.actor.fullName}</span>{" "}
                    <span className={DANGER.has(l.action) ? "text-danger-700" : "text-muted"}>{label(l.action)}</span>
                    {target && <> <span className="font-semibold">{target}</span></>}
                  </p>
                  {diff.length > 0 && (
                    <ul className="mt-1 space-y-0.5 break-words text-xs">
                      {diff.map((d) => (
                        <li key={d.field}>
                          <span className="text-muted">{d.field}:</span> <span className="line-through decoration-faint">{show(d.from)}</span> → <span className="font-semibold">{show(d.to)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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

import { pageSession } from "@/lib/session";
import { listAuditLogs } from "@/features/admin/server";

const ACTION_STYLE: Record<string, { bar: string; tag: string }> = {
  LOGIN:              { bar: "border-l-emerald-500", tag: "text-brand-600" },
  LOGIN_FAILED:       { bar: "border-l-amber-500",   tag: "text-warning-600" },
  LOGOUT:             { bar: "border-l-slate-500",   tag: "text-muted" },
  REGISTER:           { bar: "border-l-emerald-500", tag: "text-brand-600" },
  WARN:               { bar: "border-l-amber-500",   tag: "text-warning-600" },
  SUSPEND:            { bar: "border-l-orange-500",  tag: "text-warning-600" },
  BAN:                { bar: "border-l-red-500",     tag: "text-danger-600" },
  REINSTATE:          { bar: "border-l-emerald-500", tag: "text-brand-600" },
  REPORT_RESOLVE:     { bar: "border-l-blue-500",    tag: "text-info-600" },
  REPORT_ESCALATE:    { bar: "border-l-red-500",     tag: "text-danger-600" },
  REPORT_REOPEN:      { bar: "border-l-slate-500",   tag: "text-muted" },
  AUTO_FLAG_LOW_RATING: { bar: "border-l-red-500",   tag: "text-danger-600" },
  MFA_ENABLED:        { bar: "border-l-blue-500",    tag: "text-info-600" },
  MFA_DISABLED:       { bar: "border-l-orange-500",  tag: "text-warning-600" },
};

export default async function AdminLogs() {
  const { logs, targetMap } = await listAuditLogs(await pageSession({ admin: true }));

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">System Logs</h2>
          <p className="text-xs text-muted">Real audit entries from the AuditLog table. Showing the latest 200.</p>
        </div>
      </div>
      {logs.length === 0 ? (
        <p className="rounded-lg bg-sunken px-4 py-12 text-center text-sm text-muted">
          No audit log entries yet. Logins, moderation actions, and auto-flags will appear here.
        </p>
      ) : (
        <ul className="space-y-1.5 font-mono text-xs">
          {logs.map((l) => {
            const style = ACTION_STYLE[l.action] ?? { bar: "border-l-slate-500", tag: "text-muted" };
            const targetName = l.target ? targetMap.get(l.target) : null;
            let meta: Record<string, unknown> | null = null;
            try { if (l.meta) meta = JSON.parse(l.meta); } catch { /* ignore */ }
            return (
              <li key={l.id} className={`break-all rounded-r-lg border-l-4 bg-sunken px-3 py-2 ${style.bar}`}>
                <span className="text-muted">
                  {l.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </span>
                {" - "}
                <strong className={style.tag}>{l.action}</strong>
                {" - "}
                <span className="text-ink">
                  by <strong>{l.actor.fullName}</strong>
                  {targetName && <> on <strong>{targetName}</strong></>}
                  {!targetName && l.target && <> on <code>{l.target}</code></>}
                  {meta && Object.keys(meta).length > 0 && (
                    <span className="ml-2 text-muted">
                      {Object.entries(meta).slice(0, 3).map(([k, v]) => `${k}=${String(v).slice(0, 40)}`).join(", ")}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

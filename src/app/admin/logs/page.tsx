/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
import { pageSession } from "@/lib/session";
import { listAuditLogs } from "@/features/admin/server";

const ACTION_STYLE: Record<string, { bar: string; tag: string }> = {
  LOGIN:              { bar: "border-l-emerald-500", tag: "text-emerald-600" },
  LOGIN_FAILED:       { bar: "border-l-amber-500",   tag: "text-amber-600" },
  LOGOUT:             { bar: "border-l-slate-500",   tag: "text-slate-600" },
  REGISTER:           { bar: "border-l-emerald-500", tag: "text-emerald-600" },
  WARN:               { bar: "border-l-amber-500",   tag: "text-amber-600" },
  SUSPEND:            { bar: "border-l-orange-500",  tag: "text-orange-600" },
  BAN:                { bar: "border-l-red-500",     tag: "text-red-600" },
  REINSTATE:          { bar: "border-l-emerald-500", tag: "text-emerald-600" },
  REPORT_RESOLVE:     { bar: "border-l-blue-500",    tag: "text-blue-600" },
  REPORT_ESCALATE:    { bar: "border-l-red-500",     tag: "text-red-600" },
  REPORT_REOPEN:      { bar: "border-l-slate-500",   tag: "text-slate-600" },
  AUTO_FLAG_LOW_RATING: { bar: "border-l-red-500",   tag: "text-red-600" },
  MFA_ENABLED:        { bar: "border-l-blue-500",    tag: "text-blue-600" },
  MFA_DISABLED:       { bar: "border-l-orange-500",  tag: "text-orange-600" },
};

export default async function AdminLogs() {
  const { logs, targetMap } = await listAuditLogs(await pageSession({ admin: true }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">System Logs</h2>
          <p className="text-xs text-slate-500">Real audit entries from the AuditLog table. Showing the latest 200.</p>
        </div>
      </div>
      {logs.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
          No audit log entries yet. Logins, moderation actions, and auto-flags will appear here.
        </p>
      ) : (
        <ul className="space-y-1.5 font-mono text-xs">
          {logs.map((l) => {
            const style = ACTION_STYLE[l.action] ?? { bar: "border-l-slate-500", tag: "text-slate-600" };
            const targetName = l.target ? targetMap.get(l.target) : null;
            let meta: Record<string, unknown> | null = null;
            try { if (l.meta) meta = JSON.parse(l.meta); } catch { /* ignore */ }
            return (
              <li key={l.id} className={`break-all rounded-r-lg border-l-4 bg-slate-50 px-3 py-2 ${style.bar}`}>
                <span className="text-slate-500">
                  {l.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </span>
                {" - "}
                <strong className={style.tag}>{l.action}</strong>
                {" - "}
                <span className="text-slate-700">
                  by <strong>{l.actor.fullName}</strong>
                  {targetName && <> on <strong>{targetName}</strong></>}
                  {!targetName && l.target && <> on <code>{l.target}</code></>}
                  {meta && Object.keys(meta).length > 0 && (
                    <span className="ml-2 text-slate-500">
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

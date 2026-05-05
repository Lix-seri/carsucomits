type Level = "LOGIN" | "REPORT" | "ACTION" | "SUSPEND";

const COLORS: Record<Level, { bar: string; tag: string }> = {
  LOGIN:   { bar: "border-l-emerald-500", tag: "text-emerald-600" },
  REPORT:  { bar: "border-l-blue-500",    tag: "text-blue-600" },
  ACTION:  { bar: "border-l-amber-500",   tag: "text-amber-600" },
  SUSPEND: { bar: "border-l-red-500",     tag: "text-red-600" },
};

const LOGS: { ts: string; level: Level; msg: string }[] = [
  { ts: "2026-04-06 14:32:15", level: "LOGIN",   msg: 'User "Glen Francis Licayan" logged in successfully' },
  { ts: "2026-04-06 14:28:03", level: "REPORT",  msg: 'New report filed by "Denzel Cap-atan" against "Glen Francis Licayan"' },
  { ts: "2026-04-06 14:15:42", level: "ACTION",  msg: 'Admin "Admin USG" warned user "Kate Bernadette Orcejola"' },
  { ts: "2026-04-06 13:58:21", level: "SUSPEND", msg: 'User "CJ Godwin Casera" suspended for 24 hours' },
  { ts: "2026-04-06 13:45:10", level: "LOGIN",   msg: 'User "Admin USG" logged in successfully' },
];

export default function AdminLogs() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-4 text-lg font-bold">System Logs</h2>
      <ul className="space-y-2 font-mono text-xs">
        {LOGS.map((l, i) => {
          const c = COLORS[l.level];
          return (
            <li key={i} className={`rounded-r-lg border-l-4 bg-slate-50 px-3 py-2 ${c.bar}`}>
              <span className="text-slate-500">{l.ts}</span>{" - "}
              <strong className={c.tag}>{l.level}</strong>{" - "}
              <span className="text-slate-700">{l.msg}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

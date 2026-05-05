import Link from "next/link";

const APPLICANTS = [
  { name: "Denzel Cap-atan", initials: "DC", rating: 4.9, level: "Expert", color: "bg-blue-500" },
  { name: "Jefferson Sevillano", initials: "JS", rating: 4.7, level: "Intermediate", color: "bg-purple-500" },
  { name: "Kate Orcejola", initials: "KO", rating: 4.6, level: "Intermediate", color: "bg-emerald-500" },
];

export default function ApplicantsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500"><Link href="/dashboard" className="text-brand-600 hover:underline">← Student Dashboard</Link></p>
        <h1 className="text-2xl font-bold">All Applicants</h1>
        <p className="text-sm text-slate-500">Review your recent applicants.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 text-base font-bold">Need 50 Flyers Distributed (DC, JS, KO)</h2>
        <ul className="mt-3 space-y-2">
          {APPLICANTS.map((a, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white ${a.color}`}>{a.initials}</span>
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-slate-500">★ {a.rating} · {a.level}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600">Accept</button>
                <button className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

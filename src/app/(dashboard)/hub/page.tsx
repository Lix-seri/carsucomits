import Link from "next/link";
import { getSession } from "@/lib/session";

const DOING = [
  { title: "Mathematics Tutoring", with: "Maria Santos", fare: "₱800/hr", deadline: "Apr 15, 2026", progress: 65, status: "In Progress" },
];
const POSTED = [
  { title: "Need 50 Flyers Distributed", applicants: 3, fare: "₱300", deadline: "Apr 10, 2026", status: "Open" },
  { title: "Logo for student org", applicants: 7, fare: "₱2,000", deadline: "Apr 20, 2026", status: "Open" },
];

export default async function HubPage() {
  const session = await getSession();
  const fullName = session?.fullName ?? "Guest";
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">My Hub</h1>
        <p className="text-sm text-slate-500">Welcome back, {fullName}. Track your hiring and doing activities.</p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold">⚡ Tasks I&apos;m Doing</h2>
        <ul className="space-y-3">
          {DOING.map((t, i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">With {t.with}</p>
                  <h3 className="text-base font-bold">{t.title}</h3>
                </div>
                <span className="pill bg-amber-100 text-amber-700">{t.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div><p className="text-slate-500">Fare</p><p className="font-bold text-brand-600">{t.fare}</p></div>
                <div><p className="text-slate-500">Deadline</p><p className="font-semibold">{t.deadline}</p></div>
                <div><p className="text-slate-500">Progress</p><p className="font-bold">{t.progress}%</p></div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${t.progress}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold hover:bg-slate-50">Message Client</button>
                <button className="flex-1 btn-primary">Mark Complete &amp; Review</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">🪧 Tasks I Posted</h2>
        <ul className="space-y-3">
          {POSTED.map((t, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div>
                <h3 className="text-base font-bold">{t.title}</h3>
                <p className="text-xs text-slate-500">Deadline {t.deadline} · <strong>{t.applicants}</strong> applicants</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-brand-600">{t.fare}</p>
                <Link href="/commissioner/applicants" className="btn-primary !py-2">Review Applicants</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

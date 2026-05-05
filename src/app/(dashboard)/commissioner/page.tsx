import Link from "next/link";
import { ClipboardList, Users, CheckCircle2, Plus, Eye, Check } from "lucide-react";
import { getSession } from "@/lib/session";

const LISTINGS = [
  { title: "Mathematics Tutoring - Calculus I", category: "Academic", catColor: "bg-emerald-50 text-emerald-700", applicants: 5, status: "Open", statusColor: "bg-emerald-50 text-emerald-700" },
  { title: "Web Development - Portfolio Site", category: "Technical", catColor: "bg-blue-50 text-blue-700", applicants: 3, status: "In Progress", statusColor: "bg-amber-50 text-amber-700" },
  { title: "Grocery Shopping & Delivery", category: "General Errands", catColor: "bg-amber-50 text-amber-700", applicants: 4, status: "Open", statusColor: "bg-emerald-50 text-emerald-700" },
];

const APPLICANTS = [
  { name: "Denzel Cap-atan", initials: "DC", rating: 4.9, level: "Expert", color: "bg-blue-500" },
  { name: "Jefferson Sevillano", initials: "JS", rating: 4.7, level: "Intermediate", color: "bg-purple-500" },
  { name: "Kate Orcejola", initials: "KO", rating: 4.6, level: "Intermediate", color: "bg-emerald-500" },
];

function timeBasedGreeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function CommissionerHome() {
  const session = await getSession();
  const firstName = (session?.fullName ?? "Guest").split(" ")[0];
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500"><Link href="/dashboard" className="text-brand-600 hover:underline">← Student Dashboard</Link></p>
          <h1 className="text-2xl font-bold">{timeBasedGreeting()}, {firstName}!</h1>
          <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your commissions.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Active Listings" value={4} icon={ClipboardList} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Total Applicants" value={12} icon={Users} color="text-emerald-600 bg-emerald-50" />
        <Kpi label="Completed Tasks" value={7} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">My Active Listings</h2>
          <Link href="/commissioner/post" className="btn-primary !py-2"><Plus className="h-4 w-4" /> Post New</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2 font-semibold">Task Title</th>
                <th className="py-2 font-semibold">Category</th>
                <th className="py-2 font-semibold">Applicants</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LISTINGS.map((l, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium">{l.title}</td>
                  <td className="py-3"><span className={`pill ${l.catColor}`}>{l.category}</span></td>
                  <td className="py-3">{l.applicants}</td>
                  <td className="py-3"><span className={`pill ${l.statusColor}`}>{l.status}</span></td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"><Eye className="h-3.5 w-3.5" /> View</button>
                      <button className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"><Check className="h-3.5 w-3.5" /> Complete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Recent Applicants</h2>
        <ul className="space-y-2">
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
                <button className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

const LISTINGS = [
  { title: "CSU Website Redesign", payment: "₱50,000", status: "Open", statusColor: "bg-emerald-50 text-emerald-700", applicants: 5 },
  { title: "Mathematics Tutoring", payment: "₱800/hr", status: "In Progress", statusColor: "bg-amber-50 text-amber-700", applicants: 1 },
  { title: "Flyer Distribution", payment: "₱300", status: "Open", statusColor: "bg-emerald-50 text-emerald-700", applicants: 3 },
];

export default function AdminListings() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-4 text-lg font-bold">All Listings</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {LISTINGS.map((l, i) => (
          <article key={i} className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-1 text-base font-bold">{l.title}</h3>
            <p className="text-xs text-slate-500">Payment: <span className="font-semibold text-slate-700">{l.payment}</span></p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`pill ${l.statusColor}`}>{l.status}</span>
              <span className="text-xs text-slate-500">{l.applicants} applicant{l.applicants === 1 ? "" : "s"}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

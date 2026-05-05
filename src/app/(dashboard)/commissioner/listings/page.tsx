"use client";
import Link from "next/link";
import { Eye, Check, Plus } from "lucide-react";

const LISTINGS = [
  { title: "Mathematics Tutoring - Calculus I", category: "Academic", catColor: "bg-emerald-50 text-emerald-700", applicants: 5, status: "Open", statusColor: "bg-emerald-50 text-emerald-700" },
  { title: "Web Development - Portfolio Site", category: "Technical", catColor: "bg-blue-50 text-blue-700", applicants: 3, status: "In Progress", statusColor: "bg-amber-50 text-amber-700" },
  { title: "Grocery Shopping & Delivery", category: "General Errands", catColor: "bg-amber-50 text-amber-700", applicants: 4, status: "Open", statusColor: "bg-emerald-50 text-emerald-700" },
];

export default function ListingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-slate-500">Manage your commission listings</p>
        </div>
        <Link href="/commissioner/post" className="btn-primary"><Plus className="h-4 w-4" /> Post New</Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
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
    </div>
  );
}

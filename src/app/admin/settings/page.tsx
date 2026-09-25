/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useState } from "react";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-5 text-lg font-bold">Admin Settings</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="max-w-xl space-y-4"
      >
        <div>
          <label className="label">Admin Name</label>
          <input className="input" defaultValue="Admin USG" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" defaultValue="admin@csu.edu.ph" />
        </div>
        <div>
          <p className="label">Notifications</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-500" />
            Enable email notifications for new reports
          </label>
        </div>
        <button className="btn-primary">Save Changes</button>
        {saved && <p className="text-sm font-semibold text-emerald-600">✓ Settings saved</p>}
      </form>
    </div>
  );
}

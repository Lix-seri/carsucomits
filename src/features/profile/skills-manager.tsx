/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { LEVEL_LABEL, LEVEL_PILL } from "@/lib/labels";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
type Skill = { id: string; name: string; level: string };

export function SkillsManager({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<typeof LEVELS[number]>("INTERMEDIATE");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) { setError("Skill name must be at least 2 characters."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), level }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add skill."); return; }
      setSkills([...skills, data.skill]);
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSkills(skills.filter((s) => s.id !== id));
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {skills.length === 0 ? (
        <p className="mb-4 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No skills yet. Add your first one below — commissioners will see it on your profile.
        </p>
      ) : (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <span className={`pill ${LEVEL_PILL[s.level] ?? "bg-slate-100 text-slate-700"} mt-0.5`}>
                  {LEVEL_LABEL[s.level] ?? s.level}
                </span>
              </div>
              <button
                onClick={() => remove(s.id)}
                disabled={busy}
                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`Remove ${s.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={add} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold">Add a new skill</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Python, Logo Design, Spanish Tutoring"
            className="input"
            disabled={busy}
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof LEVELS[number])}
            className="input"
            disabled={busy}
          >
            {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
          <button type="submit" disabled={busy} className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}

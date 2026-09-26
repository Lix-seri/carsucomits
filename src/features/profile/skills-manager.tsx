"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { LEVEL_LABEL } from "@/lib/labels";
import { Tisa } from "@/components/illustrations/tisa";
import { SkillTag } from "./profile-parts";

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
        <div className="mb-4 flex items-center gap-4 rounded-2xl border-2 border-dashed border-line-strong p-4">
          <Tisa pose="hold" className="h-20 w-20" />
          <p className="text-sm text-muted">
            <span className="block font-display text-base font-bold text-ink">No skills yet</span>
            Add what you&apos;re good at. Posters see these on your profile and applications.
          </p>
        </div>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <li key={s.id}>
              <SkillTag name={s.name} level={s.level} index={i}>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  disabled={busy}
                  className="rounded-full p-0.5 opacity-70 hover:bg-surface hover:opacity-100 disabled:opacity-40"
                  aria-label={`Remove ${s.name}`}
                >
                  <X aria-hidden className="h-3.5 w-3.5" />
                </button>
              </SkillTag>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="rounded-2xl bg-sunken p-4">
        <p className="mb-3 text-sm font-semibold">Add a skill</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-field-select-action">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Python, Logo Design, Spanish Tutoring"
            aria-label="Skill name"
            className="input"
            disabled={busy}
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof LEVELS[number])}
            aria-label="Skill level"
            className="input"
            disabled={busy}
          >
            {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
          <button type="submit" disabled={busy} className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-danger-600">{error}</p>}
      </form>
    </div>
  );
}

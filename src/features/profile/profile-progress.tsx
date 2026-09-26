import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/progress-ring";

type Step = { done: boolean; label: string; href: string; action: string };

/**
 * "Profile 50% complete": the steps that make posters trust you, each linking to where you do it.
 * Built only from data the app has: photo, skills, CCIS verification, and a first commission.
 */
export function ProfileProgress({ hasPhoto, skillCount, verified, hasWork }: { hasPhoto: boolean; skillCount: number; verified: boolean; hasWork: boolean }) {
  const steps: Step[] = [
    { done: hasPhoto, label: "Add a profile photo", href: "/profile", action: "Add photo" },
    { done: skillCount > 0, label: skillCount > 0 ? `${skillCount} skill${skillCount === 1 ? "" : "s"} listed` : "List a skill you're good at", href: "/profile", action: "Add skill" },
    { done: verified, label: verified ? "CCIS verified" : "Get CCIS-verified to take on work", href: "/verify", action: "Verify" },
    { done: hasWork, label: hasWork ? "First commission on the board" : "Post or take on a first commission", href: "/hiring/post", action: "Post one" },
  ];
  const pct = (steps.filter((s) => s.done).length / steps.length) * 100;
  if (pct === 100) return null;
  return (
    <section aria-labelledby="profile-progress" className="rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-4">
        <ProgressRing value={pct} label="Profile complete" />
        <div>
          <h2 id="profile-progress" className="font-display text-lg font-bold">Your profile is {Math.round(pct)}% there</h2>
          <p className="text-sm text-muted">Posters hire people they can trust.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1">
        {steps.map((s) => (
          <li key={s.label}>
            {s.done ? (
              <p className="flex items-center gap-3 px-2 py-2 text-sm text-muted">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white"><Check aria-hidden className="h-3.5 w-3.5" /></span>
                <span className="line-through decoration-faint">{s.label}</span>
              </p>
            ) : (
              <Link href={s.href} className="group flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-sunken">
                <span className={cn("h-6 w-6 rounded-full border-2 border-dashed border-line-strong")} aria-hidden />
                <span className="flex-1 font-medium">{s.label}</span>
                <span className="inline-flex items-center text-xs font-semibold text-brand-700">
                  {s.action} <ChevronRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

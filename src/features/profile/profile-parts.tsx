import { Award, BadgeCheck, Hammer, Megaphone, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { LevelPips } from "@/components/ui/category";
import { ChalkStar } from "@/components/ui/chalk";

// Banner presets. The app stores no banner choice, so each person gets one derived from their id:
// stable, varied, and never a setting that pretends to be saved.
const BANNERS = [
  { className: "board", doodle: "text-gold-400" },
  { className: "bg-gold-300 paper-dots", doodle: "text-on-gold" },
  { className: "bg-academic-500", doodle: "text-board-chalk" },
  { className: "bg-coral-400", doodle: "text-board-chalk" },
  { className: "bg-admin-500", doodle: "text-board-chalk" },
];
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

export function ProfileBanner({ seed }: { seed: string }) {
  const b = BANNERS[hash(seed) % BANNERS.length];
  return (
    <div aria-hidden className={cn("relative h-28 overflow-hidden sm:h-36", b.className)}>
      <ChalkStar className={cn("absolute right-8 top-5 h-10 w-10 opacity-80", b.doodle)} draw={false} />
      <ChalkStar className={cn("absolute right-24 top-14 h-6 w-6 opacity-60", b.doodle)} draw={false} />
      <svg viewBox="0 0 200 40" className={cn("absolute bottom-3 left-1/3 h-8 w-48 opacity-50", b.doodle)}>
        <path d="M2 30c20-18 38-18 58 0s38 18 58 0 38-18 58 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const TAG = [
  "border-academic-200 bg-academic-50 text-academic-700",
  "border-technical-200 bg-technical-50 text-technical-700",
  "border-errand-200 bg-errand-50 text-errand-700",
  "border-admin-200 bg-admin-50 text-admin-700",
  "border-brand-200 bg-brand-50 text-brand-700",
];

/** A skill as a coloured tag with its level pips. */
export function SkillTag({ name, level, index, children }: { name: string; level: string; index: number; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border-2 py-1.5 pl-3.5 pr-2 text-sm font-semibold", TAG[index % TAG.length])}>
      {name}
      <LevelPips level={level} showLabel={false} className="text-current" />
      {children}
    </span>
  );
}

type Stats = { done: number; posted: number; reviewCount: number };

/** Achievements the data can prove. Nothing is shown that the app can't actually compute. */
export function achievementsFor({ stats, fiveStars, verified }: { stats: Stats; fiveStars: number; verified: boolean }) {
  return [
    { earned: stats.posted >= 1, icon: Megaphone, label: "First commission posted", tone: "bg-gold-100 text-gold-800 border-gold-300" },
    { earned: stats.done >= 1, icon: Hammer, label: "First job done", tone: "bg-brand-50 text-brand-700 border-brand-300" },
    { earned: stats.done >= 5, icon: Award, label: "Five jobs done", tone: "bg-technical-50 text-technical-700 border-technical-200" },
    { earned: fiveStars >= 5, icon: Star, label: "5 five-star reviews", tone: "bg-coral-50 text-coral-700 border-coral-200" },
    { earned: verified, icon: BadgeCheck, label: "CCIS verified", tone: "bg-academic-50 text-academic-700 border-academic-200" },
  ].filter((a) => a.earned);
}

export function Achievements({ items }: { items: ReturnType<typeof achievementsFor> }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Achievements">
      {items.map((a, i) => (
        <li key={a.label} className={cn("sticker gap-1.5 px-3 py-1.5 text-sm", a.tone, i % 2 ? "rotate-1.5" : "-rotate-1.5")}>
          <a.icon aria-hidden className="h-4 w-4" /> {a.label}
        </li>
      ))}
    </ul>
  );
}

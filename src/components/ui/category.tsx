import { BookOpen, ClipboardList, Laptop, ShoppingBag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/labels";

// Each category owns a chalk colour and an icon (world: Pisara). Class strings are written out
// in full so Tailwind keeps them.
export const CATEGORY_STYLE: Record<string, { icon: LucideIcon; tile: string; text: string; strip: string; chipOn: string; chipOff: string }> = {
  ACADEMIC: {
    icon: BookOpen,
    tile: "bg-academic-100 text-academic-700",
    text: "text-academic-700",
    strip: "bg-academic-500",
    chipOn: "border-academic-600 bg-academic-600 text-white",
    chipOff: "border-academic-200 text-academic-700 hover:bg-academic-50",
  },
  TECHNICAL: {
    icon: Laptop,
    tile: "bg-technical-100 text-technical-700",
    text: "text-technical-700",
    strip: "bg-technical-500",
    chipOn: "border-technical-600 bg-technical-600 text-white",
    chipOff: "border-technical-200 text-technical-700 hover:bg-technical-50",
  },
  GENERAL_ERRANDS: {
    icon: ShoppingBag,
    tile: "bg-errand-100 text-errand-700",
    text: "text-errand-700",
    strip: "bg-errand-500",
    chipOn: "border-errand-600 bg-errand-600 text-white",
    chipOff: "border-errand-200 text-errand-700 hover:bg-errand-50",
  },
  ADMINISTRATIVE: {
    icon: ClipboardList,
    tile: "bg-admin-100 text-admin-700",
    text: "text-admin-700",
    strip: "bg-admin-500",
    chipOn: "border-admin-600 bg-admin-600 text-white",
    chipOff: "border-admin-200 text-admin-700 hover:bg-admin-50",
  },
};
const FALLBACK = CATEGORY_STYLE.GENERAL_ERRANDS;
export const categoryStyle = (category: string) => CATEGORY_STYLE[category] ?? FALLBACK;

/** The category's icon on its coloured tile. */
export function CategoryIcon({ category, size = "md" }: { category: string; size?: "sm" | "md" | "lg" }) {
  const s = categoryStyle(category);
  const box = size === "sm" ? "h-7 w-7 rounded-lg" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-10 w-10 rounded-xl";
  const glyph = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center", box, s.tile)}>
      <s.icon className={glyph} strokeWidth={2.2} />
    </span>
  );
}

/** Category as a label: coloured icon and name. */
export function CategoryBadge({ category }: { category: string }) {
  const s = categoryStyle(category);
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold", s.text)}>
      <s.icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {CATEGORY_LABEL[category] ?? category}
    </span>
  );
}

/** Skill level as 1 to 4 chalk pips, with the name for screen readers and on wide cards. */
export function LevelPips({ level, showLabel = true, className }: { level: string; showLabel?: boolean; className?: string }) {
  const order = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
  const filled = order.indexOf(level) + 1;
  const label = LEVEL_LABEL[level] ?? level;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-muted", className)} title={`${label} level`}>
      <span aria-hidden className="flex gap-0.5">
        {order.map((_, i) => (
          <span key={i} className={cn("h-2.5 w-1.5 rounded-sm", i < filled ? "bg-brand-500" : "bg-line-strong")} />
        ))}
      </span>
      {showLabel ? label : <span className="sr-only">{label} level</span>}
    </span>
  );
}

/** Kept for existing call sites: the level as pips with its name. */
export function LevelBadge({ level }: { level: string }) {
  return <LevelPips level={level} />;
}

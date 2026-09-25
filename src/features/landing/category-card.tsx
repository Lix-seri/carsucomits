"use client";
import { BookOpen, Code2, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { book: BookOpen, code: Code2, cart: ShoppingCart };

export function CategoryCard({
  name, description, icon, selected, onSelect,
}: {
  name: string; description: string; icon: keyof typeof ICONS;
  selected?: boolean; onSelect?: () => void;
}) {
  const Icon = ICONS[icon];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start rounded-xl border p-6 text-left transition",
        selected
          ? "border-brand-500 bg-brand-50 shadow-soft ring-2 ring-brand-500/30"
          : "border-slate-200 bg-white hover:border-brand-300 hover:shadow-card"
      )}
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <h3 className="mb-1 text-lg font-bold text-ink">{name}</h3>
      <p className="text-sm text-slate-600">{description}</p>
      {selected && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
          <Check className="h-4 w-4" /> Selected
        </span>
      )}
    </button>
  );
}

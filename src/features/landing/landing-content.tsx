"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Target, Users, CheckCircle2, X } from "lucide-react";
import { CategoryCard } from "@/features/landing/category-card";
import { CommissionCard } from "@/features/landing/commission-card";
import { CATEGORIES, COMMISSIONS, ACADEMIC_SUBCATEGORIES, type Category } from "@/features/landing/mock-data";

export function LandingContent() {
  const [category, setCategory] = useState<Category | null>("Academic");
  const [sub, setSub] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return COMMISSIONS.filter((c) =>
      (!category || c.category === category) && (!sub || c.subcategory === sub)
    );
  }, [category, sub]);

  return (
    <>
      <section className="bg-brand-50/60">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Find Skilled Students,{" "}
            <span className="text-brand-500">Get Things Done</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
            CSU&apos;s trusted commission marketplace — academic, technical, and general errands.
          </p>
          <div className="mt-8">
            <Link href="/browse" className="btn-primary !px-7 !py-3 text-base">
              Explore Commissions <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Browse by Category</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.name}
              name={c.name}
              description={c.description}
              icon={c.icon}
              selected={category === c.name}
              onSelect={() => { setCategory(category === c.name ? null : (c.name as Category)); setSub(null); }}
            />
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-3 text-center">
            <h2 className="text-3xl font-bold">
              {category ? `${category} Commissions` : "All Commissions"}
            </h2>
            <p className="mt-2 text-slate-600">
              {category === "Academic"
                ? "Browse academic opportunities from students looking for help"
                : category === "Technical"
                ? "Programming, design, and technical work"
                : category === "General Errands"
                ? "Quick tasks and errands around campus"
                : "All available commissions across categories"}
            </p>
          </div>

          {(category || sub) && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => { setCategory(null); setSub(null); }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Clear Filter
              </button>
            </div>
          )}

          {category === "Academic" && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-medium text-slate-500">Filter by subcategory:</p>
              <div className="flex flex-wrap gap-2">
                {ACADEMIC_SUBCATEGORIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSub(sub === s ? null : s)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      sub === s ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c) => (
              <CommissionCard key={c.id} c={c} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-slate-500">
              No commissions match your filter. Try clearing it.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="mb-14 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-12 md:grid-cols-3">
          {[
            { n: 1, icon: Target, title: "Post a Task", desc: "Describe what you need and set your budget" },
            { n: 2, icon: Users, title: "Find a Student", desc: "Review applications from skilled CSU students" },
            { n: 3, icon: CheckCircle2, title: "Get It Done", desc: "Work together and complete your commission" },
          ].map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="text-center">
              <div className="relative mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-9 w-9" strokeWidth={2} />
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {n}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

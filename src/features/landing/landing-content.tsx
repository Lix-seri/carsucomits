/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, Code2, ShoppingCart, Target, Users } from "lucide-react";

const CATEGORIES = [
  { value: "ACADEMIC", name: "Academic", description: "Tutoring and study help", icon: BookOpen },
  { value: "TECHNICAL", name: "Technical", description: "Programming, design, tech", icon: Code2 },
  { value: "GENERAL_ERRANDS", name: "General Errands", description: "Deliveries, purchases, campus tasks", icon: ShoppingCart },
  { value: "ADMINISTRATIVE", name: "Administrative", description: "Documents, data entry, events", icon: ClipboardList },
];

const STEPS = [
  { icon: Target, title: "Post a Task", desc: "Describe what you need and set your budget" },
  { icon: Users, title: "Find a Student", desc: "Review applications from skilled CSU students" },
  { icon: CheckCircle2, title: "Get It Done", desc: "Work together and complete your commission" },
];

/** Home page sections. `latest` is the grid of real open commissions, composed by the page. */
export function LandingContent({ latest }: { latest: React.ReactNode }) {
  return (
    <>
      <section className="bg-brand-50/60">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Find Skilled Students, <span className="text-brand-500">Get Things Done</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
            CSU&apos;s trusted commission marketplace for technical work, tutoring, errands and admin help.
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ value, name, description, icon: Icon }) => (
            <Link
              key={value}
              href={`/browse?category=${value}`}
              className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-card"
            >
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <span className="mb-1 text-lg font-bold text-ink">{name}</span>
              <span className="text-sm text-slate-600">{description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold">Latest Commissions</h2>
              <p className="mt-2 text-slate-600">Open now, newest first.</p>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {latest}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
        <h2 className="mb-14 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-12 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="relative mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-9 w-9" strokeWidth={2} />
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {i + 1}
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

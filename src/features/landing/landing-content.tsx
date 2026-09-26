import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, Code2, ShoppingCart } from "lucide-react";

const CATEGORIES = [
  { value: "ACADEMIC", name: "Academic", description: "Tutoring and study help", icon: BookOpen },
  { value: "TECHNICAL", name: "Technical", description: "Programming, design, tech", icon: Code2 },
  { value: "GENERAL_ERRANDS", name: "General Errands", description: "Deliveries, purchases, campus tasks", icon: ShoppingCart },
  { value: "ADMINISTRATIVE", name: "Administrative", description: "Documents, data entry, events", icon: ClipboardList },
];

// The commission lifecycle is the product; the hero shows it instead of a stock illustration.
const STEPS = [
  { title: "Post what you need", desc: "A title, a fare and a deadline. Students see it right away." },
  { title: "Hire an applicant", desc: "Compare cover letters, ratings and finished work." },
  { title: "Review the delivery", desc: "Approve it or ask for a revision, all in one place." },
  { title: "Complete and rate", desc: "Both sides rate each other, so reputations are earned." },
];

/** Home page sections. `latest` is the grid of real open commissions, composed by the page. */
export function LandingContent({ latest }: { latest: React.ReactNode }) {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-700">For students of CSU Main</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Get it done by a fellow CSU Main student.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Post a task, hire a classmate who&apos;s good at it, and pay what you agreed. Tutoring, tech work, errands and paperwork, all inside campus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/browse" className="btn-primary">
                Browse commissions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/hiring/post" className="btn-secondary">Post a commission</Link>
            </div>
          </div>

          <ol id="how-it-works" aria-label="How it works" className="scroll-mt-20 rounded-xl border border-line bg-canvas p-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-lg p-4">
                <span className="tabular grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brand-200 bg-surface text-sm font-semibold text-brand-700">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="categories" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 id="categories" className="mb-5 text-2xl font-semibold tracking-tight">Browse by category</h2>
        <div className="grid overflow-hidden rounded-xl border border-line bg-surface sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ value, name, description, icon: Icon }) => (
            <Link
              key={value}
              href={`/browse?category=${value}`}
              className="group flex items-start gap-3 border-b border-line p-5 transition-colors hover:bg-sunken sm:border-r lg:border-b-0"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span>
                <span className="block font-semibold group-hover:text-brand-700">{name}</span>
                <span className="block text-sm text-muted">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="latest" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="latest" className="text-2xl font-semibold tracking-tight">Open now</h2>
            <p className="mt-1 text-muted">The newest commissions waiting for someone.</p>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {latest}
      </section>
    </>
  );
}

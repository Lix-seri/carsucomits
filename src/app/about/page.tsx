import Link from "next/link";
import { Mail, ShieldCheck, Star, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata = { title: "About" };

const VALUES = [
  { icon: Mail, title: "A @carsu.edu.ph email is required", desc: "Every account must use an official @carsu.edu.ph address, so the marketplace stays inside the university." },
  { icon: Star, title: "Reputation-based trust", desc: "Two-way ratings and reviews make accountability real. Accounts whose average falls below 3 stars are flagged for admin review." },
  { icon: ShieldCheck, title: "Protection against ghosting", desc: "Anyone can report ghosting, scams or misconduct, and admins can warn, suspend or ban accounts." },
  { icon: Users, title: "Built by CSU Main students, for CSU Main", desc: "A university-exclusive gig economy that gives students professional experience and extra income." },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">About CarSUComits</h1>
        <p className="mt-4 text-lg text-muted">
          A student-built commission marketplace for Caraga State University – Main Campus. Not an official university site.
        </p>

        <section aria-labelledby="mission" className="mt-12">
          <h2 id="mission" className="mb-3 text-2xl font-semibold tracking-tight">Our mission</h2>
          <p className="leading-7">
            Many CSU Main students have valuable, marketable skills: graphic design, programming, tutoring and more.
            But there&apos;s no formal place to offer them safely. Random Facebook posts and word of mouth lead to
            scams, ghosting and lost opportunities. CarSUComits centralizes the commissioning process in one
            dashboard, requires a @carsu.edu.ph email for every account, and standardizes skill levels and fair fares, so
            students can build reputation and income in a trusted, university-exclusive environment.
          </p>
        </section>

        <section aria-labelledby="different" className="mt-12">
          <h2 id="different" className="mb-5 text-2xl font-semibold tracking-tight">What makes us different</h2>
          <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <dt className="font-semibold">{title}</dt>
                  <dd className="mt-1 text-sm text-muted">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="join" className="mt-12 rounded-xl border border-line bg-surface p-6">
          <h2 id="join" className="text-xl font-semibold">Ready to join?</h2>
          <p className="mt-1 text-muted">Sign up with your @carsu.edu.ph email and start posting or applying for commissions.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">Create an account</Link>
            <Link href="/browse" className="btn-secondary">Browse commissions</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import { ShieldCheck, Star, Mail, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const VALUES = [
  { icon: Mail, title: "CSU Email Required", desc: "Every account must use an official @carsu.edu.ph address, so the marketplace stays inside the university." },
  { icon: Star, title: "Reputation-Based Trust", desc: "Two-way ratings and reviews make accountability real. Accounts whose average falls below 3 stars are flagged for admin review." },
  { icon: ShieldCheck, title: "Anti-Ghosting Protection", desc: "Anyone can report ghosting, scams or misconduct, and admins can warn, suspend or ban accounts." },
  { icon: Users, title: "Built by CSU, for CSU", desc: "A university-exclusive gig economy that empowers students with professional experience and supplementary income." },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="bg-brand-50/60">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">About CarsuComits</h1>
            <p className="mt-4 text-lg text-muted">
              Caraga State University&apos;s official, secure commission marketplace.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
          <p className="text-ink">
            Many CSU students have valuable, marketable skills — graphic design, programming, tutoring, and more.
            But there&apos;s no formal place to offer them safely. Random Facebook posts and word-of-mouth lead to
            scams, ghosting, and lost opportunities. CarsuComits centralizes the commissioning process through a
            unified dashboard, requires a CSU email for every account, and standardizes skill levels and fair fares — so
            students can build reputation and income in a trusted, university-exclusive environment.
          </p>
        </section>

        <section className="bg-sunken">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="mb-10 text-center text-3xl font-bold">What Makes Us Different</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card">
                  <div className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold">{title}</h3>
                  <p className="text-sm text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">Ready to join?</h2>
          <p className="mt-3 text-muted">Sign up with your CSU email and start posting or applying for commissions today.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/register" className="btn-primary">Create an Account</Link>
            <Link href="/browse" className="btn-outline">Browse Commissions</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

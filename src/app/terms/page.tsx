import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = { title: "Terms of use" };

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "who",
    title: "Who can use CarsuComits",
    body: (
      <p>
        Students, faculty and staff of Caraga State University – Main Campus with an official <strong>@carsu.edu.ph</strong> email address. One
        account per person. You are responsible for everything done with your account.
      </p>
    ),
  },
  {
    id: "academic-work",
    title: "No academic work for someone else",
    body: (
      <>
        <p>
          CarsuComits is for legitimate services: tutoring that helps someone learn, design, programming, errands, events and
          administrative help. <strong>It is not a place to buy or sell graded academic work.</strong> The following are not allowed,
          whether you post them or take them on:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Writing or completing a thesis, capstone project, research paper, term paper or dissertation for someone else.</li>
          <li>Doing graded assignments, essays, lab reports, problem sets, quizzes or exams for someone else.</li>
          <li>Taking an online class, quiz or exam in someone else&apos;s place.</li>
        </ul>
        <p>
          Explaining a topic, reviewing someone&apos;s own draft and giving feedback, or teaching a skill is fine. Doing the graded
          work for them is not. Posts that break this rule are removed, and the accounts involved can be suspended. If you see one,
          use <strong>Report</strong> on the commission.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "How to behave",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Describe tasks honestly, and deliver what you agreed to.</li>
        <li>No scams, harassment, hate speech or explicit content.</li>
        <li>Don&apos;t ask to move payment or communication off the platform to avoid accountability.</li>
        <li>Ratings and reports must be honest. Retaliating against someone for a rating or report is not allowed.</li>
      </ul>
    ),
  },
  {
    id: "payments",
    title: "Payments",
    body: (
      <p>
        CarsuComits does not process payments. The fare on a commission is agreed between the two people involved, who are
        responsible for settling it.
      </p>
    ),
  },
  {
    id: "moderation",
    title: "Moderation",
    body: (
      <p>
        Admins review reports and flagged content, and can remove posts and warn, suspend or ban accounts that break these terms.
        Accounts whose average rating falls below 3 stars are flagged for review.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold">Terms of Use</h1>
        <p className="mt-3 text-muted">
          The rules for using CarsuComits. By creating an account you agree to them. Questions go to the admins through{" "}
          <Link href="/reports" className="font-semibold text-brand-600 hover:underline">Reports</Link>.
        </p>
        <div className="mt-10 space-y-10">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-bold">
                {i + 1}. {s.title}
              </h2>
              <div className="space-y-3 text-ink/80">{s.body}</div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
